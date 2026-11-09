<?php

namespace App\Http\Controllers\Business;

use App\Enums\BusinessSegment;
use App\Http\Controllers\Controller;
use App\Models\Territory;
use App\Services\Domains\Access\AccessService;
use App\Services\Domains\Business\BusinessIndexService;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Business\BusinessShowService;
use App\Services\Domains\Payment\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    public function __construct(
        protected BusinessService $businessService,
        protected BusinessShowService $showService,
        protected BusinessIndexService $businessIndex,
        protected PaymentService $payments,
        protected AccessService $accessService,
    ) {}

    public function index(Request $request): Response
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        $tab = $this->accessService->resolveTab($request->user(), 'business', 'index', $request->query('tab'));

        $filters = [
            'search'   => (string) $request->query('search', ''),
            'segment'  => (string) $request->query('segment', ''),
            'statuses' => (array) $request->query('status', []),
        ];

        return Inertia::render('Business/Index', [
            'tab'           => $tab,
            'tabs'          => $this->accessService->allowedTabs($request->user(), 'business', 'index'),
            'territorySlug' => $territory->slug,
            'filters'       => ['search' => $filters['search'], 'segment' => $filters['segment'], 'status' => $filters['statuses']],
            'kpis'          => $this->businessIndex->kpis($territory),
            ...match ($tab) {
                'list'       => $this->businessIndex->list($territory, $filters),
                'approvals'  => $this->businessIndex->approvals($territory),
                'categories' => $this->businessIndex->categories($territory),
            },
        ]);
    }

    public function create(): Response
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        return Inertia::render('Business/Create', [
            'segments'      => BusinessSegment::options(),
            'territorySlug' => $territory->slug,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:255',
            'location.latitude'     => 'nullable|numeric',
            'location.longitude'    => 'nullable|numeric',
            'location.street'       => 'nullable|string',
            'location.number'       => 'nullable|string',
            'location.neighborhood' => 'nullable|string',
            'location.city'         => 'nullable|string',
            'location.state'        => 'nullable|string',
            'location.cep'          => 'nullable|string',
        ]);

        $result = $this->businessService->register($data, $request->user()?->id);

        return back()->with('success', "Negocio \"{$result['business']->name}\" dado de alta.");
    }

    /** Aprovações: el equipo registra el pago en efectivo del onboarding y el negocio queda activo. */
    public function activate(Request $request, string $territory, string $business): RedirectResponse
    {
        /** @var Territory $current */
        $current = app('currentTerritory');

        $negocio = $this->businessService->find((int) $business);

        abort_if(! $negocio || $this->businessService->territoryIdOf($negocio) !== $current->id, 404);

        $this->payments->pay($negocio, 'onboarding', 'cash', $request->user()->id);

        return back();
    }

    public function show(Request $request, string $territory, string $business): Response
    {
        $negocio = $this->businessService->find((int) $business);

        abort_if(! $negocio, 404);

        $user      = $request->user();
        $activeTab = $this->accessService->resolveTab($user, 'business', 'show', $request->query('tab'));

        // Only the active tab's data is loaded.
        $tabData = match ($activeTab) {
            'profile' => [], // the profile is the base `business` prop
            'finance' => ['financeData' => $this->showService->finance($negocio)],
            'traffic' => [], // later: ['trafficData' => $this->showService->traffic($negocio)]
            'ads'     => ['adsData' => $this->showService->ads($negocio)],
        };

        return Inertia::render('Business/Show', [
            'business'      => $this->showService->profile($negocio),
            'territorySlug' => $territory,
            'activeTab'     => $activeTab,
            'tabs'          => $this->accessService->allowedTabs($user, 'business', 'show'),
            ...$tabData,
        ]);
    }
}