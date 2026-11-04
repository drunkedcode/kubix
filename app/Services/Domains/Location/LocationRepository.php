<?php

namespace App\Services\Domains\Location;

use App\Models\Location;
use App\Models\Territory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class LocationRepository
{
    /** Barrios activos con polígono (candidatos para el punto-en-polígono). */
    public function neighborhoodsWithPolygon(): Collection
    {
        return Territory::where('type', 'neighborhood')
            ->where('status', 'active')
            ->whereNotNull('polygon')
            ->get(['id', 'name', 'polygon']);
    }

    /** Crea o actualiza la dirección principal del dueño. */
    public function upsertPrimary(Model $owner, array $attrs): Location
    {
        $location = $owner->locations()->where('is_primary', true)->first();

        if ($location) {
            $location->update($attrs);
            return $location;
        }

        return $owner->locations()->create($attrs + ['is_primary' => true]);
    }
}
