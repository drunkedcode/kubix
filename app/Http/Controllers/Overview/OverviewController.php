<?php

namespace App\Http\Controllers\Overview;

use App\Http\Controllers\Controller;
use App\Models\Territory;
use App\Services\Domains\Overview\OverviewService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OverviewController extends Controller
{
    private const TABS = ['general', 'evolution'];

    public function __construct(
        protected OverviewService $overview,
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

        return Inertia::render('Overview/Index', [
            'tab'           => $this->tab($request),
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
            'tab'           => $this->tab($request),
            'territorySlug' => $current->slug,
            ...$this->overview->forTerritory($current),
        ]);
    }

    private function tab(Request $request): string
    {
        return in_array($request->query('tab'), self::TABS, true) ? $request->query('tab') : 'general';
    }
}