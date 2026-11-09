<?php

namespace App\Services\Domains\Membership;

use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Territory\TerritoryService;
use App\Services\Domains\User\UserService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MembershipService
{
    public function __construct(
        protected MembershipRepository $repo,
        protected TerritoryService $territories,
        protected UserService $users,
    ) {}

    public function isSuperAdmin(User $user): bool
    {
        return $this->repo->isSuperAdmin($user);
    }

    /** Territorios que el usuario tiene asignados. */
    public function territoriesOf(User $user): Collection
    {
        return $this->repo->territoriesOf($user);
    }

    /**
     * El territorio asignado al usuario que cubre a $territory: el propio o un ancestro
     * (el más específico si hay varios). null si no tiene acceso.
     * Un territorio B está dentro de A cuando el path de B empieza con el path de A + "/".
     */
    public function coveringTerritory(User $user, Territory $territory): ?Territory
    {
        return $this->repo->territoriesOf($user)
            ->filter(fn (Territory $assigned) => $assigned->id === $territory->id
                || ($assigned->path && str_starts_with((string) $territory->path, $assigned->path . '/')))
            ->sortByDesc(fn (Territory $assigned) => strlen((string) $assigned->path))
            ->first();
    }

    // --- Vista del equipo ---

    /** Equipo de un territorio, tal como lo ve $actor. */
    public function teamOf(User $actor, int $territoryId): array
    {
        $territory   = $this->findTerritory($territoryId);
        $assignable  = $this->assignableRoles($actor, $territory);
        $managerRole = $this->managerRoleOf($territory);

        $members = $this->repo->membersOf($territory)
            ->map(fn ($m) => [
                'id'        => $m->id,
                'name'      => $m->name,
                'email'     => $m->email,
                'role'      => $m->role,
                'roleLabel' => $this->roleLabel($m->role),
                'removable' => in_array($m->role, $assignable, true),
            ])
            ->values();

        return [
            'members'      => $members->all(),
            'hasManager'   => $members->contains(fn ($m) => $m['role'] === $managerRole),
            'managerLabel' => $managerRole ? $this->roleLabel($managerRole) : null,
        ];
    }

    /** Gerente de cada territorio (el del rol que corresponde a su tipo), indexado por id de territorio. */
    public function managersOf(Collection $territories): array
    {
        $roles = $this->catalog()
            ->filter(fn (array $def) => isset($def['manager_of']))
            ->keys()
            ->all();

        $rows = $this->repo->managersOf($territories->pluck('id')->all(), $roles)->groupBy('territory_id');

        return $territories
            ->mapWithKeys(function (Territory $territory) use ($rows) {
                $row = $rows->get($territory->id)?->firstWhere('role', $this->managerRoleOf($territory));

                return $row
                    ? [$territory->id => ['id' => $row->id, 'name' => $row->name, 'role' => $this->roleLabel($row->role)]]
                    : [];
            })
            ->all();
    }

    /** Roles que $actor puede asignar en el territorio, listos para el selector del wizard. */
    public function rolesFor(User $actor, int $territoryId): array
    {
        $territory = $this->findTerritory($territoryId);

        return collect($this->assignableRoles($actor, $territory))
            ->map(fn (string $role) => [
                'value'       => $role,
                'label'       => $this->roleLabel($role),
                'description' => $this->catalog()->get($role)['description'] ?? null,
            ])
            ->values()
            ->all();
    }

    // --- Asignar y quitar ---

    /** Agrega a la persona al equipo con ese rol: membresía + rol de Spatie (si es de gerente). */
    public function assign(User $actor, int $territoryId, int $userId, string $role): void
    {
        $territory = $this->findTerritory($territoryId);
        $user      = $this->users->find($userId);

        abort_if(! $user, 404);

        $assignable = $this->assignableRoles($actor, $territory);

        if (! in_array($role, $assignable, true)) {
            throw ValidationException::withMessages([
                'role' => 'No podés asignar ese rol en este territorio.',
            ]);
        }

        $members  = $this->repo->membersOf($territory);
        $previous = $members->firstWhere('id', $user->id)?->role;

        // Un rol por persona: no se puede pisar uno que $actor no tiene permitido tocar
        // (por ejemplo, Pedro degradándose a sí mismo de gerente a promotor).
        if ($previous && ! in_array($previous, $assignable, true)) {
            throw ValidationException::withMessages([
                'user_id' => 'Esa persona ya tiene un rol que no podés modificar.',
            ]);
        }

        // Un barrio tiene un solo gerente.
        if ($this->isManagerRole($role) && $territory->type === 'neighborhood') {
            $otherManager = $members->where('role', $role)->where('id', '!=', $user->id);

            if ($otherManager->isNotEmpty()) {
                throw ValidationException::withMessages([
                    'user_id' => 'Este barrio ya tiene gerente. Quitalo primero.',
                ]);
            }
        }

        DB::transaction(function () use ($user, $territory, $role, $previous) {
            if ($previous && $previous !== $role && $this->isManagerRole($previous)) {
                $this->repo->removeRole($user, $territory->id, $previous);
            }

            $this->repo->attachTerritory($user, $territory, $role);

            if ($this->catalog()->get($role)['referral'] ?? false) {
                $this->users->ensureReferralCode($user);
            }

            if ($this->isManagerRole($role)) {
                $this->repo->assignRole($user, $territory->id, $role);
            }
        });
    }

    /** Quita a la persona del equipo: borra la membresía y su rol de Spatie, si lo tenía. */
    public function remove(User $actor, int $territoryId, int $userId): void
    {
        $territory = $this->findTerritory($territoryId);
        $user      = $this->users->find($userId);

        abort_if(! $user, 404);

        $role = $this->repo->membersOf($territory)->firstWhere('id', $user->id)?->role;

        abort_if(! $role, 404);
        abort_if(! in_array($role, $this->assignableRoles($actor, $territory), true), 403);

        DB::transaction(function () use ($user, $territory, $role) {
            $this->repo->detachTerritory($user, $territory);

            if ($this->isManagerRole($role)) {
                $this->repo->removeRole($user, $territory->id, $role);
            }
        });
    }

    // --- Reglas internas ---

    /**
     * Roles que $actor puede asignar (o quitar) en el territorio.
     * Gerente del territorio: solo si $actor es super admin o gerente de un nivel superior.
     * Roles de equipo: si $actor tiene acceso y el rol aplica a este tipo de territorio.
     */
    private function assignableRoles(User $actor, Territory $territory): array
    {
        $isSuper  = $this->isSuperAdmin($actor);
        $covering = $isSuper ? null : $this->coveringTerritory($actor, $territory);

        if (! $isSuper && ! $covering) {
            return [];
        }

        $managerRole    = $this->managerRoleOf($territory);
        $canNameManager = $isSuper || $covering->id !== $territory->id;

        return $this->catalog()
            ->filter(function (array $def, string $role) use ($territory, $managerRole, $canNameManager) {
                if (isset($def['manager_of'])) {
                    return $role === $managerRole && $canNameManager;
                }

                return in_array($territory->type, $def['levels'] ?? [], true);
            })
            ->keys()
            ->all();
    }

    private function findTerritory(int $territoryId): Territory
    {
        $territory = $this->territories->find($territoryId);

        abort_if(! $territory, 404);

        return $territory;
    }

    /** Catálogo de roles de equipo (config/access.php → team_roles). */
    private function catalog(): Collection
    {
        return collect(config('access.team_roles', []));
    }

    /** Rol de gerente para el tipo de este territorio. */
    private function managerRoleOf(Territory $territory): ?string
    {
        return $this->catalog()
            ->filter(fn (array $def) => ($def['manager_of'] ?? null) === $territory->type)
            ->keys()
            ->first();
    }

    private function isManagerRole(string $role): bool
    {
        return ! empty($this->catalog()->get($role)['manager_of']);
    }

    private function roleLabel(string $role): string
    {
        return $this->catalog()->get($role)['label'] ?? $role;
    }
}