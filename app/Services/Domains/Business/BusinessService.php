<?php

namespace App\Services\Domains\Business;

use App\Models\Business;
use App\Services\Domains\Location\LocationService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class BusinessService
{
    public function __construct(
        protected BusinessRepository $repo,
        protected LocationService $locationService,
    ) {}

    public function register(array $data, ?int $userId = null): array
    {
        $business = $this->repo->create([
            'name'   => $data['name'],
            'slug'   => $data['slug'] ?? Str::slug($data['name']),
            'status' => $data['status'] ?? 'active',
        ]);

        $locationResult = $this->locationService->saveFor($business, $data['location'] ?? [], $userId);

        return ['business' => $business, 'location' => $locationResult];
    }

    public function find(int $id): ?Business
    {
        return $this->repo->findByIdWithLocations($id);
    }

    public function listForTerritory(int $territoryId): Collection
    {
        return $this->repo->forTerritory($territoryId);
    }

    /** Negocios de varios territorios a la vez (el barrio y todo lo que cuelga de un nivel superior). */
    public function listForTerritories(array $territoryIds): Collection
    {
        return $this->repo->forTerritories($territoryIds);
    }

    public function countForTerritories(array $territoryIds): int
    {
        return $this->repo->countForTerritories($territoryIds);
    }

    public function trendForTerritories(array $territoryIds, int $weeks = 8): array
    {
        return $this->buildCumulativeTrend($this->repo->allCreatedAtForTerritories($territoryIds), $weeks);
    }

    public function trendSummary(array $trend): array
    {
        $first = $trend[0]['count'] ?? 0;
        $last = end($trend)['count'] ?? 0;

        return ['total' => $last, 'delta' => $last - $first];
    }

    public function recentForTerritories(array $territoryIds, int $limit = 5): array
    {
        return $this->mapRecent($this->repo->recentForTerritories($territoryIds, $limit));
    }

    public function toMarkers(Collection $businesses): array
    {
        return $businesses
            ->map(function (Business $business) {
                $location = $business->locations->firstWhere('is_primary', true)
                    ?? $business->locations->first();

                if (! $location) {
                    return null;
                }

                return [
                    'id'       => $business->id,
                    'lat'      => (float) $location->latitude,
                    'lng'      => (float) $location->longitude,
                    'title'    => $business->name,
                    'subtitle' => null,
                    'color'    => '#2dd4bf',
                    'glyph'    => '✓',
                    'badge'    => 'Activo',
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    private function mapRecent(Collection $businesses): array
    {
        return $businesses
            ->map(fn(Business $b) => [
                'id'   => $b->id,
                'name' => $b->name,
                'date' => $b->created_at->format('d/m/Y'),
            ])
            ->values()
            ->all();
    }

    private function buildCumulativeTrend(Collection $timestamps, int $weeks): array
    {
        $sorted = $timestamps->map(fn($t) => Carbon::parse($t))->sort()->values();

        $points = [];
        for ($i = $weeks - 1; $i >= 0; $i--) {
            $weekEnd = now()->subWeeks($i)->endOfWeek();

            $points[] = [
                'label' => $weekEnd->format('d/m'),
                'count' => $sorted->filter(fn($t) => $t->lte($weekEnd))->count(),
            ];
        }

        return $points;
    }

    public function toTableRows(Collection $businesses, string $territoryName): array
    {
        return $businesses
            ->map(fn(Business $business) => [
                'id'       => $business->id,
                'name'     => $business->name,
                'location' => $territoryName,
                'category' => '—',
                'status'   => $business->status === 'active' ? 'active' : 'inactive',
                'dueLabel' => '—',
            ])
            ->values()
            ->all();
    }
}