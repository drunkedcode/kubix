<?php

namespace App\Services\Domains\Activity;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Registro de lo que pasa en cada territorio (Atividades Recentes, Histórico).
 * Los demás servicios lo llaman al hacer algo que vale la pena recordar.
 */
class ActivityService
{
    /** Evento => [tipo que pinta el front, título]. Lo que no figura acá no se muestra. */
    private const EVENTS = [
        'business.registered' => ['business_created', 'Novo negócio cadastrado'],
        'business.activated'  => ['business_activated', 'Negócio aprovado'],
        'payment.received'    => ['payment_received', 'Pagamento recebido'],
        'promotion.activated' => ['promotion_activated', 'Campanha ativada'],
        'promotion.paused'    => ['promotion_paused', 'Campanha pausada'],
        'promotion.resumed'   => ['promotion_resumed', 'Campanha reativada'],
        'member.assigned'     => ['member_added', 'Membro adicionado à equipe'],
        'member.removed'      => ['member_removed', 'Membro removido da equipe'],
        'issue.in_progress'   => ['issue_started', 'Reclamação em andamento'],
        'issue.resolved'      => ['issue_resolved', 'Reclamação resolvida'],
    ];

    public function __construct(
        protected ActivityRepository $repo,
    ) {}

    /** Anota un evento: $actorId es quien lo hizo (null = el sistema) y $subject sobre qué fue. */
    public function record(int $territoryId, ?int $actorId, Model $subject, string $event, array $properties = []): void
    {
        $this->repo->create([
            'territory_id' => $territoryId,
            'actor_id'     => $actorId,
            'subject_type' => $subject->getMorphClass(),
            'subject_id'   => $subject->getKey(),
            'event'        => $event,
            'properties'   => $properties ?: null,
        ]);
    }

    /** Últimos eventos de los territorios, listos para el panel de Atividades Recentes. */
    public function recent(array $territoryIds, int $limit = 5): array
    {
        return $this->present($this->repo->recentFor($territoryIds, $limit * 3), $limit);
    }

    /** Lo que hizo esa persona en el territorio. */
    public function byActor(int $territoryId, int $actorId, int $limit = 20): array
    {
        return $this->present($this->repo->byActor($territoryId, $actorId, $limit * 3), $limit);
    }

    /** Lo que le pasó a $subject en el territorio (por ejemplo, su alta o baja del equipo). */
    public function about(int $territoryId, Model $subject, int $limit = 20): array
    {
        return $this->present(
            $this->repo->about($territoryId, $subject->getMorphClass(), $subject->getKey(), $limit * 3),
            $limit,
        );
    }

    public function countByActor(int $territoryId, int $actorId): int
    {
        return $this->repo->countByActor($territoryId, $actorId);
    }

    /** Eventos conocidos, con título en portugués y tiempo relativo. */
    private function present(Collection $logs, int $limit): array
    {
        return $logs
            ->filter(fn ($log) => isset(self::EVENTS[$log->event]))
            ->take($limit)
            ->map(fn ($log) => [
                'type'     => self::EVENTS[$log->event][0],
                'title'    => self::EVENTS[$log->event][1],
                'subtitle' => $log->properties['name'] ?? '',
                'time'     => $log->created_at->copy()->locale('pt_BR')->diffForHumans(),
            ])
            ->values()
            ->all();
    }
}
