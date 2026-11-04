<?php

namespace App\Http\Controllers\Team;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\StoreMemberRequest;
use App\Models\Territory;
use App\Services\Domains\Membership\MembershipService;
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
    ) {}

    public function index(Request $request, string $territory): Response
    {
        $user = $request->user();

        return Inertia::render('Team/Index', [
            ...$this->memberships->teamOf($user, $this->current()->id),
            'canManage' => $user->can('manage-team'),
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
            ->with('success', 'Miembro agregado al equipo.');
    }

    public function destroy(Request $request, string $territory, int $user): RedirectResponse
    {
        $this->memberships->remove($request->user(), $this->current()->id, $user);

        return back()->with('success', 'Miembro quitado del equipo.');
    }

    /** El territorio que el middleware ya resolvió y autorizó (el de la URL). */
    private function current(): Territory
    {
        return app('currentTerritory');
    }
}