<?php

namespace App\Http\Middleware;

use App\Services\Domains\User\UserContextService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/*
|--------------------------------------------------------------------------
| EL BARRIO DONDE ESTÁ LA PERSONA (API de la app)
|--------------------------------------------------------------------------
| Lee el barrio guardado en Redis para la persona logueada y lo deja como
| "territorio actual", igual que ResolveOrganization en el admin. Sin barrio
| guardado (nunca mandó su ubicación o ya venció) responde 409 con un código
| estable para que la app vuelva a enviar su ubicación (PUT /context).
*/
class ResolveUserTerritory
{
    public function __construct(
        protected UserContextService $contexts,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $territory = $this->contexts->current($request->user());

        if (! $territory) {
            return response()->json([
                'message' => 'Enviá tu ubicación para ver lo de tu barrio.',
                'code'    => 'location_required',
            ], 409);
        }

        app()->instance('currentTerritory', $territory);

        return $next($request);
    }
}
