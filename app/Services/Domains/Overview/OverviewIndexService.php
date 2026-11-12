<?php

namespace App\Services\Domains\Overview;

use App\Models\Territory;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Membership\MembershipService;
use App\Services\Domains\Metrics\MetricsService;
use App\Services\Domains\Territory\TerritoryService;
use Illuminate\Support\Collection;

/*
|--------------------------------------------------------------------------
| OVERVIEW (página index): LO QUE MUESTRA CADA PESTAÑA
|--------------------------------------------------------------------------
| Pantalla: Pages/Overview/Index.tsx · catálogo: overview.index
| Un método por pestaña, con el nombre de su clave. Cada uno recibe el ALCANCE:
|   - un Territory (país, estado o ciudad): se dibuja un pin por hijo directo.
|   - una Collection de territorios (los que tiene asignados el usuario, ej: Pedro
|     con 2 barrios): con polígono se dibuja el área; sin él, un pin en su centroide.
| Siempre suma todo lo que cuelga de cada territorio.
*/

class OverviewIndexService
{
    private const LEVEL_LABEL = [
        'country'      => 'País',
        'state'        => 'Estado',
        'city'         => 'Ciudad',
        'neighborhood' => 'Barrio',
    ];

    public function __construct(
        protected BusinessService $businesses,
        protected MembershipService $memberships,
        protected MetricsService $metrics,
        protected OverviewService $overview,
        protected TerritoryService $territories,
    ) {}

    /** Pestaña general: tarjetas, mapa y segmentos. */
    public function general(Territory|Collection $scope): array
    {
        ['ids' => $ids, 'entries' => $entries] = $this->scope($scope);

        $drawAsArea = $scope instanceof Territory
            ? collect()
            : $entries->filter(fn ($e) => $e['territory']->polygon);

        $drawAsPin = $entries->reject(fn ($e, $key) => $drawAsArea->has($key));

        return [
            'general' => [
                'stats'    => $this->metrics->agencyKpis($ids),
                'markers'  => $this->pins($drawAsPin),
                'areas'    => $drawAsArea
                    ->map(fn ($e) => [
                        'id'       => $e['territory']->id,
                        'name'     => $e['territory']->name,
                        'geometry' => $e['territory']->polygon,
                    ])
                    ->values()
                    ->all(),
                'segments' => $this->metrics->segments($ids),
            ],
        ];
    }

    /** Pestaña evolution: tendencia, ranking y (en un solo territorio) los negocios más recientes. */
    public function evolution(Territory|Collection $scope): array
    {
        ['ids' => $ids, 'entries' => $entries] = $this->scope($scope);

        $trend = $this->businesses->trendForTerritories($ids);

        $evolution = [
            'trend'   => $trend,
            'summary' => $this->businesses->trendSummary($trend),
            'ranking' => $this->ranking($entries),
        ];

        if ($scope instanceof Territory) {
            $evolution['recent'] = $this->businesses->recentForTerritories($ids);
        }

        return ['evolution' => $evolution];
    }

    /** Pestaña territories: una tarjeta por territorio del alcance (los hijos, o los del usuario). */
    public function territories(Territory|Collection $scope): array
    {
        ['entries' => $entries] = $this->scope($scope);

        $managers = $this->memberships->managersOf($entries->pluck('territory'));

        return [
            'territories' => $entries
                ->map(function ($e) use ($managers) {
                    /** @var Territory $t */
                    $t     = $e['territory'];
                    $trend = $this->businesses->trendForTerritories($this->territories->subtreeIds($t));

                    return [
                        'slug'          => $t->slug,
                        'type'          => $t->type,
                        'name'          => $t->name,
                        'location'      => implode(' · ', $this->territories->ancestorNames($t)),
                        'manager'       => $managers[$t->id] ?? null,
                        'businessCount' => $e['count'],
                        'trend'         => array_column($trend, 'count'),
                        'delta'         => $this->businesses->trendSummary($trend)['delta'],
                        'href'          => $this->overview->landingUrl($t),
                    ];
                })
                ->values()
                ->all(),
        ];
    }

    /** Ids que se suman y entradas (territorio + conteo) que se dibujan, según el alcance. */
    private function scope(Territory|Collection $scope): array
    {
        if ($scope instanceof Territory) {
            return [
                'ids'     => $this->territories->subtreeIds($scope),
                'entries' => $this->territories->children($scope)->map(fn (Territory $t) => $this->entry($t))->values(),
            ];
        }

        return [
            'ids'     => $scope->flatMap(fn (Territory $t) => $this->territories->subtreeIds($t))->unique()->values()->all(),
            'entries' => $scope->map(fn (Territory $t) => $this->entry($t))->values(),
        ];
    }

    /** Un territorio con el conteo de todo lo que cuelga de él. */
    private function entry(Territory $territory): array
    {
        return [
            'territory' => $territory,
            'count'     => $this->businesses->countForTerritories($this->territories->subtreeIds($territory)),
        ];
    }

    /** Un pin por territorio con centroide; sin coordenadas no hay pin. */
    private function pins(Collection $entries): array
    {
        return $entries
            ->filter(fn ($e) => $e['territory']->latitude !== null && $e['territory']->longitude !== null)
            ->map(function ($e) {
                /** @var Territory $t */
                $t = $e['territory'];

                return [
                    'id'       => $t->id,
                    'lat'      => (float) $t->latitude,
                    'lng'      => (float) $t->longitude,
                    'title'    => $t->name,
                    'subtitle' => $e['count'] . ' ' . ($e['count'] === 1 ? 'negocio' : 'negocios'),
                    'color'    => '#2dd4bf',
                    'glyph'    => (string) $e['count'],
                    'badge'    => self::LEVEL_LABEL[$t->type] ?? null,
                    'href'     => $this->overview->landingUrl($t),
                ];
            })
            ->values()
            ->all();
    }

    private function ranking(Collection $entries): array
    {
        return $entries
            ->map(fn ($e) => [
                'slug'          => $e['territory']->slug,
                'name'          => $e['territory']->name,
                'businessCount' => $e['count'],
            ])
            ->sortByDesc('businessCount')
            ->values()
            ->all();
    }
    
}
