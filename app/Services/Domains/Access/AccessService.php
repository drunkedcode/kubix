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
     * Muñeca activa (clave de config 'access.dolls') según los roles del usuario, o null
     * para el tablero de Kubix. El super admin está en el tablero en la zona de plataforma
     * y entra a la primera muñeca en las demás casas.
     */
    public function dollFor(array $roles, string $context): ?string
    {
        $dolls = config('access.dolls', []);

        if (in_array('super_admin', $roles, true)) {
            return $context === 'platform' ? null : array_key_first($dolls);
        }

        foreach ($dolls as $doll => $definition) {
            if (array_intersect($definition['roles'], $roles)) {
                return $doll;
            }
        }

        return null;
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

    /**
     * Pestañas que el usuario puede ver en cada página del sidebar, con las mismas claves que
     * navigation(): 'modulo' (página index) o 'modulo.pagina' (submódulo). Alimenta los atajos del menú.
     */
    public function navigationTabs(User $user, array $nav): array
    {
        return collect($nav)
            ->mapWithKeys(function (string $key) use ($user) {
                [$module, $page] = array_pad(explode('.', $key, 2), 2, 'index');

                return [$key => $this->allowedTabs($user, $module, $page)];
            })
            ->all();
    }

    /** Todas las pestañas declaradas de una página, sin evaluar permisos (vistas sin un territorio único). */
    public function allTabs(string $module, string $page): array
    {
        return array_keys(config("access.modules.{$module}.{$page}.tabs", []));
    }

    /**
     * Cada permiso del catálogo con el lugar donde vive: ['name', 'module', 'page', 'tab', 'kind' => tab|action].
     * Si un permiso se usa en varias pestañas, queda el primero declarado.
     */
    public function permissionMap(): array
    {
        $rows = [];

        foreach (config('access.modules', []) as $module => $pages) {
            foreach ($pages as $page => $definition) {
                foreach ($definition['tabs'] ?? [] as $tab => $permission) {
                    $rows[$permission] ??= ['name' => $permission, 'module' => $module, 'page' => $page, 'tab' => $tab, 'kind' => 'tab'];
                }
            }
        }

        foreach (config('access.actions', []) as $module => $permissions) {
            foreach ((array) $permissions as $permission) {
                $rows[$permission] ??= ['name' => $permission, 'module' => $module, 'page' => null, 'tab' => null, 'kind' => 'action'];
            }
        }

        return array_values($rows);
    }

    /** Permisos que tiene un rol. */
    public function permissionsOf(string $roleName): array
    {
        return $this->repo->permissionNamesOf($roleName);
    }
}
