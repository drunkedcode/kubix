<?php

namespace App\Services\Domains\Goal;

use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Business\BusinessService;
use Carbon\Carbon;

/** Metas mensuales de las personas del equipo y cuánto llevan logrado. Hoy una sola: negocios captados. */
class GoalService
{
    public const CAPTURED = 'captured';

    public function __construct(
        protected GoalRepository $repo,
        protected BusinessService $businesses,
    ) {}

    /**
     * Meta y avance de cada persona en el mes: [id => ['target' => meta o null, 'progress' => captados en el mes]].
     */
    public function monthFor(Territory $territory, array $userIds, Carbon $month): array
    {
        $targets = $this->repo->targets($territory->id, self::CAPTURED, $month);
        $from    = $month->copy()->startOfMonth();
        $to      = $month->copy()->endOfMonth();
        $result  = [];

        foreach ($userIds as $userId) {
            $result[$userId] = [
                'target'   => $targets[$userId] ?? null,
                'progress' => $this->businesses->countReferredBetween($userId, $territory->id, $from, $to),
            ];
        }

        return $result;
    }

    /** Fija la meta del mes de una persona. */
    public function set(User $actor, Territory $territory, int $userId, int $target, Carbon $month): void
    {
        $this->repo->save($territory->id, $userId, self::CAPTURED, $month, $target, $actor->id);
    }
}
