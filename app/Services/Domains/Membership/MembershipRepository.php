<?php

namespace App\Services\Domains\Membership;

use App\Models\Territory;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\PermissionRegistrar;

class MembershipRepository
{
    /** Cache por request: se consulta en cada can(). */
    private static array $superAdmins = [];

    /** ¿Tiene el rol super_admin? Consulta directa, sin el cache de roles de Spatie. */
    public function isSuperAdmin(User $user): bool
    {
        return self::$superAdmins[$user->id] ??= DB::table('model_has_roles')
            ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
            ->where('roles.name', 'super_admin')
            ->where('model_has_roles.model_type', $user->getMorphClass())
            ->where('model_has_roles.model_id', $user->id)
            ->exists();
    }

    /** Territorios que el usuario gestiona (modelos). */
    public function territoriesOf(User $user): Collection
    {
        return $user->territories()->get();
    }

    public function attachTerritory(User $user, Territory $territory, string $role): void
    {
        $user->territories()->syncWithoutDetaching([$territory->id => ['role' => $role]]);
    }

    public function detachTerritory(User $user, Territory $territory): void
    {
        $user->territories()->detach($territory->id);
    }

    /** Miembros de un territorio con su rol: [{id, name, email, role}]. */
    public function membersOf(Territory $territory): Collection
    {
        return DB::table('memberships')
            ->join('users', 'users.id', '=', 'memberships.user_id')
            ->where('memberships.memberable_type', $territory->getMorphClass())
            ->where('memberships.memberable_id', $territory->id)
            ->get(['users.id', 'users.name', 'users.email', 'memberships.role']);
    }

    /** Una persona del equipo del territorio, con su rol y desde cuándo está; null si no es del equipo. */
    public function memberOf(Territory $territory, int $userId): ?object
    {
        return DB::table('memberships')
            ->join('users', 'users.id', '=', 'memberships.user_id')
            ->where('memberships.memberable_type', $territory->getMorphClass())
            ->where('memberships.memberable_id', $territory->id)
            ->where('users.id', $userId)
            ->first(['users.id', 'users.name', 'users.email', 'users.phone', 'users.referral_code', 'memberships.role', 'memberships.created_at as joined_at']);
    }

    /** Gerentes de varios territorios a la vez (solo los roles dados): [{territory_id, id, name, role}]. */
    public function managersOf(array $territoryIds, array $roles): Collection
    {
        return DB::table('memberships')
            ->join('users', 'users.id', '=', 'memberships.user_id')
            ->where('memberships.memberable_type', (new Territory)->getMorphClass())
            ->whereIn('memberships.memberable_id', $territoryIds)
            ->whereIn('memberships.role', $roles)
            ->get(['memberships.memberable_id as territory_id', 'users.id', 'users.name', 'memberships.role']);
    }

    // --- Roles de Spatie (team = territorio) ---

    public function assignRole(User $user, int $teamId, string $role): void
    {
        $this->withTeam($teamId, $user, fn () => $user->assignRole($role));
    }

    public function removeRole(User $user, int $teamId, string $role): void
    {
        $this->withTeam($teamId, $user, fn () => $user->removeRole($role));
    }

    private function withTeam(int $teamId, User $user, callable $action): void
    {
        $registrar = app(PermissionRegistrar::class);
        $previous  = $registrar->getPermissionsTeamId();

        $registrar->setPermissionsTeamId($teamId);
        $user->unsetRelation('roles')->unsetRelation('permissions'); // Spatie cachea por team

        try {
            $action();
        } finally {
            $registrar->setPermissionsTeamId($previous);
            $user->unsetRelation('roles')->unsetRelation('permissions');
        }
    }
}