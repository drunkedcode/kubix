<?php

namespace App\Services\Domains\App;

use App\Models\User;
use App\Services\Domains\Agency\AgencyService;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\User\UserContextService;
use App\Services\Domains\User\UserService;

/**
 * Receta de lo que la app necesita al abrirse: la persona, sus negocios (para el
 * switch vecino / dueño) y el barrio donde está, con los precios de ese barrio.
 */
class AppSessionService
{
    public function __construct(
        protected UserService $users,
        protected UserContextService $contexts,
        protected BusinessService $businesses,
        protected AgencyService $agency,
    ) {}

    /** Con ubicación nueva, ubica a la persona; sin ella, usa el barrio guardado. context null = fuera de todo barrio. */
    public function open(User $user, ?float $latitude = null, ?float $longitude = null): array
    {
        $territory = ($latitude !== null && $longitude !== null)
            ? $this->contexts->locate($user, $latitude, $longitude)
            : $this->contexts->current($user);

        return [
            'user'       => $this->users->profile($user),
            'businesses' => $this->businesses->ownedBy($user),
            'context'    => $territory ? [
                'territory' => [
                    'id'   => $territory->id,
                    'name' => $territory->name,
                    'slug' => $territory->slug,
                    'type' => $territory->type,
                ],
                'prices' => $this->agency->settings($territory),
            ] : null,
        ];
    }
}
