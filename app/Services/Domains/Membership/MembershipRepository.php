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