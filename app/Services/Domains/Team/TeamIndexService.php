<?php

namespace App\Services\Domains\Team;

use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Access\AccessService;
use App\Services\Domains\Goal\GoalService;
use App\Services\Domains\Membership\MembershipService;
use Illuminate\Validation\ValidationException;

/*
|--------------------------------------------------------------------------
| EQUIPES (página index): LO QUE MUESTRA CADA PESTAÑA
|--------------------------------------------------------------------------
| Pantalla: Pages/Team/Index.tsx · catálogo: team.index
| Un método por pestaña, con el nombre de su clave.
*/

class TeamIndexService
{
    public function __construct(
        protected MembershipService $memberships,
        protected AccessService $access,
        protected TeamShowService $member,
        protected GoalService $goals,
    ) {}

    /** Pestaña members: las personas del barrio con su función. */
    public function members(User $actor, Territory $territory): array
    {
        return $this->memberships->teamOf($actor, $territory->id);
    }

    /**
     * Pestaña roles: qué puede hacer cada función de equipo. Devuelve las funciones (con sus
     * permisos y cuántas personas la tienen en el barrio) y el catálogo de permisos.
     */
    public function roles(User $actor, Territory $territory): array
    {
        $count = collect($this->memberships->teamOf($actor, $territory->id)['members'])->countBy('role');

        $roles = collect(config('access.team_roles', []))
            ->map(fn (array $definition, string $key) => [
                'key'         => $key,
                'label'       => $definition['label'],
                'description' => $definition['description'] ?? null,
                'level'       => $definition['manager_of'] ?? null,
                'levels'      => $definition['levels'] ?? [],
                'members'     => $count->get($key, 0),
                'permissions' => $this->access->permissionsOf($key),
            ])
            ->values()
            ->all();

        return ['roles' => $roles, 'catalog' => $this->access->permissionMap()];
    }

    /** Pestaña productivity: el rendimiento de cada persona del equipo, de quien más captó a quien menos. */
    public function productivity(User $actor, Territory $territory): array
    {
        $rows = collect($this->memberships->teamOf($actor, $territory->id)['members'])
            ->map(fn (array $member) => [
                'id'        => $member['id'],
                'name'      => $member['name'],
                'roleLabel' => $member['roleLabel'],
                ...$this->member->numbers($territory, $member['id']),
            ])
            ->sortByDesc('captured')
            ->values()
            ->all();

        return ['productivity' => $rows];
    }

    /** Pestaña goals: la meta de captación de cada promotor este mes y el resultado del mes anterior. */
    public function goals(User $actor, Territory $territory): array
    {
        $month    = now();
        $previous = now()->subMonthNoOverflow();

        $promoters = collect($this->memberships->teamOf($actor, $territory->id)['members'])
            ->filter(fn (array $member) => config("access.team_roles.{$member['role']}.referral", false))
            ->values();

        $ids     = $promoters->pluck('id')->all();
        $current = $this->goals->monthFor($territory, $ids, $month);
        $before  = $this->goals->monthFor($territory, $ids, $previous);

        return ['goals' => [
            'month'         => ucfirst($month->copy()->locale('pt_BR')->translatedFormat('F Y')),
            'previousMonth' => ucfirst($previous->copy()->locale('pt_BR')->translatedFormat('F Y')),
            'rows'          => $promoters->map(fn (array $member) => [
                'id'        => $member['id'],
                'name'      => $member['name'],
                'roleLabel' => $member['roleLabel'],
                'target'    => $current[$member['id']]['target'],
                'progress'  => $current[$member['id']]['progress'],
                'previous'  => $before[$member['id']],
            ])->all(),
        ]];
    }

    /** Fija la meta de captación del mes de un promotor del equipo. */
    public function setGoal(User $actor, Territory $territory, int $userId, int $target): void
    {
        $member = collect($this->memberships->teamOf($actor, $territory->id)['members'])->firstWhere('id', $userId);

        abort_if(! $member, 404);

        if (! config("access.team_roles.{$member['role']}.referral", false)) {
            throw ValidationException::withMessages(['target' => 'Só quem capta negócios (promotor) tem meta.']);
        }

        $this->goals->set($actor, $territory, $userId, $target, now());
    }
}
