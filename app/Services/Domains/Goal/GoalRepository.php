<?php

namespace App\Services\Domains\Goal;

use App\Models\Goal;
use Carbon\Carbon;

class GoalRepository
{
    /** Metas del mes en el barrio: [id de persona => meta]. */
    public function targets(int $territoryId, string $metric, Carbon $month): array
    {
        return Goal::where('territory_id', $territoryId)
            ->where('metric', $metric)
            ->whereDate('month', $month->copy()->startOfMonth()->toDateString())
            ->pluck('target', 'user_id')
            ->all();
    }

    /** Crea la meta del mes de la persona o actualiza la que ya tenía. */
    public function save(int $territoryId, int $userId, string $metric, Carbon $month, int $target, ?int $setBy): void
    {
        Goal::updateOrCreate(
            [
                'territory_id' => $territoryId,
                'user_id'      => $userId,
                'metric'       => $metric,
                'month'        => $month->copy()->startOfMonth()->toDateString(),
            ],
            ['target' => $target, 'set_by' => $setBy],
        );
    }
}
