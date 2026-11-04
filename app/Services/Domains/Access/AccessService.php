<?php

namespace App\Services\Domains\Access;

use App\Models\User;
use InvalidArgumentException;

class AccessService
{
    public function __construct(
        protected AccessRepository $repo,
    ) {}

    /**
     * Todos los permisos declarados en config/access.php (tabs + acciones).
     * Las acciones pueden ir anidadas por módulo o planas: flatten() soporta ambas.
     */
    public function catalog(): array
    {
        $fromTabs = collect(config('access.modules', []))
            ->flatMap(fn ($pages) => collect($pages)
                ->flatMap(fn ($page) => array_values($page['tabs'] ?? [])));

        $fromActions = collect(config('access.actions', []))->flatten();

        return $fromTabs
            ->merge($fromActions)
            ->unique()
            ->values()
            ->all();
    }

    /** Crea los permisos que falten y aplica los defaults por rol (solo agrega, nunca quita). */
    public function syncCatalog(): array
    {
        $catalog = $this->catalog();

        foreach ($catalog as $name) {
            $this->repo->ensurePermission($name);
        }

        $granted = [];

        foreach (config('access.defaults', []) as $roleName => $permissions) {
            $role = $this->repo->findRole($roleName);

            if (! $role) {
                continue; // los roles los crea RoleSeeder
            }

            $names = $permissions === '*' ? $catalog : $permissions;

            // Un default que no existe en el catálogo es un typo: fallamos fuerte.
            $unknown = array_diff($names, $catalog);
            if ($unknown) {
                throw new InvalidArgumentException(
                    "Role [{$roleName}] defaults reference permissions missing from the catalog: " . implode(', ', $unknown)
                );
            }

            $this->repo->grant($role, $names);
            $granted[$roleName] = count($names);
        }

        $this->repo->flushCache();

        return ['permissions' => count($catalog), 'granted' => $granted];
    }

    /** Claves de las tabs de una página que el usuario puede ver, en el orden del catálogo. */
    public function allowedTabs(User $user, string $module, string $page): array
    {
        $tabs = config("access.modules.{$module}.{$page}.tabs", []);

        return collect($tabs)
            ->filter(fn (string $permission) => $user->can($permission))
            ->keys()
            ->values()
            ->all();
    }

    /** La tab pedida si está permitida; si no, la primera permitida. 403 si no tiene ninguna. */
    public function resolveTab(User $user, string $module, string $page, ?string $requested): string
    {
        $allowed = $this->allowedTabs($user, $module, $page);

        abort_if(empty($allowed), 403);

        return in_array($requested, $allowed, true) ? $requested : $allowed[0];
    }
}