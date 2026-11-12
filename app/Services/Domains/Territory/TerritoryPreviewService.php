<?php

namespace App\Services\Domains\Territory;

use App\Services\Domains\Territory\Config\TerritoryDataService;
use App\Services\Domains\Territory\Config\Geocoders\NominatimGeocoder;
use App\Services\Domains\Territory\Config\Geocoders\OverpassGeocoder;
use Throwable;

class TerritoryPreviewService
{
    public function __construct(
        protected TerritoryDataService $territoryData,
        protected TerritoryRepository $repo,
        protected OverpassGeocoder $overpass,
    ) {}

    /**
     * Único ensamblador: arma todo el payload (selects, cards, foco del mapa,
     * detalle de barrio, markers) según el nivel más profundo seleccionado.
     * Cada pieza la resuelve su propio método; el repo solo responde conteos
     * (operados) y markers, nunca arma el payload él mismo.
     */
    public function resolve(?string $countryCode, ?string $stateCode, ?string $cityCode, ?string $neighborhoodOsmId): array
    {
        $countryCode = $countryCode ? strtoupper($countryCode) : null;

        $countries = $this->countries();

        $states = $countryCode ? $this->states($countryCode) : [];
        $stateMatch = $stateCode ? collect($states)->firstWhere('value', $stateCode) : null;
        $stateName = $stateMatch['label'] ?? null;

        $cities = ($countryCode && $stateCode) ? $this->cities($countryCode, $stateCode) : [];
        $cityMatch = $cityCode ? collect($cities)->firstWhere('value', $cityCode) : null;
        $cityName = $cityMatch['label'] ?? null;

        $neighborhoods = ($countryCode && $stateName && $cityName)
            ? $this->neighborhoods($countryCode, $stateName, $cityName)
            : [];

        $neighborhoodDetail = null;
        if ($neighborhoodOsmId) {
            $match = collect($neighborhoods)->firstWhere('value', $neighborhoodOsmId);
            if ($match) {
                $neighborhoodDetail = $this->neighborhoodDetail(
                    $neighborhoodOsmId,
                    $match['label'],
                    $countryCode,
                    $stateName,
                    $cityName,
                );
            }
        }

        // Id del nivel más profundo ya elegido, para markers (único uso de Eloquent acá, vía repo)
        $parentId = null;
        if ($countryCode) {
            $countryName = $this->territoryData->getCountryName($countryCode);
            $parentId = $this->repo->resolveId('country', $countryName);
        }
        if ($parentId && $stateName) {
            $parentId = $this->repo->resolveId('state', $stateName, $parentId);
        }
        if ($parentId && $cityName) {
            $parentId = $this->repo->resolveId('city', $cityName, $parentId);
        }

        return [
            'selection' => [
                'country'      => $countryCode,
                'state'        => $stateCode,
                'city'         => $cityCode,
                'neighborhood' => $neighborhoodOsmId,
            ],
            'countries'     => $countries,
            'states'        => $states,
            'cities'        => $cities,
            'neighborhoods' => $neighborhoods,
            'cards'         => $this->levelCards($countryCode, $stateCode, $cityCode, $countries, $states, $cities, $neighborhoods),
            'focus'         => $this->focusPoint($countryCode, $stateName, $cityName),
            'markers'       => $this->repo->markers($parentId),
            'neighborhood'  => $neighborhoodDetail,
        ];
    }

    /**
     * 1. Países soportados
     */
    public function countries(): array
    {
        $supported = $this->territoryData->supportedCountries();
        $operated = $this->repo->operatedCodes('country');

        return collect($supported)
            ->map(fn ($name, $code) => [
                'value'  => $code,
                'label'  => $name,
                'active' => in_array($code, $operated, true),
            ])
            ->values()
            ->all();
    }

    /**
     * 2. Estados/provincias (catálogo real del geocoder del país)
     */
    public function states(string $countryCode): array
    {
        $geocoder = $this->territoryData->forCountry($countryCode);
        $catalogo = $geocoder->listStates();
        if (empty($catalogo)) {
            return [];
        }

        $countryName = $this->territoryData->getCountryName($countryCode);
        $countryId = $this->repo->resolveId('country', $countryName);

        $nombres = array_column($catalogo, 'name');
        $operados = $this->repo->operatedNamesUnder('state', $nombres, $countryId);

        return collect($catalogo)
            ->map(fn ($s) => [
                'value'  => $s['abbr'] ?? $s['code'],
                'label'  => $s['name'],
                'active' => in_array($s['name'], $operados, true),
            ])
            ->values()
            ->all();
    }

