<?php

namespace App\Services\Domains\Territory\Config\Geocoders;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class NominatimGeocoder implements TerritoryGeocoder
{
    private string $countryName = 'Brasil';

    public function setCountry(string $countryName): static
    {
        $this->countryName = $countryName;
        return $this;
    }

    public function getCountryInfo(string $name): array
    {
        $key = 'kubix:nominatim:country:' . md5(mb_strtolower($name));
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $resp = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
            ->timeout(10)
            ->get('https://nominatim.openstreetmap.org/search', [
                'q'               => $name,
                'format'          => 'json',
                'limit'           => 1,
                'polygon_geojson' => 1,
            ]);

        if (! $resp->successful() || empty($resp->json())) {
            return [
                'latitude'  => null,
                'longitude' => null,
                'country'   => $name,
                'source'    => 'Nominatim',
            ];
        }

        $item = $resp->json()[0];

        $info = [
            'latitude'  => isset($item['lat']) ? (float) $item['lat'] : null,
            'longitude' => isset($item['lon']) ? (float) $item['lon'] : null,
            'country'   => $name,
            'source'    => 'Nominatim',
            'boundary'  => $item['geojson'] ?? null,
        ];

        if ($info['latitude'] !== null) {
            Cache::put($key, $info, now()->addDays(30));
        }

        return $info;
    }

    public function getStateInfo(string $name, string $countryCode = 'BR'): array
    {
        $query = trim($name) . ", {$this->countryName}";
        $key = 'kubix:nominatim:state:' . md5(mb_strtolower($query));
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $resp = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
            ->timeout(10)
            ->get('https://nominatim.openstreetmap.org/search', [
                'q'               => $query,
                'format'          => 'json',
                'limit'           => 1,
                'addressdetails'  => 1,
                'polygon_geojson' => 1,
                'featureClass'    => 'A',
            ]);

        if (! $resp->successful() || empty($resp->json())) {
            return [
                'latitude'  => null,
                'longitude' => null,
                'state'     => trim($name),
                'country'   => $this->countryName,
                'source'    => 'Nominatim',
            ];
        }

        $item = $resp->json()[0];
        $addr = $item['address'] ?? [];

        $info = [
            'latitude'   => isset($item['lat']) ? (float) $item['lat'] : null,
            'longitude'  => isset($item['lon']) ? (float) $item['lon'] : null,
            'state'      => $addr['state'] ?? $addr['region'] ?? trim($name),
            'state_abbr' => $addr['ISO3166-2-lvl4'] ?? null,
            'country'    => $addr['country'] ?? $this->countryName,
            'source'     => 'Nominatim',
            'boundary'   => $item['geojson'] ?? null,
        ];

        if ($info['latitude'] !== null) {
            Cache::put($key, $info, now()->addDays(30));
        }

        return $info;
    }

    public function getCityInfo(string $name, ?string $stateName = null): array
    {
        $query = $stateName
            ? "{$name}, {$stateName}, {$this->countryName}"
            : "{$name}, {$this->countryName}";
        $key = 'kubix:nominatim:city:' . md5(mb_strtolower($query));
        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $resp = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
            ->timeout(10)
            ->get('https://nominatim.openstreetmap.org/search', [
                'q'               => $query,
                'format'          => 'json',
                'limit'           => 1,
                'addressdetails'  => 1,
                'polygon_geojson' => 1,
            ]);

        if (! $resp->successful() || empty($resp->json())) {
            return [
                'latitude'  => null,
                'longitude' => null,
                'state'     => $stateName,
                'country'   => $this->countryName,
                'source'    => 'Nominatim',
            ];
        }

        $item = $resp->json()[0];
        $addr = $item['address'] ?? [];

        $info = [
            'latitude'   => isset($item['lat']) ? (float) $item['lat'] : null,
            'longitude'  => isset($item['lon']) ? (float) $item['lon'] : null,
            'state'      => $addr['state'] ?? $addr['region'] ?? $stateName,
            'state_abbr' => $addr['ISO3166-2-lvl4'] ?? null,
            'country'    => $addr['country'] ?? $this->countryName,
            'source'     => 'Nominatim',
            'boundary'   => $item['geojson'] ?? null,
        ];

        if ($info['latitude'] !== null) {
            Cache::put($key, $info, now()->addDays(30));
        }

        return $info;
    }

