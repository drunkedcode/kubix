<?php

namespace App\Http\Controllers\Agency;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agency\UpdateAgencySettingsRequest;
use App\Models\Territory;
use App\Services\Domains\Agency\AgencyService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgencyController extends Controller
{
    private const TABS = ['general', 'evolution', 'settings'];

    public function __construct(
        protected AgencyService $agencyService,
    ) {}

    /** Portada del barrio: su agencia. */
    public function index(Request $request): Response|RedirectResponse
    {

        /** @var Territory $territory */
        $territory = app('currentTerritory');

        // Solo el barrio tiene agencia; el resto es un totalizador.
        if ($territory->type !== 'neighborhood') {
            return redirect()->route('overview.territory', ['territory' => $territory->slug]);
        }

        $tab = in_array($request->query('tab'), self::TABS, true) ? $request->query('tab') : 'general';

        return Inertia::render('Agency/Index', [
            'tab'   => $tab,
            'scope' => ['value' => $territory->slug, 'label' => $territory->name],
            'canManageSettings' => (bool) $request->user()?->can('manage-agency'),
            ...$this->agencyService->home($territory),
        ]);
    }

    /** Guarda la configuración propia del barrio. El territorio sale de la URL, nunca del formulario. */
    public function updateSettings(UpdateAgencySettingsRequest $request): RedirectResponse
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        abort_unless($territory->type === 'neighborhood', 404);

        $this->agencyService->updateSettings(
            $territory,
            $request->validated(),
            ['logo' => $request->file('logo'), 'cover' => $request->file('cover')],
            $request->user()?->id,
        );

        return back()->with('success', 'Configuración guardada.');
    }
}
