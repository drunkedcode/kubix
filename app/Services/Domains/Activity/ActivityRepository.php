<?php

namespace App\Services\Domains\Activity;

use App\Models\ActivityLog;
use Illuminate\Support\Collection;

class ActivityRepository
{
    public function create(array $data): ActivityLog
    {
        return ActivityLog::create($data);
    }

    /** Últimos eventos de varios territorios, el más nuevo primero. */
    public function recentFor(array $territoryIds, int $limit): Collection
    {
        return ActivityLog::whereIn('territory_id', $territoryIds)
            ->latest('created_at')
            ->latest('id')
            ->limit($limit)
            ->get();
    }

    /** Eventos que hizo esa persona en el territorio, el más nuevo primero. */
    public function byActor(int $territoryId, int $actorId, int $limit): Collection
    {
        return ActivityLog::where('territory_id', $territoryId)
            ->where('actor_id', $actorId)
            ->latest('created_at')
            ->latest('id')
            ->limit($limit)
            ->get();
    }

    public function countByActor(int $territoryId, int $actorId): int
    {
        return ActivityLog::where('territory_id', $territoryId)->where('actor_id', $actorId)->count();
    }

    /** Eventos que le pasaron a algo (por ejemplo, a una persona del equipo), el más nuevo primero. */
    public function about(int $territoryId, string $subjectType, int $subjectId, int $limit): Collection
    {
        return ActivityLog::where('territory_id', $territoryId)
            ->where('subject_type', $subjectType)
            ->where('subject_id', $subjectId)
            ->latest('created_at')
            ->latest('id')
            ->limit($limit)
            ->get();
    }
}
