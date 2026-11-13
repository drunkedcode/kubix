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
|   dolls      -> muñecas (VI, inmuebles...) y los roles que pertenecen a cada una.
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
                    'territories' => 'view-dashboard',
                    'general'     => 'view-dashboard',
                    'evolution'   => 'view-evolution-tab',
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
                    'list'       => 'view-business-list',
                    'approvals'  => 'view-business-approvals',
                    'categories' => 'view-business-categories',
                ],
            ],

            // Detalle de un negocio (Business/Show).
            'show' => [
                'tabs' => [
                    'profile' => 'view-business-profile',
                    'finance' => 'view-business-finance',
                    'traffic' => 'view-business-traffic',
                    'ads'     => 'view-business-ads',
                    'history' => 'view-business-profile',
                ],
            ],
        ],

        // Equipo: quién trabaja en el territorio.
        'team' => [
            'index' => [
                'contexts' => ['overview', 'agency'],
                'tabs' => [
                    'members' => 'view-team',
                    'roles'   => 'view-team',
                    'productivity' => 'view-team',
                    'goals'   => 'view-team',
                ],
            ],

            // Detalle de una persona del equipo (Team/Show).
            'show' => [
                'tabs' => [
                    'businesses' => 'view-team',
                    'activities' => 'view-team',
                    'history'    => 'view-team',
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
    |                  (los que no son de gerente). Todos son roles de Spatie: sus permisos
    |                  salen de 'defaults'.
|   referral    -> si es true, quien recibe este rol obtiene un código de promotor
|                  para atribuirle los negocios que capta (users.referral_code).
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
        'country_admin'  => ['label' => 'Gerente de País',   'manager_of' => 'country'],
        'state_admin'    => ['label' => 'Gerente de Estado', 'manager_of' => 'state'],
        'city_admin'     => ['label' => 'Gerente de Cidade', 'manager_of' => 'city'],
        'district_admin' => ['label' => 'Gerente de Bairro', 'manager_of' => 'neighborhood'],

        // Equipo del barrio.
        'promoter' => [
            'label'       => 'Promotor',
            'description' => 'Capta negócios para o bairro.',
            'levels'      => ['neighborhood'],
            'referral'    => true,
        ],
        'traffic_manager' => [
            'label'       => 'Gestor de tráfego',
            'description' => 'Gerencia as campanhas de tráfego pago do bairro.',
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

        // Gestor de tráfego: entra a los negócios del bairro y gerencia sus campañas.
        // El promotor no tiene permisos en el admin: trabaja desde la PWA con su código.
        'traffic_manager' => ['view-dashboard', 'view-business-list', 'view-business-profile', 'view-business-traffic', 'view-business-ads', 'manage-advertising'],

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
            'view-business-approvals',
            'view-business-categories',
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

    /*
    |--------------------------------------------------------------------------
    | DOLLS: muñecas (productos) y los roles que pertenecen a cada una
    |--------------------------------------------------------------------------
    |
    | Kubix es el tablero; cada producto (VI, inmuebles...) es una muñeca con su
    | propio tema. El rol pertenece a su muñeca: la muñeca de una persona sale de
    | su rol y quien está dentro de una no ve las otras. El super admin se mueve
    | libre: en la zona de plataforma está en el tablero (tema Kubix) y en las demás
    | casas entra a la primera muñeca (hasta que exista un selector).
    |
    | La clave es el nombre del tema en CSS: [data-doll="vi"] en resources/css/app.css.
    |
    */
    'dolls' => [
        'vi' => [
            'roles' => ['country_admin', 'state_admin', 'city_admin', 'district_admin', 'promoter', 'traffic_manager'],
        ],
    ],
];
