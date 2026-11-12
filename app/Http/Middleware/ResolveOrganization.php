<?php

namespace App\Http\Middleware;

use App\Models\Territory;
use App\Services\Domains\Membership\MembershipService;
use App\Services\Domains\Presence\PresenceService;
use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

/*
|--------------------------------------------------------------------------
| DETECTAR Y ACTIVAR EL TERRITORIO ACTUAL
|--------------------------------------------------------------------------
| ORDEN DE EJECUCIÓN: debe ir antes que cualquier middleware que
| verifique roles — define el contexto antes de chequear permisos.
|
| FUNCIONAMIENTO:
|   1. Lee el slug de la URL → ej: /armando-mendes/dashboard → "armando-mendes"
|   2. Busca ese territorio en la base de datos
|   3. Lo guarda como "territorio actual" → disponible en toda la app
|   4. Le dice a SPATIE en qué team buscar los roles: el territorio donde el
|      usuario TIENE la asignación (el propio o un ancestro). Así un gerente de
|      ciudad gestiona sus barrios con su rol de ciudad.
*/

class ResolveOrganization
{
    public function __construct(
        protected MembershipService $memberships,
        protected PresenceService $presence,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $slug = $request->route('territory');

        $territory = Territory::where('slug', $slug)->firstOrFail();

        app()->instance('currentTerritory', $territory);

        $teamId = $territory->id;
        $user   = $request->user();

        if ($user) {
            $this->presence->touch($territory, $user->id, PresenceService::TEAM);
        }

        if ($user && ! $this->memberships->isSuperAdmin($user)) {
            $teamId = $this->memberships->coveringTerritory($user, $territory)?->id ?? $territory->id;
        }

        app(PermissionRegistrar::class)->setPermissionsTeamId($teamId);

        return $next($request);
    }
}