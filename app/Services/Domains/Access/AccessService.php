<?php

namespace App\Services\Domains\Access;

use App\Models\Territory;
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

    /** Casa en la que está parado el usuario: platform | overview | agency. */
    public function contextFor(?Territory $territory, ?string $routeName): string
    {
        if (! $territory) {
            return str_starts_with((string) $routeName, 'territories.') ? 'platform' : 'overview';
        }

        return $territory->type === 'neighborhood' ? 'agency' : 'overview';
    }

    /**
     * Módulos que son puerta de la casa actual y en los que el usuario puede ver
     * al menos una pestaña. Es lo que dibuja el sidebar.
     */
    public function navigation(User $user, ?Territory $territory, ?string $routeName): array
    {
        $context = $this->contextFor($territory, $routeName);

        // Sin territorio no hay equipo de permisos que evaluar: solo la puerta del overview
        // (su ruta no pide permiso; OverviewService ya filtra por membresías).
        if (! $territory && $context === 'overview') {
            return ['overview'];
        }

        // Una clave por página visible: 'modulo' (la página index) o 'modulo.pagina' (submódulo).
        return collect(config('access.modules', []))
            ->flatMap(fn ($pages, $module) => collect($pages)
                ->filter(fn ($page) => in_array($context, $page['contexts'] ?? [], true)
                    && collect($page['tabs'] ?? [])->contains(fn (string $permission) => $user->can($permission)))
                ->keys()
                ->map(fn ($name) => $name === 'index' ? $module : "{$module}.{$name}"))
            ->values()
            ->all();
    }

    /** Todas las pestañas declaradas de una página, sin evaluar permisos (vistas sin un territorio único). */
    public function allTabs(string $module, string $page): array
    {
        return array_keys(config("access.modules.{$module}.{$page}.tabs", []));
    }
}
