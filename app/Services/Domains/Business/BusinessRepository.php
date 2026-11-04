<?php

namespace App\Services\Domains\Business;

use App\Models\Business;
use Illuminate\Support\Collection;

class BusinessRepository
{
    public function create(array $attrs): Business
    {
        return Business::create($attrs);
    }

    public function findById(int $id): ?Business
    {
        return Business::find($id);
    }

    public function findByIdWithLocations(int $id): ?Business
    {
        return Business::with('locations')->find($id);
    }

    public function forTerritory(int $territoryId): Collection
    {
        return Business::whereHas('locations', fn ($q) => $q->where('territory_id', $territoryId))
            ->with('locations')
            ->orderBy('name')
            ->get();
    }

    public function forTerritories(array $territoryIds): Collection
    {
        return Business::whereHas('locations', fn ($q) => $q->whereIn('territory_id', $territoryIds))
            ->with('locations')
            ->orderBy('name')
            ->get();
    }

    public function countForTerritories(array $territoryIds): int
    {
        return Business::whereHas('locations', fn ($q) => $q->whereIn('territory_id', $territoryIds))->count();
    }

    public function allCreatedAtForTerritories(array $territoryIds): Collection
    {
        return Business::whereHas('locations', fn ($q) => $q->whereIn('territory_id', $territoryIds))
            ->pluck('created_at');
    }

    public function recentForTerritories(array $territoryIds, int $limit = 5): Collection
    {
        return Business::whereHas('locations', fn ($q) => $q->whereIn('territory_id', $territoryIds))
            ->latest()
            ->limit($limit)
            ->get(['id', 'name', 'created_at']);
    }
    
}