<?php

namespace App\Services\Domains\Issue;

use App\Models\Issue;
use Illuminate\Support\Collection;

class IssueRepository
{
    /** Reclamos del barrio con quien los reportó, el más nuevo primero. */
    public function forTerritory(int $territoryId): Collection
    {
        return Issue::with('reporter')
            ->where('territory_id', $territoryId)
            ->latest('created_at')
            ->latest('id')
            ->get();
    }

    /** El reclamo, solo si pertenece a ese barrio. */
    public function findInTerritory(int $id, int $territoryId): ?Issue
    {
        return Issue::where('territory_id', $territoryId)->find($id);
    }

    /** Cuántos reclamos del barrio resolvió esa persona. */
    public function countResolvedBy(int $territoryId, int $userId): int
    {
        return Issue::where('territory_id', $territoryId)->where('resolved_by', $userId)->count();
    }

    public function update(Issue $issue, array $data): Issue
    {
        $issue->update($data);

        return $issue;
    }
}
