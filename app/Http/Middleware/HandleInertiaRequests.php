<?php

namespace App\Http\Middleware;

use App\Services\Domains\Access\AccessService;
use App\Services\Domains\Membership\MembershipService;
use App\Services\Domains\Territory\TerritoryScopeService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user    = $request->user();
        $isSuper = $user ? app(MembershipService::class)->isSuperAdmin($user) : false;

        return [
            ...parent::share($request),

            'auth' => [
                'user'  => fn() => $user?->only('id', 'name', 'email'),
                'roles' => fn() => $isSuper ? ['super_admin'] : ($user?->getRoleNames() ?? []),
            ],

            // Territorio actual. "type" (country|state|city|neighborhood) define
            // qué módulos muestra el sidebar.
            'territory' => fn() => app()->bound('currentTerritory')
                ? [
                    'slug' => app('currentTerritory')->slug,
                    'name' => app('currentTerritory')->name,
                    'type' => app('currentTerritory')->type,
                ]
                : null,


            // Cascada País → Estado → Ciudad → Barrio del header, según el nivel del usuario.
            // Se llama "cascade" para no chocar con props de página como "scope".
            'cascade' => fn() => $user
                ? app(TerritoryScopeService::class)->forUser(
                    $user,
                    $isSuper,
                    app()->bound('currentTerritory') ? app('currentTerritory') : null,
                )
                : null,

            // Módulos del sidebar: los de la casa actual en los que el usuario puede ver algo.
            'nav' => fn() => $user
                ? app(AccessService::class)->navigation(
                    $user,
                    app()->bound('currentTerritory') ? app('currentTerritory') : null,
                    $request->route()?->getName(),
                )
                : [],

            // Pestañas visibles por cada módulo del sidebar (atajos hijos del menú). Diferido, como "nav".
            'navTabs' => fn() => $user
                ? app(AccessService::class)->navigationTabs(
                    $user,
                    app(AccessService::class)->navigation(
                        $user,
                        app()->bound('currentTerritory') ? app('currentTerritory') : null,
                        $request->route()?->getName(),
                    ),
                )
                : [],

            // Muñeca activa (define el tema): clave de config 'access.dolls' o null = tablero Kubix.
            'doll' => fn() => $user
                ? app(AccessService::class)->dollFor(
                    $isSuper ? ['super_admin'] : $user->getRoleNames()->all(),
                    app(AccessService::class)->contextFor(
                        app()->bound('currentTerritory') ? app('currentTerritory') : null,
                        $request->route()?->getName(),
                    ),
                )
                : null,

            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error'   => fn() => $request->session()->get('error'),
            ],
        ];
    }
}