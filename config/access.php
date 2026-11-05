<?php

/*
|--------------------------------------------------------------------------
| CATÁLOGO DE ACCESO (único lugar donde se escribe quién puede qué)
|--------------------------------------------------------------------------
|
| Kubix es una casa con dos puertas (Overview y Agency) y una zona de
| plataforma. Cada módulo es una habitación y cada pestaña una subhabitación.
| El permiso es la llave.
|
|   modules    -> lo que se VE: módulo => página => pestañas (clave => permiso).
|   actions    -> lo que se HACE sin ser una pestaña (botones, rutas de acción).
|   team_roles -> roles que se pueden asignar a una persona en un territorio.
|   defaults   -> permisos que recibe cada rol al sincronizar.
|
| Flujo para agregar algo nuevo:
|   1. Declararlo aquí (en modules o actions).
|   2. Si un rol debe tenerlo desde el inicio, sumarlo en defaults.
|   3. Proteger la ruta con can:<permiso>.
|   4. Correr:  php artisan access:sync
|
| Ojo: access:sync solo AGREGA permisos. Quitar uno de aquí no lo borra de
| la base de datos ni se lo quita a los roles.
|
*/

return [

    /*
    |--------------------------------------------------------------------------
    | MODULES: lo que se ve
    |--------------------------------------------------------------------------
    |
    | La página 'index' ES el módulo en el sidebar (su clic y sus pestañas).
    | Cualquier otra página con 'contexts' es un SUBMÓDULO: hijo del módulo, con
    | sus propias pestañas (los nombres de pestaña pueden repetirse entre páginas).
    | El orden de declaración es el orden del sidebar. 'contexts' dice en qué casa aparece:
    |
    |   overview -> totalizador de varios territorios (país, estado, ciudad o "mis barrios").
    |   agency   -> un barrio.
    |   platform -> zona global, solo super admin.
    |
    | Una página sin 'contexts' (ej. el detalle de un negocio) es un detalle:
    | no aparece en el sidebar. Un módulo se muestra si el usuario puede ver al
    | menos una pestaña de alguna de sus páginas.
    |
    */
    'modules' => [

        // Casa Overview: "Mis agencias".
        'overview' => [
            'index' => [
                'contexts' => ['overview'],
                'tabs' => [
                    'general'   => 'view-dashboard',
                    'evolution' => 'view-evolution-tab',
                ],
            ],
        ],

        // Casa Agency: la agencia del barrio.
        'agency' => [
            'index' => [
                'contexts' => ['agency'],
                'tabs' => [
                    'general'   => 'view-dashboard',
                    'evolution' => 'view-evolution-tab',
                    'settings'  => 'manage-agency', // también protege la ruta agencies.settings.update
                ],
            ],

            // Submódulo: reclamos y problemas reportados desde VI en el barrio.
            'issues' => [
                'contexts' => ['agency'],
                'tabs' => [
                    'general'  => 'view-issues',
                    'open'     => 'view-issues',
                    'resolved' => 'view-issues',
                ],
            ],
        ],

        'business' => [
            'index' => [
                'contexts' => ['agency'],
                'tabs' => [
                    'list' => 'view-business-list',
                ],
            ],

            // Detalle de un negocio (Business/Show).
            'show' => [
                'tabs' => [
                    'profile' => 'view-business-profile',
                    'finance' => 'view-business-finance',
                    'traffic' => 'view-business-traffic',
                    'ads'     => 'view-business-ads',
                ],
            ],
        ],

        // Equipo: quién trabaja en el territorio.
        'team' => [
            'index' => [
                'contexts' => ['overview', 'agency'],
                'tabs' => [
                    'members' => 'view-team',
                ],
            ],
        ],

        // Zona de plataforma: explorador de territorios.
        'territories' => [
            'index' => [
                'contexts' => ['platform'],
                'tabs' => [
                    'explorer' => 'view-territory-explorer',
                ],
            ],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | ACTIONS: lo que se hace (no pertenece a una pestaña)
    |--------------------------------------------------------------------------
    */
    'actions' => [
        // Crear y editar negocios (rutas businesses.create / businesses.store).
        'business'    => ['manage-business'],

        // Gestionar el tráfico pago y los ads del barrio.
        'advertising' => ['manage-advertising'],

        // Responder, asignar y cerrar reclamos del barrio.
        'issues'      => ['manage-issues'],

        // Agregar y quitar personas del equipo (rutas team.create / team.store / team.destroy).
        'team'        => ['manage-team'],
    ],

    /*
    |--------------------------------------------------------------------------
    | TEAM_ROLES: roles que se pueden asignar a una persona en un territorio
    |--------------------------------------------------------------------------
    |
    | Es lo que ofrece el wizard de Equipo. Cada entrada:
    |
    |   label       -> nombre que se muestra.
    |   description -> ayuda bajo el selector (opcional).
    |   manager_of  -> si está, es el rol de gerente de ese tipo de territorio
    |                  (country|state|city|neighborhood). Estos son roles de Spatie
    |                  y su nombre debe coincidir con RoleSeeder.
    |   levels      -> en qué tipos de territorio se puede asignar un rol de equipo
    |                  (los que no son de gerente). Hoy solo se guardan como membresía;
    |                  se vuelven roles de Spatie cuando tengan permisos propios.
    |
    | Quién puede asignar qué:
    |   - El super admin asigna cualquiera.
    |   - Quien gerencia un territorio NO nombra otro gerente de ese mismo nivel,
    |     pero sí a su equipo. Un gerente de nivel superior sí nombra al gerente
    |     del territorio que tiene debajo.
    |
    */
    'team_roles' => [

        // Gerentes (uno por tipo de territorio).
        'country_admin'  => ['label' => 'Gerente de país',   'manager_of' => 'country'],
        'state_admin'    => ['label' => 'Gerente de estado', 'manager_of' => 'state'],
        'city_admin'     => ['label' => 'Gerente de ciudad', 'manager_of' => 'city'],
        'district_admin' => ['label' => 'Gerente de barrio', 'manager_of' => 'neighborhood'],

        // Equipo del barrio.
        'promoter' => [
            'label'       => 'Promotor',
            'description' => 'Capta negocios para el barrio.',
            'levels'      => ['neighborhood'],
        ],
        'traffic_manager' => [
            'label'       => 'Gestor de tráfico',
            'description' => 'Gestiona las campañas de tráfico pago del barrio.',
            'levels'      => ['neighborhood'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | DEFAULTS: permisos iniciales de cada rol
    |--------------------------------------------------------------------------
    |
    | Lo que recibe cada rol al correr access:sync. Solo agrega, nunca quita.
    | '*' significa "todos los permisos del catálogo".
    | Los nombres de rol deben coincidir con los de RoleSeeder.
    |
    */
    'defaults' => [

        // Super admin: todo el catálogo.
        'super_admin'    => '*',

        // Gerentes de país, estado y ciudad: supervisan y arman su equipo.
        'country_admin'  => ['view-dashboard', 'view-evolution-tab', 'view-business-list', 'view-business-profile', 'view-team', 'manage-team', 'view-issues'],
        'state_admin'    => ['view-dashboard', 'view-evolution-tab', 'view-business-list', 'view-business-profile', 'view-team', 'manage-team', 'view-issues'],
        'city_admin'     => ['view-dashboard', 'view-evolution-tab', 'view-business-list', 'view-business-profile', 'view-team', 'manage-team', 'view-issues'],

        // Gerente de barrio (Pedro): gestiona su agencia, negocios, finanzas, tráfico, ads y su equipo.
        'district_admin' => [
            'view-dashboard',
            'view-evolution-tab',
            'manage-agency',
            'manage-business',
            'manage-advertising',
            'view-business-list',
            'view-business-profile',
            'view-business-finance',
            'view-business-traffic',
            'view-business-ads',
            'view-team',
            'manage-team',
            'view-issues',
            'manage-issues',
        ],
    ],
];
