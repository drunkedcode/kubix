<?php

namespace App\Services\Domains\Access;

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class AccessRepository
{
    public function ensurePermission(string $name): Permission
    {
        return Permission::findOrCreate($name, 'web');
    }

    public function findRole(string $name): ?Role
    {
        return Role::query()
            ->where('name', $name)
            ->where('guard_name', 'web')
            ->first();
    }

    /** Additive: attaches missing permissions, never detaches. */
    public function grant(Role $role, array $permissionNames): void
    {
        $role->givePermissionTo($permissionNames);
    }

    public function flushCache(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}