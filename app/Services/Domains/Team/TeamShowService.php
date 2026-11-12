<?php

namespace App\Services\Domains\Team;

use App\Models\Territory;
use App\Services\Domains\Activity\ActivityService;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Issue\IssueService;
use App\Services\Domains\Membership\MembershipService;
use App\Services\Domains\User\UserService;

/*
|--------------------------------------------------------------------------
| EQUIPO / DETALLE DE UNA PERSONA: LO QUE MUESTRA CADA PESTAÑA
|--------------------------------------------------------------------------
| Pantalla: Pages/Team/Show.tsx · catálogo: team.show
| Un método por pestaña, con el nombre de su clave, más el perfil y los
| números del encabezado, que van en todas.
*/

class TeamShowService
{
    public function __construct(
        protected MembershipService $memberships,
        protected BusinessService $businesses,
        protected IssueService $issues,
        protected ActivityService $activity,
        protected UserService $users,
    ) {}

    /** Perfil de la persona en este equipo (404 si no es del equipo). */
    public function profile(Territory $territory, int $userId): array
    {
        return $this->memberships->memberProfile($territory->id, $userId);
    }

    /** Lo que hizo la persona en este barrio: negocios captados y activos, reclamaciones resueltas y acciones. */
    public function numbers(Territory $territory, int $userId): array
    {
        $referred = collect($this->businesses->referredBy($userId, $territory->id));

        return [
            'captured' => $referred->count(),
            'active'   => $referred->where('status', 'active')->count(),
            'resolved' => $this->issues->countResolvedBy($territory->id, $userId),
            'actions'  => $this->activity->countByActor($territory->id, $userId),
        ];
    }

    /** Las 4 tarjetas del encabezado, calculadas sobre lo que hizo en este barrio. */
    public function kpis(Territory $territory, int $userId): array
    {
        $n = $this->numbers($territory, $userId);

        return [
            ['label' => 'Negócios Captados',      'value' => $n['captured'], 'icon' => 'store',  'tone' => 'amber'],
            ['label' => 'Negócios Ativos',        'value' => $n['active'],   'icon' => 'check',  'tone' => 'green'],
            ['label' => 'Reclamações Resolvidas', 'value' => $n['resolved'], 'icon' => 'issues', 'tone' => 'blue'],
            ['label' => 'Ações Registradas',      'value' => $n['actions'],  'icon' => 'zap',    'tone' => 'purple'],
        ];
    }

    /** Pestaña businesses: los negocios que captó esta persona. */
    public function businesses(Territory $territory, int $userId): array
    {
        return ['businesses' => $this->businesses->referredBy($userId, $territory->id)];
    }

    /** Pestaña activities: lo que hizo esta persona. */
    public function activities(Territory $territory, int $userId): array
    {
        return ['activities' => $this->activity->byActor($territory->id, $userId)];
    }

    /** Pestaña history: lo que le pasó a esta persona en el equipo (altas y bajas). */
    public function history(Territory $territory, int $userId): array
    {
        $user = $this->users->find($userId);

        abort_if(! $user, 404);

        return ['history' => $this->activity->about($territory->id, $user)];
    }
}
