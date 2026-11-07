<?php

namespace App\Services\Domains\Overview;

use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Membership\MembershipService;
use Illuminate\Support\Collection;

/*
|--------------------------------------------------------------------------
| OVERVIEW: LO QUE NO ES PANTALLA
|--------------------------------------------------------------------------
| A qué territorios accede el usuario y a dónde entra cada uno.
| Lo que muestra cada pestaña vive en OverviewIndexService.
*/

class OverviewService
{
    public function __construct(
        protected MembershipService $memberships,
    ) {}

    /** Territorios que el usuario tiene asignados. */
    public function territoriesOf(User $user): Collection
    {
        return $this->memberships->territoriesOf($user);
    }

    /** A dónde entra un territorio: el barrio a su Agency, el resto a su totalizador. */
    public function landingUrl(Territory $territory): string
    {
        return $territory->type === 'neighborhood'
            ? route('agencies.index', ['territory' => $territory->slug])
            : route('overview.territory', ['territory' => $territory->slug]);
    }
    
}