    /**
     * Nominatim no expone un catálogo administrativo exhaustivo como IBGE.
     * Se devuelve vacío a propósito: no se inventa un listado falso.
     */
    public function listStates(): array
    {
        $key = 'kubix:nominatim:states:' . md5(mb_strtolower($this->countryName));
        if ($cached = Cache::get($key)) {
            return $cached;
        }

        try {
            $resp = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
                ->timeout(15)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'country' => $this->countryName,
                    'featureType' => 'state',
                    'format' => 'json',
                    'limit' => 50,
                ]);

            if (! $resp->successful() || empty($resp->json())) {
                return [];
            }

            $states = collect($resp->json())
                ->map(fn($item) => [
                    'code' => $item['osm_id'] ?? $item['place_id'],
                    'abbr' => $item['address']['state_code'] ?? null,
                    'name' => $item['name'] ?? explode(',', $item['display_name'])[0],
                ])
                ->filter(fn($s) => !empty($s['name']))
                ->unique('name')
                ->sortBy('name')
                ->values()
                ->all();

            if (!empty($states)) {
                Cache::put($key, $states, now()->addDays(30));
            }

            return $states;
        } catch (\Throwable $e) {
            return [];
        }
    }

    public function listCities(string $stateName): array
    {
        $key = 'kubix:nominatim:cities:' . md5(mb_strtolower("{$this->countryName}:{$stateName}"));
        if ($cached = Cache::get($key)) {
            return $cached;
        }

        try {
            $resp = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
                ->timeout(15)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'state' => $stateName,
                    'country' => $this->countryName,
                    'format' => 'json',
                    'limit' => 100,
                ]);

            // Respaldo de texto libre si la consulta estructurada viene vacía
            if (! $resp->successful() || empty($resp->json())) {
                $resp = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
                    ->timeout(15)
                    ->get('https://nominatim.openstreetmap.org/search', [
                        'q' => "cities in {$stateName}, {$this->countryName}",
                        'format' => 'json',
                        'limit' => 100,
                    ]);
            }

            if (! $resp->successful() || empty($resp->json())) {
                return [];
            }

            $cities = collect($resp->json())
                ->map(fn($item) => [
                    'code' => (string) ($item['osm_id'] ?? $item['place_id']),
                    'name' => $item['name'] ?? explode(',', $item['display_name'])[0],
                ])
                ->filter(fn($c) => !empty($c['name']))
                ->unique('name')
                ->sortBy('name')
                ->values()
                ->all();

            if (!empty($cities)) {
                Cache::put($key, $cities, now()->addDays(30));
            }

            return $cities;
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * Resuelve la geometría de un elemento OSM puntual por su id
     * ("relation/123", "way/45", "node/6"). Se usa después de que
     * Overpass lista los barrios, para traer el polígono real de uno puntual.
     */
    public function lookupByOsmId(string $osmId): ?array
    {
        [$type, $id] = array_pad(explode('/', $osmId, 2), 2, null);
        $prefix = ['relation' => 'R', 'way' => 'W', 'node' => 'N'][$type] ?? null;
        if (! $prefix || ! $id) {
            return null;
        }

        $key = 'kubix:nominatim:lookup:' . $prefix . $id;
        if ($cached = Cache::get($key)) {
            return $cached;
        }

        $resp = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
            ->timeout(15)
            ->get('https://nominatim.openstreetmap.org/lookup', [
                'osm_ids'         => $prefix . $id,
                'polygon_geojson' => 1,
                'format'          => 'json',
            ]);

        $geo = $resp->successful() ? ($resp->json()[0]['geojson'] ?? null) : null;
        if ($geo) {
            Cache::put($key, $geo, now()->addDays(30));
        }

        return $geo;
    }

    /**
     * Cuando el nodo puntual (lookupByOsmId) no tiene límite propio, busca por
     * nombre una relación administrativa distinta con ese mismo nombre que sí
     * pueda traer el polígono oficial (ej. "Cachoeirinha, Manaus, Amazonas").
     */
    public function searchBoundary(string $name, string $cityName, string $stateName): ?array
    {
        $query = "{$name}, {$cityName}, {$stateName}, {$this->countryName}";
        $key = 'kubix:nominatim:search:' . md5(mb_strtolower($query));

        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $resp = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
            ->timeout(15)
            ->get('https://nominatim.openstreetmap.org/search', [
                'q'               => $query,
                'format'          => 'json',
                'limit'           => 5,
                'polygon_geojson' => 1,
            ]);

        if (! $resp->successful()) {
            return null;
        }

        $match = collect($resp->json())
            ->first(fn($item) => in_array($item['geojson']['type'] ?? null, ['Polygon', 'MultiPolygon'], true));

        $geo = $match['geojson'] ?? null;

        if ($geo) {
            Cache::put($key, $geo, now()->addDays(30));
        }

        return $geo;
    }
}