    /**
     * 3. Ciudades/municipios (catálogo real del geocoder del país)
     */
    public function cities(string $countryCode, string $stateAbbr): array
    {
        $geocoder = $this->territoryData->forCountry($countryCode);
        $estados = $geocoder->listStates();
        $estado = collect($estados)->firstWhere('abbr', strtoupper($stateAbbr));
        if (! $estado) {
            return [];
        }

        $catalogo = $geocoder->listCities($stateAbbr);
        if (empty($catalogo)) {
            return [];
        }

        $countryName = $this->territoryData->getCountryName($countryCode);
        $countryId = $this->repo->resolveId('country', $countryName);
        $stateId = $countryId ? $this->repo->resolveId('state', $estado['name'], $countryId) : null;

        $nombres = array_column($catalogo, 'name');
        $operados = $this->repo->operatedNamesUnder('city', $nombres, $stateId);

        return collect($catalogo)
            ->map(fn ($c) => [
                'value'  => $c['code'],
                'label'  => $c['name'],
                'active' => in_array($c['name'], $operados, true),
            ])
            ->values()
            ->all();
    }

    /**
     * 4. Barrios (único nivel que usa Overpass, no catálogo administrativo)
     */
    public function neighborhoods(string $countryCode, string $stateName, string $cityName): array
    {
        $catalogo = $this->overpass->listNeighborhoods($cityName, $stateName);
        if (empty($catalogo)) {
            return [];
        }

        $countryName = $this->territoryData->getCountryName($countryCode);
        $countryId = $this->repo->resolveId('country', $countryName);
        $stateId = $countryId ? $this->repo->resolveId('state', $stateName, $countryId) : null;
        $cityId = $stateId ? $this->repo->resolveId('city', $cityName, $stateId) : null;

        $nombres = array_column($catalogo, 'name');
        $operados = $this->repo->operatedNamesUnder('neighborhood', $nombres, $cityId);

        return collect($catalogo)
            ->map(fn ($n) => [
                'value'  => $n['osm_id'],
                'label'  => $n['name'],
                'active' => in_array($n['name'], $operados, true),
            ])
            ->values()
            ->all();
    }

    /**
     * Punto (lat/lng) para centrar el mapa en el nivel más profundo elegido
     * (ciudad > estado > país), aunque todavía no haya nada operado ahí.
     * Si la consulta externa falla, null — el frontend cae a su propio default.
     */
    public function focusPoint(?string $countryCode, ?string $stateName, ?string $cityName): ?array
    {
        if (! $countryCode) {
            return null;
        }

        $geocoder = $this->territoryData->forCountry($countryCode);

        try {
            if ($cityName) {
                $info = $geocoder->getCityInfo($cityName, $stateName);
            } elseif ($stateName) {
                $info = $geocoder->getStateInfo($stateName, $countryCode);
            } else {
                $countryName = $this->territoryData->getCountryName($countryCode);
                $info = $geocoder->getCountryInfo($countryName);
            }
        } catch (Throwable $e) {
            return null;
        }

        if (empty($info['latitude']) || empty($info['longitude'])) {
            return null;
        }

        return ['lat' => (float) $info['latitude'], 'lng' => (float) $info['longitude']];
    }

