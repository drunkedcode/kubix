<?php

namespace App\Services\Domains\User;

use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Location\LocationService;
use App\Services\Domains\Territory\TerritoryService;

/**
 * Dónde está la persona logueada: el barrio que le corresponde según la ubicación
 * que manda la app. Todos son User; lo que ven depende de este barrio.
 */
class UserContextService
{
    /** Cuánto dura el barrio guardado si la app no vuelve a avisar su ubicación. */
    private const MINUTES = 720;

    public function __construct(
        protected UserContextRepository $repo,
        protected LocationService $locations,
        protected TerritoryService $territories,
    ) {}

    /** Barrio donde está la persona; lo guarda, o borra el anterior si está fuera de todo barrio. */
    public function locate(User $user, float $latitude, float $longitude): ?Territory
    {
        $territoryId = $this->locations->territoryFor($latitude, $longitude);

        if ($territoryId === null) {
            $this->repo->forget($user->id);

            return null;
        }

        $this->repo->put($user->id, $territoryId, self::MINUTES);

        return $this->territories->find($territoryId);
    }

    /** Barrio guardado de la persona, o null si nunca avisó su ubicación o ya venció. */
    public function current(User $user): ?Territory
    {
        $territoryId = $this->repo->get($user->id);

        return $territoryId ? $this->territories->find($territoryId) : null;
    }
}
