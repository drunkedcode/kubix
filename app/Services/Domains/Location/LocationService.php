<?php

namespace App\Services\Domains\Location;

use App\Models\Location;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Http;

/**
 * Guarda la dirección de cualquier dueño (agencia, negocio...) y la ubica
 * en un barrio operado mediante punto-en-polígono. El dueño debe usar HasLocations.
 */
class LocationService
{
    public function __construct(protected LocationRepository $repo) {}

    /**
     * @param array $data cep, street, number, complement, neighborhood, city, state, latitude?, longitude?, label?
     * @return array{location: Location, outside_territory: bool, geocoded: bool}
     */
    public function saveFor(Model $owner, array $data, ?int $userId = null): array
    {
        $geocoded = false;

        if (empty($data['latitude']) || empty($data['longitude'])) {
            $point = $this->geocode($data);
            if ($point) {
                $data['latitude'] = $point['lat'];
                $data['longitude'] = $point['lng'];
                $geocoded = true;
            }
        }

        $territoryId = (! empty($data['latitude']) && ! empty($data['longitude']))
            ? $this->territoryFor((float) $data['latitude'], (float) $data['longitude'])
            : null;

        $location = $this->repo->upsertPrimary($owner, [
            'label'        => $data['label'] ?? null,
            'cep'          => isset($data['cep']) ? preg_replace('/\D/', '', $data['cep']) : null,
            'street'       => $data['street'] ?? null,
            'number'       => $data['number'] ?? null,
            'complement'   => $data['complement'] ?? null,
            'neighborhood' => $data['neighborhood'] ?? null,
            'city'         => $data['city'] ?? null,
            'state'        => $data['state'] ?? null,
            'latitude'     => $data['latitude'] ?? null,
            'longitude'    => $data['longitude'] ?? null,
            'territory_id' => $territoryId,
            'created_by'   => $userId,
            'updated_by'   => $userId,
        ]);

        return [
            'location'          => $location,
            'outside_territory' => $territoryId === null,
            'geocoded'          => $geocoded,
        ];
    }

    /** Id del barrio operado que contiene el punto, o null. */
    public function territoryFor(float $lat, float $lng): ?int
    {
        foreach ($this->repo->neighborhoodsWithPolygon() as $t) {
            if ($this->contains($t->polygon, $lat, $lng)) {
                return $t->id;
            }
        }

        return null;
    }

    /** Reasigna territory_id de una location (útil al cambiar un límite). */
    public function reassign(Location $location): Location
    {
        if ($location->latitude && $location->longitude) {
            $location->update(['territory_id' => $this->territoryFor((float) $location->latitude, (float) $location->longitude)]);
        }

        return $location;
    }

    private function contains(?array $geo, float $lat, float $lng): bool
    {
        $polys = match ($geo['type'] ?? null) {
            'Polygon'      => [$geo['coordinates']],
            'MultiPolygon' => $geo['coordinates'],
            default        => [],
        };

        foreach ($polys as $rings) {
            if (! $this->inRing($rings[0] ?? [], $lat, $lng)) {
                continue;
            }
            foreach (array_slice($rings, 1) as $hole) {   // huecos
                if ($this->inRing($hole, $lat, $lng)) {
                    continue 2;
                }
            }
            return true;
        }

        return false;
    }

    /** Ray casting. Los anillos GeoJSON son [lng, lat]. */
    private function inRing(array $ring, float $lat, float $lng): bool
    {
        $inside = false;
        $n = count($ring);

        for ($i = 0, $j = $n - 1; $i < $n; $j = $i++) {
            [$xi, $yi] = $ring[$i];
            [$xj, $yj] = $ring[$j];

            if ((($yi > $lat) !== ($yj > $lat)) && ($lng < ($xj - $xi) * ($lat - $yi) / (($yj - $yi) ?: 1e-12) + $xi)) {
                $inside = ! $inside;
            }
        }

        return $inside;
    }

    private function geocode(array $d): ?array
    {
        $q = trim(implode(', ', array_filter([
            trim(($d['street'] ?? '') . ' ' . ($d['number'] ?? '')),
            $d['neighborhood'] ?? null,
            $d['city'] ?? null,
            $d['state'] ?? null,
            'Brasil',
        ])));

        if ($q === 'Brasil') {
            return null;
        }

        try {
            $r = Http::withHeaders(['User-Agent' => 'KubixTerritory/1.0'])->timeout(8)
                ->get('https://nominatim.openstreetmap.org/search', ['q' => $q, 'format' => 'json', 'limit' => 1]);
            $item = $r->successful() ? ($r->json()[0] ?? null) : null;

            return $item ? ['lat' => (float) $item['lat'], 'lng' => (float) $item['lon']] : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
