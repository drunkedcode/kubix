<?php

namespace App\Services\Domains\Territory\Config\Geocoders;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Class OverpassGeocoder
 *
 * Cliente dedicado a Overpass (overpass-api.de), usado para listar
 * barrios dentro de una ciudad. No implementa TerritoryGeocoder porque
 * trabaja a nivel de barrio, no país/estado/ciudad.
 */
class OverpassGeocoder
{
    /**
     * La instancia pública de overpass-api.de es lenta/inestable seguido.
     * Se prueba con un espejo de respaldo antes de resignarse a lista vacía.
     */
    private const ENDPOINTS = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
    ];

    /**
     * Lista los barrios de una ciudad (nombre, id OSM y punto central).
     * Cachea 30 días únicamente si la respuesta fue exitosa y trajo resultados.
     * Si Overpass no responde (timeout/caído), devuelve [] en vez de romper
     * la página: el usuario puede seguir y dibujar el barrio a mano.
     *
     * @return array<int, array{osm_id:string, name:string, lat:?float, lng:?float}>
     */
    public function listNeighborhoods(string $city, ?string $state = null): array
    {
        $key = 'kubix:overpass:neighborhoods:' . mb_strtolower("{$state}:{$city}");

        if ($cached = Cache::get($key)) {
            return $cached;
        }

        $cityEsc = addcslashes($city, '"\\');

        $areaQuery = $state
            ? 'area["name"="' . addcslashes($state, '"\\') . '"]["boundary"="administrative"]["admin_level"="4"]->.s;'
              . 'area(area.s)["name"="' . $cityEsc . '"]["boundary"="administrative"]["admin_level"="8"]->.c;'
            : 'area["name"="' . $cityEsc . '"]["boundary"="administrative"]["admin_level"="8"]->.c;';

        $query = '[out:json][timeout:25];'
            . $areaQuery
            . '(relation(area.c)["boundary"="administrative"]["admin_level"="10"];'
            . 'relation(area.c)["place"~"neighbourhood|suburb|quarter"];'
            . 'node(area.c)["place"~"neighbourhood|suburb|quarter"];);'
            . 'out tags center;';

        $resp = null;

        foreach (self::ENDPOINTS as $endpoint) {
            try {
                // 35s se quedaba corto: las queries con area[] anidado
                // (buscar el límite administrativo antes de listar barrios)
                // suelen tardar ~38-40s en la instancia pública.
                $resp = Http::timeout(50)
                    ->withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
                    ->asForm()
                    ->post($endpoint, ['data' => $query]);

                if ($resp->successful()) {
                    break;
                }

                $resp = null;
            } catch (ConnectionException|Throwable $e) {
                Log::warning("Overpass no respondió ({$endpoint}): " . $e->getMessage());
                $resp = null;
            }
        }

        if (! $resp) {
            return [];
        }

        $list = collect($resp->json('elements', []))
            ->filter(fn ($e) => ! empty($e['tags']['name']))
            ->map(fn ($e) => [
                'osm_id' => "{$e['type']}/{$e['id']}",
                'name'   => $e['tags']['name'],
                'lat'    => $e['center']['lat'] ?? $e['lat'] ?? null,
                'lng'    => $e['center']['lon'] ?? $e['lon'] ?? null,
            ])
            ->unique('name')
            ->sortBy('name')
            ->values()
            ->all();

        if (! empty($list)) {
            Cache::put($key, $list, now()->addDays(30));
        }

        return $list;
    }
}
