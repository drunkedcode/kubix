<?php

namespace App\Services\Domains\Overview;

use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Membership\MembershipService;
use App\Services\Domains\Territory\TerritoryService;
use Illuminate\Support\Collection;

/*
|--------------------------------------------------------------------------
| OVERVIEW: EL TOTALIZADOR
|--------------------------------------------------------------------------
| Dos entradas, misma forma de datos (general + evolution):
|   forTerritory()   -> un país, estado o ciudad: pines de sus hijos directos.
|   forTerritories() -> varios territorios del usuario (ej: Pedro con 2 barrios).
| Siempre suma todo lo que cuelga de cada territorio (path + '/').
*/

class OverviewService
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
        protected TerritoryService $territories,
    ) {}

    /** Territorios que el usuario tiene asignados. */
    public function territoriesOf(User $user): Collection
    {
        return $this->memberships->territoriesOf($user);
    }

    /** A dónde entra un territorio: el barrio a su Agency, el resto a su totalizador. */
    public function landingUrl(Territory $territory): string
    {
        return $territory->type === 'neighborhood'
            ? route('agencies.index', ['territory' => $territory->slug])
            : route('overview.territory', ['territory' => $territory->slug]);
    }

    /** Totales de un territorio no-barrio, con un pin por hijo directo. */
    public function forTerritory(Territory $territory): array
    {
        $ids   = $this->territories->subtreeIds($territory);
        $trend = $this->businesses->trendForTerritories($ids);

        // Cada hijo con el conteo de todo lo que cuelga de él (se calcula una sola vez).
        $children = $this->territories->children($territory)
            ->map(fn (Territory $child) => [
                'territory' => $child,
                'count'     => $this->businesses->countForTerritories($this->territories->subtreeIds($child)),
            ])
            ->values();

        return [
            'general' => [
                'stats'    => $this->stats($this->businesses->countForTerritories($ids)),
                'markers'  => $this->pins($children),
                'areas'    => [],
                'segments' => $this->segments(),
            ],
            'evolution' => [
                'trend'   => $trend,
                'summary' => $this->businesses->trendSummary($trend),
                'ranking' => $this->ranking($children),
                'recent'  => $this->businesses->recentForTerritories($ids),
            ],
        ];
    }

    /** Totales de varios territorios a la vez (los que tiene asignados el usuario). */
    public function forTerritories(Collection $territories): array
    {
        $entries = $territories
            ->map(fn (Territory $t) => [
                'territory' => $t,
                'count'     => $this->businesses->countForTerritories($this->territories->subtreeIds($t)),
            ])
            ->values();

        $ids = $territories
            ->flatMap(fn (Territory $t) => $this->territories->subtreeIds($t))
            ->unique()
            ->values()
            ->all();

        $trend = $this->businesses->trendForTerritories($ids);

        // Con polígono (barrio) se dibuja el área; sin él, un pin en su centroide.
        $withPolygon    = $entries->filter(fn ($e) => $e['territory']->polygon);
        $withoutPolygon = $entries->reject(fn ($e) => $e['territory']->polygon);

        return [
            'general' => [
                'stats'    => $this->stats($this->businesses->countForTerritories($ids)),
                'markers'  => $this->pins($withoutPolygon),
                'areas'    => $withPolygon
                    ->map(fn ($e) => [
                        'id'       => $e['territory']->id,
                        'name'     => $e['territory']->name,
                        'geometry' => $e['territory']->polygon,
                    ])
                    ->values()
                    ->all(),
                'segments' => $this->segments(),
            ],
            'evolution' => [
                'trend'   => $trend,
                'summary' => $this->businesses->trendSummary($trend),
                'ranking' => $this->ranking($entries),
            ],
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
                    'href'     => $this->landingUrl($t),
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

    private function stats(int $registered): array
    {
        return [
            ['label' => 'Negocios registrados', 'value' => $registered, 'icon' => 'building', 'tone' => 'teal',  'trend' => 12], // MOCK: trend
            ['label' => 'Al día',               'value' => 31,  'icon' => 'star',     'tone' => 'teal',  'trend' => 8],  // MOCK
            ['label' => 'Por vencer',           'value' => 10,  'icon' => 'contrast', 'tone' => 'amber', 'trend' => -3], // MOCK
            ['label' => 'Vencidos',             'value' => 7,   'icon' => 'flame',    'tone' => 'rose',  'trend' => 5],  // MOCK
            ['label' => 'Onlines',              'value' => 150, 'icon' => 'flame',    'tone' => 'teal',  'trend' => 80], // MOCK
        ];
    }

    // MOCK: pendiente de la columna real de categoría/segmento
    private function segments(): array
    {
        return [
            ['label' => 'Restaurantes', 'count' => 18],
            ['label' => 'Salones',      'count' => 12],
            ['label' => 'Barberías',    'count' => 9],
            ['label' => 'Salud',        'count' => 5],
            ['label' => 'Otros',        'count' => 4],
        ];
    }
}