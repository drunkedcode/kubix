<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agency\UpdateAgencySettingsRequest;
use App\Http\Requests\Agency\UpdateIssueStatusRequest;
use App\Models\Territory;
use App\Services\Domains\Access\AccessService;
use App\Services\Domains\Agency\AgencyIndexService;
use App\Services\Domains\Agency\AgencyIssuesService;
use App\Services\Domains\Agency\AgencyService;
use App\Services\Domains\Issue\IssueService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgencyController extends Controller
{
    public function __construct(
        protected AgencyService $agencyService,
        protected AgencyIndexService $agencyIndex,
        protected AgencyIssuesService $agencyIssues,
        protected IssueService $issues,
        protected AccessService $accessService,
    ) {}

    /** Portada del barrio: su agencia. Solo se carga la pestaña activa. */
    public function index(Request $request): Response|RedirectResponse
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        // Solo el barrio tiene agencia; el resto es un totalizador.
        if ($territory->type !== 'neighborhood') {
            return redirect()->route('overview.territory', ['territory' => $territory->slug]);
        }

        $tab = $this->accessService->resolveTab($request->user(), 'agency', 'index', $request->query('tab'));

        return Inertia::render('Agency/Index', [
            'tab'   => $tab,
            'scope' => ['value' => $territory->slug, 'label' => $territory->name],
            'agency' => $this->agencyService->profile($territory),
            'tabs'  => $this->accessService->allowedTabs($request->user(), 'agency', 'index'),
            ...match ($tab) {
                'general'   => $this->agencyIndex->general($territory),
                'evolution' => $this->agencyIndex->evolution($territory),
                'settings'  => $this->agencyIndex->settings($territory),
            },
        ]);
    }

    /** Submódulo Issues: reclamos del barrio. Solo se carga la pestaña activa. */
    public function issues(Request $request): Response
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        abort_unless($territory->type === 'neighborhood', 404);

        $tab = $this->accessService->resolveTab($request->user(), 'agency', 'issues', $request->query('tab'));

        return Inertia::render('Agency/Issues/Index', [
            'tab'   => $tab,
            'tabs'  => $this->accessService->allowedTabs($request->user(), 'agency', 'issues'),
            'canManage' => $request->user()->can('manage-issues'),
            'scope' => ['value' => $territory->slug, 'label' => $territory->name],
            ...match ($tab) {
                'general'  => $this->agencyIssues->general($territory),
                'open'     => $this->agencyIssues->open($territory),
                'resolved' => $this->agencyIssues->resolved($territory),
            },
        ]);
    }

    /** Pasa un reclamo del barrio a "em andamento" o "resolvido". El barrio sale de la URL. */
    public function updateIssue(UpdateIssueStatusRequest $request, string $territory, int $issue): RedirectResponse
    {
        /** @var Territory $current */
        $current = app('currentTerritory');

        abort_unless($current->type === 'neighborhood', 404);

        $status = $request->validated('status');

        $this->issues->changeStatus($request->user(), $current, $issue, $status);

        return back()->with('success', $status === 'resolved' ? 'Reclamação resolvida.' : 'Reclamação em andamento.');
    }

    /** Guarda la configuración económica del barrio. El territorio sale de la URL, nunca del formulario. */
    public function updateSettings(UpdateAgencySettingsRequest $request): RedirectResponse
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        abort_unless($territory->type === 'neighborhood', 404);

        $this->agencyService->updateSettings($territory, $request->validated());

        return back()->with('success', 'Configurações salvas.');
    }
}
