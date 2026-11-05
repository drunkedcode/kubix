<?php

namespace App\Http\Controllers\Overview;

use App\Http\Controllers\Controller;
use App\Models\Territory;
use App\Services\Domains\Access\AccessService;
use App\Services\Domains\Overview\OverviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    public function __construct(
        protected OverviewService $overview,
        protected AccessService $access,
    ) {}

    /** Todos los territorios del usuario (ej: Pedro con 2 barrios). */
    public function all(Request $request): Response|RedirectResponse
    {
        $territories = $this->overview->territoriesOf($request->user());

        abort_if($territories->isEmpty(), 403, 'No territories assigned.');

        // Con uno solo, el agregado no aplica: se entra directo a su destino.
        if ($territories->count() === 1) {
            return redirect($this->overview->landingUrl($territories->first()));
        }

        // Sin un territorio único no hay equipo de permisos que evaluar: la ruta es abierta
        // y OverviewService ya filtra los datos por membresías. Se muestran las pestañas declaradas.
        $tabs = $this->access->allTabs('overview', 'index');

        return Inertia::render('Overview/Index', [
            'tab'           => in_array($request->query('tab'), $tabs, true) ? $request->query('tab') : $tabs[0],
            'tabs'          => $tabs,
            'territorySlug' => null,
            ...$this->overview->forTerritories($territories),
        ]);
    }

    /** Totalizador de un país, estado o ciudad. */
    public function territory(Request $request, string $territory): Response|RedirectResponse
    {
        /** @var Territory $current */
        $current = app('currentTerritory');

        // El barrio es específico: su destino es Agency, no un totalizador.
        if ($current->type === 'neighborhood') {
            return redirect($this->overview->landingUrl($current));
        }

        return Inertia::render('Overview/Index', [
            'tab'           => $this->access->resolveTab($request->user(), 'overview', 'index', $request->query('tab')),
            'tabs'          => $this->access->allowedTabs($request->user(), 'overview', 'index'),
            'territorySlug' => $current->slug,
            ...$this->overview->forTerritory($current),
        ]);
    }
}
