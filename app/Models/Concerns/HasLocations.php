<?php

namespace App\Models\Concerns;

use App\Models\Location;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;

/** Para cualquier modelo con dirección (agencia, negocio...). */
trait HasLocations
{
    public function locations(): MorphMany
    {
        return $this->morphMany(Location::class, 'locatable');
    }

    public function primaryLocation(): MorphOne
    {
        return $this->morphOne(Location::class, 'locatable')->where('is_primary', true);
    }
}
