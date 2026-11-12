<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\StoreMemberRequest;
use App\Http\Requests\Team\UpdateGoalRequest;
use App\Models\Territory;
use App\Services\Domains\Access\AccessService;
use App\Services\Domains\Membership\MembershipService;
use App\Services\Domains\Team\TeamIndexService;
use App\Services\Domains\Team\TeamShowService;
use App\Services\Domains\User\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __construct(
        protected MembershipService $memberships,
        protected UserService $users,
        protected TeamIndexService $indexService,
        protected TeamShowService $showService,
        protected AccessService $accessService,
    ) {}

    public function index(Request $request, string $territory): Response
    {
        $user    = $request->user();
        $current = $this->current();
        $tab     = $this->accessService->resolveTab($user, 'team', 'index', $request->query('tab'));

        return Inertia::render('Team/Index', [
            'tab'       => $tab,
            'tabs'      => $this->accessService->allowedTabs($user, 'team', 'index'),
            'canManage' => $user->can('manage-team'),
            ...match ($tab) {
                'members' => $this->indexService->members($user, $current),
                'roles'   => $this->indexService->roles($user, $current),
                'productivity' => $this->indexService->productivity($user, $current),
                'goals'   => $this->indexService->goals($user, $current),
            },
        ]);
    }

    /** Detalle de una persona del equipo. Solo se carga la pestaña activa. */
    public function show(Request $request, string $territory, int $user): Response
    {
        $current = $this->current();
        $actor   = $request->user();

        $member    = $this->showService->profile($current, $user); // 404 si no es del equipo
        $activeTab = $this->accessService->resolveTab($actor, 'team', 'show', $request->query('tab'));

        $tabData = match ($activeTab) {
            'businesses' => $this->showService->businesses($current, $user),
            'activities' => $this->showService->activities($current, $user),
            'history'    => $this->showService->history($current, $user),
        };

        return Inertia::render('Team/Show', [
            'member'        => $member,
            'kpis'          => $this->showService->kpis($current, $user),
            'territorySlug' => $territory,
            'activeTab'     => $activeTab,
            'tabs'          => $this->accessService->allowedTabs($actor, 'team', 'show'),
            ...$tabData,
        ]);
    }

    public function create(Request $request, string $territory): Response
    {
        return Inertia::render('Team/Create', [
            'roles' => $this->memberships->rolesFor($request->user(), $this->current()->id),
        ]);
    }

    /** Busca un usuario por correo exacto (devuelve solo lo mínimo, con el correo tapado). */
    public function lookup(Request $request, string $territory): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email']]);

        return response()->json(['user' => $this->users->lookupByEmail($data['email'])]);
    }

    public function store(StoreMemberRequest $request, string $territory): RedirectResponse
    {
        $data    = $request->validated();
        $current = $this->current();

        $this->memberships->assign($request->user(), $current->id, $data['user_id'], $data['role']);

        return redirect()
            ->route('team.index', ['territory' => $current->slug])
            ->with('success', 'Membro adicionado à equipe.');
    }

    /** Fija la meta de captación del mes de un promotor. */
    public function setGoal(UpdateGoalRequest $request, string $territory, int $user): RedirectResponse
    {
        $this->indexService->setGoal($request->user(), $this->current(), $user, (int) $request->validated('target'));

        return back()->with('success', 'Meta atualizada.');
    }

    public function destroy(Request $request, string $territory, int $user): RedirectResponse
    {
        $this->memberships->remove($request->user(), $this->current()->id, $user);

        return back()->with('success', 'Membro removido da equipe.');
    }

    /** El territorio que el middleware ya resolvió y autorizó (el de la URL). */
    private function current(): Territory
    {
        return app('currentTerritory');
    }
}