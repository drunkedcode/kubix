<?php

namespace App\Services\Domains\Business;

use App\Enums\BusinessSegment;
use App\Models\Business;
use App\Models\User;
use App\Services\Domains\Location\LocationService;
use Carbon\Carbon;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class BusinessService
{
    /** Estados que admite el filtro de la lista. */
    private const STATUSES = ['active', 'standby', 'inactive'];

    public function __construct(
        protected BusinessRepository $repo,
        protected LocationService $locationService,
    ) {}

    public function register(array $data, ?int $userId = null): array
    {
        $business = $this->repo->create([
            'name'          => $data['name'],
            'slug'          => $this->uniqueSlug($data['slug'] ?? $data['name']),
            'segment'       => $data['segment'],
            'phone'         => $data['phone'] ?? null,
            'document'      => $data['document'] ?? null,
            'status'        => $data['status'] ?? 'standby',
            'settings'      => $data['settings'] ?? null,
            'registered_by' => $userId,
            'referred_by'   => $data['referred_by'] ?? null,
        ]);

        $locationResult = $this->locationService->saveFor($business, $data['location'] ?? [], $userId);

        return ['business' => $business, 'location' => $locationResult];
    }

    /** Negocios activos de un barrio (Diretório de la app), paginados. */
    public function directoryFor(int $territoryId, ?string $segment = null, ?string $search = null, int $perPage = 20): LengthAwarePaginator
    {
        return $this->repo->activeForTerritory($territoryId, $segment, $search, $perPage);
    }

    /** Negocios de los que la persona es dueña, resumidos para la app. */
    public function ownedBy(User $user): array
    {
        return $this->repo->forMember($user->id, 'owner')
            ->map(fn (Business $business) => [
                'id'      => $business->id,
                'name'    => $business->name,
                'slug'    => $business->slug,
                'segment' => $business->segment,
                'status'  => $business->status,
            ])
            ->values()
            ->all();
    }

    /** Deja a la persona como dueña del negocio. */
    public function addOwner(Business $business, int $userId): void
    {
        $this->repo->addMember($business, $userId, 'owner');
    }

    public function isOwner(User $user, Business $business): bool
    {
        return $this->repo->hasMember($business, $user->id, 'owner');
    }

    public function find(int $id): ?Business
    {
        return $this->repo->findByIdWithLocations($id);
    }

    /** Barrio del negocio: el de su ubicación principal (null si no tiene ubicación). */
    public function territoryIdOf(Business $business): ?int
    {
        $business->loadMissing('locations');

        $location = $business->locations->firstWhere('is_primary', true)
            ?? $business->locations->first();

        return $location?->territory_id;
    }

    /** Pasa el negocio a activo: pagó el onboarding, o alguien del equipo lo marcó a mano. */
    public function activate(Business $business, ?int $userId = null): Business
    {
        return $this->repo->activate($business, $userId);
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

    /** Últimos movimientos de los negocios (altas y activaciones), el más nuevo primero. */
    public function activityForTerritories(array $territoryIds, int $limit = 5): array
    {
        return $this->repo->forTerritories($territoryIds)
            ->flatMap(function (Business $business) {
                $events = [[
                    'type'     => 'business_created',
                    'title'    => 'Novo negócio cadastrado',
                    'subtitle' => $business->name,
                    'at'       => $business->created_at,
                ]];

                if ($business->activated_at) {
                    $events[] = [
                        'type'     => 'business_activated',
                        'title'    => 'Negócio aprovado',
                        'subtitle' => $business->name,
                        'at'       => $business->activated_at,
                    ];
                }

                return $events;
            })
            ->sortByDesc('at')
            ->take($limit)
            ->map(fn (array $event) => [
                'type'     => $event['type'],
                'title'    => $event['title'],
                'subtitle' => $event['subtitle'],
                'time'     => $event['at']->copy()->locale('pt_BR')->diffForHumans(),
            ])
            ->values()
            ->all();
    }

    /** Cuántos negocios hay por categoría (total y activos), de mayor a menor; incluye las vacías. */
    public function countBySegment(array $territoryIds): array
    {
        $bySegment = $this->listForTerritories($territoryIds)->groupBy('segment');

        return collect(BusinessSegment::cases())
            ->map(fn (BusinessSegment $segment) => [
                'segment' => $segment->value,
                'label'   => $segment->label(),
                'total'   => $bySegment->get($segment->value, collect())->count(),
                'active'  => $bySegment->get($segment->value, collect())->where('status', 'active')->count(),
            ])
            ->sortByDesc('total')
            ->values()
            ->all();
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

    /** Slug libre: si "padaria-do-ze" existe, prueba "padaria-do-ze-2", "-3"... */
    private function uniqueSlug(string $base): string
    {
        $slug   = Str::slug($base);
        $unique = $slug;
        $n      = 2;

        while ($this->repo->slugExists($unique)) {
            $unique = "{$slug}-{$n}";
            $n++;
        }

        return $unique;
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

    /** Una página de negocios del barrio con filtros (búsqueda, rubro, estados), lista para pintar. */
    public function pageFor(int $territoryId, array $filters, int $perPage = 10): array
    {
        $page = $this->repo->paginateForTerritory($territoryId, [
            'search'   => trim((string) ($filters['search'] ?? '')),
            'segment'  => BusinessSegment::tryFrom((string) ($filters['segment'] ?? ''))?->value,
            'statuses' => array_values(array_intersect((array) ($filters['statuses'] ?? []), self::STATUSES)),
        ], $perPage);

        return [
            'rows' => $page->getCollection()
                ->map(fn (Business $business) => [
                    'id'       => $business->id,
                    'name'     => $business->name,
                    'subtitle' => $business->phone,
                    'category' => BusinessSegment::tryFrom((string) $business->segment)?->label() ?? $business->segment,
                    'segment'  => $business->segment,
                    'status'   => $business->status,
                    'registered' => $business->created_at?->format('d/m/Y'),
                ])
                ->values()
                ->all(),
            'page' => [
                'current' => $page->currentPage(),
                'last'    => $page->lastPage(),
                'total'   => $page->total(),
                'from'    => $page->firstItem(),
                'to'      => $page->lastItem(),
            ],
        ];
    }
}