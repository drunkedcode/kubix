<?php

namespace App\Http\Controllers\Overview;

use App\Http\Controllers\Controller;
use App\Models\Territory;
use App\Services\Domains\Access\AccessService;
use App\Services\Domains\Overview\OverviewIndexService;
use App\Services\Domains\Overview\OverviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    public function __construct(
        protected OverviewService $overview,
        protected OverviewIndexService $overviewIndex,
        protected AccessService $access,
    ) {}

    /** Todos los territorios del usuario (ej: Pedro con 2 barrios). Solo se carga la pestaña activa. */
    public function all(Request $request): Response|RedirectResponse
    {
        $territories = $this->overview->territoriesOf($request->user());

        abort_if($territories->isEmpty(), 403, 'No territories assigned.');

        // Con uno solo, el agregado no aplica: se entra directo a su destino.
        if ($territories->count() === 1) {
            return redirect($this->overview->landingUrl($territories->first()));
        }

        // Sin un territorio único no hay equipo de permisos que evaluar: la ruta es abierta
        // y los datos ya se filtran por membresías. Se muestran las pestañas declaradas.
        $tabs = $this->access->allTabs('overview', 'index');
        $tab  = in_array($request->query('tab'), $tabs, true) ? $request->query('tab') : $tabs[0];

        return Inertia::render('Overview/Index', [
            'tab'           => $tab,
            'tabs'          => $tabs,
            'territorySlug' => null,
            ...match ($tab) {
                'territories' => $this->overviewIndex->territories($territories),
                'general'   => $this->overviewIndex->general($territories),
                'evolution' => $this->overviewIndex->evolution($territories),
            },
        ]);
    }

    /** Totalizador de un país, estado o ciudad. Solo se carga la pestaña activa. */
    public function territory(Request $request, string $territory): Response|RedirectResponse
    {
        /** @var Territory $current */
        $current = app('currentTerritory');

        // El barrio es específico: su destino es Agency, no un totalizador.
        if ($current->type === 'neighborhood') {
            return redirect($this->overview->landingUrl($current));
        }

        $tab = $this->access->resolveTab($request->user(), 'overview', 'index', $request->query('tab'));

        return Inertia::render('Overview/Index', [
            'tab'           => $tab,
            'tabs'          => $this->access->allowedTabs($request->user(), 'overview', 'index'),
            'territorySlug' => $current->slug,
            ...match ($tab) {
                'territories' => $this->overviewIndex->territories($current),
                'general'   => $this->overviewIndex->general($current),
                'evolution' => $this->overviewIndex->evolution($current),
            },
        ]);
    }
}