    /**
     * Detalle del barrio puntual elegido: si ya es nuestro, viene de la DB
     * (con su polígono ya guardado); si es nuestro pero le falta el polígono,
     * o si no es nuestro todavía, se agotan las fuentes oficiales (Nominatim)
     * antes de resignarse a que el usuario lo dibuje a mano. Único nivel
     * donde se pide geojson completo, no solo un punto. El lat/lng SIEMPRE
     * se completa (centroide si es Polygon/MultiPolygon) para que el mapa
     * pueda centrarse en el barrio exacto, no solo en la ciudad.
     */
    public function neighborhoodDetail(string $osmId, string $name, string $countryCode, string $stateName, string $cityName): array
    {
        $countryName = $this->territoryData->getCountryName($countryCode);
        $countryId = $this->repo->resolveId('country', $countryName);
        $stateId = $countryId ? $this->repo->resolveId('state', $stateName, $countryId) : null;
        $cityId = $stateId ? $this->repo->resolveId('city', $cityName, $stateId) : null;
        $neighborhoodId = $cityId ? $this->repo->resolveId('neighborhood', $name, $cityId) : null;

        if ($neighborhoodId) {
            $territorio = $this->repo->findById($neighborhoodId);
            if ($territorio) {
                $polygon = $territorio->polygon;
                $lat = $territorio->latitude ? (float) $territorio->latitude : null;
                $lng = $territorio->longitude ? (float) $territorio->longitude : null;

                if (! $polygon) {
                    $geojson = $this->officialGeometry($osmId, $name, $cityName, $stateName);
                    if ($geojson) {
                        $polygon = $geojson;
                    }
                }

                if ($polygon && $lat === null) {
                    [$lat, $lng] = $this->centroidOf($polygon);
                }

                return [
                    'id'       => $territorio->id,
                    'osm_id'   => $osmId,
                    'name'     => $territorio->name,
                    'operated' => true,
                    'polygon'  => $polygon,
                    'lat'      => $lat,
                    'lng'      => $lng,
                ];
            }
        }

        $geojson = $this->officialGeometry($osmId, $name, $cityName, $stateName);
        [$lat, $lng] = $geojson ? $this->centroidOf($geojson) : [null, null];

        return [
            'id'       => null,
            'osm_id'   => $osmId,
            'name'     => $name,
            'operated' => false,
            'polygon'  => $geojson,
            'lat'      => $lat,
            'lng'      => $lng,
        ];
    }

    /**
     * Mejor geometría oficial disponible para un barrio sin polígono guardado:
     * primero el nodo puntual (lookupByOsmId), y si ese no trae límite real,
     * una búsqueda por nombre que pueda encontrar una relación administrativa
     * distinta (searchBoundary).
     */
    private function officialGeometry(string $osmId, string $name, string $cityName, string $stateName): ?array
    {
        $nominatim = new NominatimGeocoder();
        $geojson = $nominatim->lookupByOsmId($osmId);

        if (! $geojson || ! in_array($geojson['type'] ?? null, ['Polygon', 'MultiPolygon'], true)) {
            $oficial = $nominatim->searchBoundary($name, $cityName, $stateName);
            if ($oficial) {
                return $oficial;
            }
        }

        return $geojson;
    }

    /**
     * Lat/lng de cualquier geometría: directo si es Point, centroide
     * (promedio de vértices del anillo exterior) si es Polygon/MultiPolygon.
     */
    private function centroidOf(array $geojson): array
    {
        $type = $geojson['type'] ?? null;

        if ($type === 'Point') {
            [$lng, $lat] = $geojson['coordinates'];
            return [(float) $lat, (float) $lng];
        }

        $ring = match ($type) {
            'Polygon'      => $geojson['coordinates'][0] ?? [],
            'MultiPolygon' => $geojson['coordinates'][0][0] ?? [],
            default        => [],
        };

        if (empty($ring)) {
            return [null, null];
        }

        $sumLat = 0;
        $sumLng = 0;
        $n = count($ring);

        foreach ($ring as [$lng, $lat]) {
            $sumLat += $lat;
            $sumLng += $lng;
        }

        return [$sumLat / $n, $sumLng / $n];
    }

    /**
     * Cards de navegación: detectados vs. operados vs. % cobertura,
     * del nivel que corresponda según hasta dónde se llegó.
     */
    private function levelCards(?string $country, ?string $state, ?string $city, array $countries, array $states, array $cities, array $neighborhoods): array
    {
        [$label, $items] = match (true) {
            (bool) $city    => ['Bairros', $neighborhoods],
            (bool) $state   => ['Cidades', $cities],
            (bool) $country => ['Estados', $states],
            default         => ['Países', $countries],
        };

        $detectados = count($items);
        $operados = collect($items)->where('active', true)->count();
        $pct = $detectados > 0 ? round($operados / $detectados * 100) : 0;

        return [
            ['label' => "{$label} detectados", 'value' => $detectados, 'tone' => 'amber'],
            ['label' => "{$label} operados", 'value' => $operados, 'tone' => 'teal'],
            ['label' => 'Cobertura', 'value' => "{$pct}%", 'tone' => 'orange'],
        ];
    }
}
