<?php

namespace App\Services\Domains\Territory\Config\Geocoders;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class IbgeGeocoder implements TerritoryGeocoder
{
    /**
     * Obtiene información básica del país Brasil.
     */
    public function getCountryInfo(string $name): array
    {
        return [
            'latitude'        => -14.2350,
            'longitude'       => -51.9253,
            'country'         => 'Brasil',
            'state'           => null,
            'state_abbr'      => null,
            'population'      => null,
            'population_year' => null,
            'source'          => 'IBGE',
        ];
    }

    /**
     * Consulta la API oficial de localidades del IBGE para estados de Brasil.
     * El IBGE no trae coordenadas de estados, así que se completan con Nominatim.
     */
    public function getStateInfo(string $name, string $countryCode = 'BR'): array
    {
        $estados = Cache::remember('ibge:estados', now()->addDays(30), function () {
            return Http::timeout(15)
                ->get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
                ->json();
        });

        $busqueda = Str::of($name)->trim()->lower()->ascii()->toString();

        foreach ($estados as $e) {
            $nombre = Str::of($e['nome'])->lower()->ascii()->toString();
            $sigla  = Str::of($e['sigla'])->lower()->toString();

            if ($nombre === $busqueda || $sigla === $busqueda) {
                $coords = $this->geocode($e['nome']);

                return [
                    'latitude'   => $coords['latitude'] ?? null,
                    'longitude'  => $coords['longitude'] ?? null,
                    'state'      => $e['nome'],
                    'state_abbr' => $e['sigla'],
                    'country'    => 'Brasil',
                    'source'     => 'IBGE + Nominatim',
                ];
            }
        }

        return [
            'latitude'   => null,
            'longitude'  => null,
            'state'      => trim($name),
            'state_abbr' => null,
            'country'    => 'Brasil',
            'source'     => 'IBGE',
        ];
    }

    /**
     * Obtiene datos de municipios, códigos oficiales de IBGE y población en Brasil.
     */
    public function getCityInfo(string $name, ?string $stateName = null): array
    {
        $coordinates = $this->geocode($name, $stateName);
        $municipio   = $this->findMunicipio($name);
        $population  = $municipio ? $this->getPopulation($municipio['id']) : null;

        return [
            'latitude'        => $coordinates['latitude'] ?? null,
            'longitude'       => $coordinates['longitude'] ?? null,
            'state'           => $municipio['state'] ?? $stateName,
            'state_abbr'      => $municipio['state_abbr'] ?? null,
            'country'         => 'Brasil',
            'id'              => $municipio['id'] ?? null,
            'population'      => $population,
            'population_year' => $population ? 2022 : null,
            'source'          => 'IBGE + Nominatim',
        ];
    }

    /**
     * Centroide por nombre vía Nominatim (el IBGE no trae lat/lng ni de
     * estados ni de municipios). Cacheado 30 días por query.
     */
    private function geocode(string $cityName, ?string $stateName = null): ?array
    {
        $query = $stateName ? "{$cityName}, {$stateName}, Brasil" : "{$cityName}, Brasil";
        $key = 'ibge:geocode:' . md5(mb_strtolower($query));

        if (Cache::has($key)) {
            return Cache::get($key);
        }

        $response = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])
            ->timeout(10)
            ->get('https://nominatim.openstreetmap.org/search', [
                'q'      => $query,
                'format' => 'json',
                'limit'  => 1,
            ]);

        if (! $response->successful() || empty($response->json())) {
            return null;
        }

        $result = $response->json()[0];
        $coords = [
            'latitude'  => (float) $result['lat'],
            'longitude' => (float) $result['lon'],
        ];

        Cache::put($key, $coords, now()->addDays(30));

        return $coords;
    }

    private function findMunicipio(string $cityName): ?array
    {
        $municipios = Cache::remember('ibge:municipios', now()->addDay(), function () {
            $response = Http::timeout(15)
                ->get('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
            return $response->successful() ? $response->json() : [];
        });

        $target = Str::of($cityName)->lower()->ascii()->toString();

        foreach ($municipios as $m) {
            $name = Str::of($m['nome'])->lower()->ascii()->toString();
            if ($name === $target) {
                return [
                    'id'         => $m['id'],
                    'state'      => $m['microrregiao']['mesorregiao']['UF']['nome'] ?? null,
                    'state_abbr' => $m['microrregiao']['mesorregiao']['UF']['sigla'] ?? null,
                ];
            }
        }
        return null;
    }

    private function getPopulation(int $municipioId): ?int
    {
        $response = Http::timeout(30)
            ->get("https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-1/variaveis/9324", [
                'localidades' => "N6[{$municipioId}]",
            ]);

        if (! $response->successful()) return null;
        $data  = $response->json();
        $value = $data[0]['resultados'][0]['series'][0]['serie'] ?? null;
        return $value ? (int) reset($value) : null;
    }

    /**
     * Lista los 27 estados de Brasil con código IBGE, sigla y nombre.
     * Reutiliza el mismo caché que getStateInfo().
     */
    public function listStates(): array
    {
        $estados = Cache::remember('ibge:estados', now()->addDays(30), function () {
            return Http::timeout(15)
                ->get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
                ->json();
        });

        return collect($estados)
            ->map(fn ($e) => [
                'code' => (string) $e['id'],
                'abbr' => $e['sigla'],
                'name' => $e['nome'],
            ])
            ->sortBy('name')
            ->values()
            ->all();
    }

    /**
     * Lista los municipios de un estado (por sigla, ej. "PR") con su código IBGE.
     * Si la API falla devuelve [] sin cachear el fallo.
     */
    public function listCities(string $stateAbbr): array
    {
        $uf = strtoupper(trim($stateAbbr));
        $key = "ibge:municipios:{$uf}";

        if ($cached = Cache::get($key)) {
            return $cached;
        }

        $resp = Http::timeout(15)
            ->get("https://servicodados.ibge.gov.br/api/v1/localidades/estados/{$uf}/municipios");

        if (! $resp->successful()) {
            return [];
        }

        $cities = collect($resp->json())
            ->map(fn ($m) => [
                'code' => (string) $m['id'],
                'name' => $m['nome'],
            ])
            ->sortBy('name')
            ->values()
            ->all();

        Cache::put($key, $cities, now()->addDays(30));

        return $cities;
    }
}
