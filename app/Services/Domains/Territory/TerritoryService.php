<?php

namespace App\Services\Domains\Territory;

use App\Models\Territory;
use Illuminate\Support\Collection;
use App\Services\Domains\Territory\Config\TerritoryDataService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class TerritoryService
{
    private const CHILD_TYPE = [
        'country' => 'state',
        'state'   => 'city',
        'city'    => 'neighborhood',
    ];

    public function __construct(
        protected TerritoryDataService $territoryData,
        protected TerritoryRepository $repo,
    ) {}

    /**
     * Da de alta un barrio resolviendo en cascada país, estado y ciudad.
     * Todo en una transacción; los geocoders solo se consultan al crear.
     */
    public function registerNeighborhood(
        string $countryCode,
        string $stateCode,
        string $cityCode,
        string $neighborhoodName,
        string $osmId,
        array $polygon,
        string $boundarySource = 'osm',
    ): Territory {
        $countryCode = strtoupper($countryCode);
        $countryName = $this->territoryData->getCountryName($countryCode);
        $geocoder = $this->territoryData->forCountry($countryCode);

        $estadoInfo = collect($geocoder->listStates())->firstWhere('abbr', strtoupper($stateCode));
        $stateName = $estadoInfo['name'] ?? $stateCode;
        $cityName = collect($geocoder->listCities($stateCode))->firstWhere('code', $cityCode)['name'] ?? null;

        if (! $cityName) {
            throw ValidationException::withMessages(['city' => 'A cidade não existe no catálogo.']);
        }

        return DB::transaction(function () use (
            $countryCode,
            $countryName,
            $stateCode,
            $stateName,
            $cityCode,
            $cityName,
            $neighborhoodName,
            $osmId,
            $polygon,
            $boundarySource,
            $geocoder,
            $estadoInfo
        ) {
            $pais = $this->repo->findOrCreate('country', $countryName, null, fn() => [
                'code'      => $countryCode,
                'latitude'  => $geocoder->getCountryInfo($countryName)['latitude'] ?? null,
                'longitude' => $geocoder->getCountryInfo($countryName)['longitude'] ?? null,
            ]);

            $estado = $this->repo->findOrCreate('state', $stateName, $pais->id, function () use ($geocoder, $stateName, $countryCode, $countryName, $estadoInfo, $stateCode) {
                $info = $geocoder->getStateInfo($stateName, $countryCode);
                if (empty($info['latitude']) || empty($info['longitude'])) {
                    $c = $this->dynamicGeocode("{$stateName}, {$countryName}");
                    $info['latitude'] = $c['lat'];
                    $info['longitude'] = $c['lng'];
                }
                return [
                    'code'      => $estadoInfo['abbr'] ?? strtoupper($stateCode),
                    'latitude'  => $info['latitude'],
                    'longitude' => $info['longitude'],
                ];
            });

            $ciudad = $this->repo->findOrCreate('city', $cityName, $estado->id, function () use ($geocoder, $cityName, $stateName, $cityCode) {
                $info = $geocoder->getCityInfo($cityName, $stateName);
                return [
                    'code'      => $cityCode,
                    'latitude'  => $info['latitude'] ?? null,
                    'longitude' => $info['longitude'] ?? null,
                ];
            });

            if ($this->repo->neighborhoodExists($ciudad->id, $osmId)) {
                throw ValidationException::withMessages(['osm_id' => 'Este bairro já está cadastrado.']);
            }

            $centroid = $this->centroidOf($polygon);

            return $this->repo->findOrCreate('neighborhood', $neighborhoodName, $ciudad->id, [
                'osm_id'          => $osmId,
                'polygon'         => $polygon,
                'boundary_source' => $boundarySource,
                'latitude'        => $centroid['lat'],
                'longitude'       => $centroid['lng'],
            ]);
        });
    }

    /**
     * Resuelve coordenadas al vuelo para cualquier estado/región del mundo usando Nominatim de respaldo.
     */
    private function dynamicGeocode(string $query): array
    {
        try {
            $response = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
                ->timeout(5)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q'      => $query,
                    'format' => 'json',
                    'limit'  => 1,
                ]);

            if ($response->successful() && !empty($response->json())) {
                $item = $response->json()[0];
                return [
                    'lat' => (float) $item['lat'],
                    'lng' => (float) $item['lon'],
                ];
            }
        } catch (\Exception $e) {
            // Silencioso ante fallos de red externos
        }

        return ['lat' => null, 'lng' => null];
    }

    /**
     * Centroide simple (promedio de vértices) del anillo exterior del polígono.
     */
    private function centroidOf(array $polygon): array
    {
        $type = $polygon['type'] ?? null;
        $ring = match ($type) {
            'Polygon'      => $polygon['coordinates'][0] ?? [],
            'MultiPolygon' => $polygon['coordinates'][0][0] ?? [],
            default        => [],
        };

        if (empty($ring)) {
            return ['lat' => null, 'lng' => null];
        }

        $sumLat = 0;
        $sumLng = 0;
        $n = count($ring);

        foreach ($ring as [$lng, $lat]) {
            $sumLat += $lat;
            $sumLng += $lng;
        }

        return ['lat' => $sumLat / $n, 'lng' => $sumLng / $n];
    }

    public function updateBoundary(int $territoryId, array $polygon): Territory
    {
        $centroid = $this->centroidOf($polygon);

        return $this->repo->updateBoundary($territoryId, $polygon, $centroid['lat'], $centroid['lng']);
    }

    /**
     * Arma el payload del Index: selects y cards de territorios, SOLO de
     * nuestra DB (los ids acá son los de nuestra propia tabla, no códigos
     * externos como en el explorador).
     */
    public function resolveIndex(?int $countryId, ?int $stateId, ?int $cityId): array
    {
        $countries = $this->indexOptions('country', null);
        $states = $countryId ? $this->indexOptions('state', $countryId) : [];
        $cities = $stateId ? $this->indexOptions('city', $stateId) : [];
        $neighborhoods = $cityId ? $this->indexOptions('neighborhood', $cityId) : [];

        $deepestId = $cityId ?? $stateId ?? $countryId;
        $deepestType = $cityId ? 'city' : ($stateId ? 'state' : ($countryId ? 'country' : null));
        $currentLevel = $deepestType ? self::CHILD_TYPE[$deepestType] : 'country';

        $children = $this->repo->childrenOf($deepestId, $currentLevel);

        return [
            'currentLevel'  => $currentLevel,
            'selection'     => [
                'country' => $countryId ? (string) $countryId : null,
                'state'   => $stateId ? (string) $stateId : null,
                'city'    => $cityId ? (string) $cityId : null,
            ],
            'countries'     => $countries,
            'states'        => $states,
            'cities'        => $cities,
            'neighborhoods' => $neighborhoods,
            'territories'   => $children->map(fn($t) => ['id' => $t->id, 'name' => $t->name, 'slug' => $t->slug, 'type' => $t->type])->values()->all(),
        ];
    }

    private function indexOptions(string $type, ?int $parentId): array
    {
        return $this->repo->childrenOf($parentId, $type)
            ->map(fn($t) => ['value' => (string) $t->id, 'label' => $t->name, 'active' => true])
            ->values()
            ->all();
    }

    public function find(int $id): ?Territory
    {
        return $this->repo->findById($id);
    }

    /** Ids del territorio y de todos sus descendientes. */
    public function subtreeIds(Territory $territory): array
    {
        return $this->repo->subtreeIds($territory);
    }

    /** Hijos directos activos (un escalón más abajo); el barrio no tiene. */
    public function children(Territory $territory): Collection
    {
        $childType = self::CHILD_TYPE[$territory->type] ?? null;

        return $childType
            ? $this->repo->childrenOf($territory->id, $childType)->where('status', 'active')->values()
            : collect();
    }

    public function updateSettings(Territory $territory, array $settings): Territory
    {
        return $this->repo->updateSettings($territory, $settings);
    }

    /** Nombres de los ancestros, del más cercano al más lejano (ej: ciudad, estado, país). */
    public function ancestorNames(Territory $territory, int $limit = 2): array
    {
        $ids = array_filter(
            explode('/', (string) $territory->path),
            fn ($id) => $id !== '' && (int) $id !== $territory->id,
        );

        return collect(array_reverse(array_values($ids)))
            ->take($limit)
            ->map(fn ($id) => $this->find((int) $id)?->name)
            ->filter()
            ->values()
            ->all();
    }
}
