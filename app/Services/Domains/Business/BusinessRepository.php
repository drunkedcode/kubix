<?php

namespace App\Services\Domains\Business;

use App\Models\Business;
use Illuminate\Pagination\LengthAwarePaginator;
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

    /** Página de negocios del barrio con filtros opcionales: búsqueda por nombre, rubro y estados. */
    public function paginateForTerritory(int $territoryId, array $filters, int $perPage): LengthAwarePaginator
    {
        return Business::whereHas('locations', fn ($q) => $q->where('territory_id', $territoryId))
            ->when($filters['segment'] ?? null, fn ($q, $segment) => $q->where('segment', $segment))
            ->when($filters['search'] ?? null, fn ($q, $search) => $q->where('name', 'like', '%' . addcslashes($search, '%_') . '%'))
            ->when($filters['statuses'] ?? [], fn ($q, $statuses) => $q->whereIn('status', $statuses))
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function activate(Business $business, ?int $userId): Business
    {
        $business->update([
            'status'       => 'active',
            'activated_at' => now(),
            'activated_by' => $userId,
        ]);

        return $business;
    }

    public function slugExists(string $slug): bool
    {
        return Business::where('slug', $slug)->exists();
    }

    public function addMember(Business $business, int $userId, string $role): void
    {
        $business->members()->attach($userId, ['role' => $role]);
    }

    public function hasMember(Business $business, int $userId, string $role): bool
    {
        return $business->members()
            ->wherePivot('role', $role)
            ->where('users.id', $userId)
            ->exists();
    }

    /** Negocios en los que la persona tiene ese rol (por ejemplo, owner). */
    public function forMember(int $userId, string $role): Collection
    {
        return Business::whereHas('members', fn ($q) => $q->where('users.id', $userId)->where('memberships.role', $role))
            ->orderBy('name')
            ->get();
    }

    /** Negocios activos del barrio para el Diretório: filtro por segmento, búsqueda por nombre y paginación. */
    public function activeForTerritory(int $territoryId, ?string $segment, ?string $search, int $perPage): LengthAwarePaginator
    {
        return Business::where('status', 'active')
            ->whereHas('locations', fn ($q) => $q->where('territory_id', $territoryId))
            ->when($segment, fn ($q) => $q->where('segment', $segment))
            ->when($search, fn ($q) => $q->where('name', 'like', '%' . addcslashes($search, '%_') . '%'))
            ->with('locations')
            ->orderBy('name')
            ->paginate($perPage);
    }
}
