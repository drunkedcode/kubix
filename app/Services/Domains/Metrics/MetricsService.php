<?php

namespace App\Services\Domains\Metrics;

use App\Services\Domains\Business\BusinessService;

/*
|--------------------------------------------------------------------------
| METRICS: LOS NÚMEROS QUE SE MUESTRAN
|--------------------------------------------------------------------------
| Recibe siempre una lista de ids de territorios: uno en un barrio, varios en
| un totalizador. Todo número de pantalla sale de aquí; las páginas deciden
| QUÉ mostrar y no cuentan. Cuando VI mande datos reales, los // MOCK se
| reemplazan solo en este archivo.
*/

class MetricsService
{
    public function __construct(
        protected BusinessService $businesses,
    ) {}

    /** Las tarjetas de la pestaña General. */
    public function summary(array $territoryIds): array
    {
        $registered = $this->businesses->countForTerritories($territoryIds);

        return [
            ['label' => 'Negocios registrados', 'value' => $registered, 'icon' => 'building', 'tone' => 'teal',  'trend' => 12], // MOCK: trend
            ['label' => 'Al día',               'value' => 31,  'icon' => 'star',     'tone' => 'teal',  'trend' => 8],  // MOCK
            ['label' => 'Por vencer',           'value' => 10,  'icon' => 'contrast', 'tone' => 'amber', 'trend' => -3], // MOCK
            ['label' => 'Vencidos',             'value' => 7,   'icon' => 'flame',    'tone' => 'rose',  'trend' => 5],  // MOCK
            ['label' => 'Onlines',              'value' => 150, 'icon' => 'flame',    'tone' => 'teal',  'trend' => 80], // MOCK
        ];
    }

    /** Las 4 tarjetas de la portada de Agencia. Real: Negócios Ativos (el valor); el resto, MOCK. */
    public function agencyKpis(array $territoryIds): array
    {
        $active = $this->activeCount($territoryIds);

        return [
            ['label' => 'Total de Usuários',    'value' => 12480,     'icon' => 'users',     'tone' => 'amber',  'trend' => 12, 'spark' => [3, 4, 4, 6, 5, 7, 8, 9]], // MOCK
            ['label' => 'Negócios Ativos',      'value' => $active,   'icon' => 'store',     'tone' => 'blue',   'trend' => 8,  'spark' => [2, 3, 3, 4, 6, 5, 7, 8]], // MOCK: trend y spark
            ['label' => 'Oportunidades',        'value' => 87,        'icon' => 'briefcase', 'tone' => 'purple', 'trend' => 24, 'spark' => [2, 2, 4, 3, 5, 6, 6, 9]], // MOCK
            ['label' => 'Avaliação da Agência', 'value' => '4,8 / 5', 'icon' => 'star',      'tone' => 'green',  'trend' => 4,  'spark' => [4, 4, 5, 5, 6, 6, 7, 8]], // MOCK
        ];
    }

    /**
     * Gráfico de rendimiento: una fila por semana. Real: businesses (acumulado de altas);
     * engagement y users son MOCK hasta que la app mande eventos.
     */
    public function performance(array $territoryIds): array
    {
        $trend      = $this->businesses->trendForTerritories($territoryIds);
        $engagement = [3200, 3600, 3400, 4100, 3900, 4600, 4400, 5200]; // MOCK
        $users      = [1500, 1700, 1600, 2000, 2200, 2100, 2600, 2900]; // MOCK

        return array_map(fn (array $point, int $i) => [
            'label'      => $point['label'],
            'engagement' => $engagement[$i] ?? 0,
            'users'      => $users[$i] ?? 0,
            'businesses' => $point['count'],
        ], $trend, array_keys($trend));
    }

    /** Negocios activos destacados. Real: el negocio; rating y trend son MOCK (no hay valoraciones aún). */
    public function topBusinesses(array $territoryIds, int $limit = 3): array
    {
        $ratings = [4.9, 4.8, 4.7]; // MOCK
        $trends  = [20, 18, 15];    // MOCK

        return $this->businesses->listForTerritories($territoryIds)
            ->where('status', 'active')
            ->take($limit)
            ->values()
            ->map(fn ($business, int $i) => [
                'id'      => $business->id,
                'name'    => $business->name,
                'segment' => $business->segment,
                'rating'  => $ratings[$i] ?? 4.5,
                'trend'   => $trends[$i] ?? 0,
            ])
            ->all();
    }

    /** Salud de cada módulo en %. Real: Negócios (activos sobre registrados); el resto, MOCK. */
    public function moduleStatus(array $territoryIds): array
    {
        $registered = $this->businesses->countForTerritories($territoryIds);
        $negocios   = $registered > 0 ? (int) round($this->activeCount($territoryIds) / $registered * 100) : 0;

        return [
            ['label' => 'Agência',  'value' => 100,       'icon' => 'building', 'tone' => 'amber'],  // MOCK
            ['label' => 'Negócios', 'value' => $negocios, 'icon' => 'store',    'tone' => 'blue'],
            ['label' => 'Equipes',  'value' => 95,        'icon' => 'users',    'tone' => 'purple'], // MOCK
            ['label' => 'Kubix',    'value' => 97,        'icon' => 'box',      'tone' => 'green'],  // MOCK
        ];
    }

    /** Las 4 tarjetas de Negócios. Real: los tres conteos; Avaliação Média y las tendencias, MOCK. */
    public function businessKpis(array $territoryIds): array
    {
        $all = $this->businesses->listForTerritories($territoryIds);

        return [
            ['label' => 'Total de Negócios', 'value' => $all->count(),                          'icon' => 'store', 'tone' => 'amber',  'trend' => 8],  // MOCK: trend
            ['label' => 'Aprovados',         'value' => $all->where('status', 'active')->count(),  'icon' => 'check', 'tone' => 'green',  'trend' => 6],  // MOCK: trend
            ['label' => 'Pendentes',         'value' => $all->where('status', 'standby')->count(), 'icon' => 'clock', 'tone' => 'orange', 'trend' => -2], // MOCK: trend
            ['label' => 'Avaliação Média',   'value' => '4,7',                                  'icon' => 'star',  'tone' => 'amber',  'trend' => 2],  // MOCK
        ];
    }

    private function activeCount(array $territoryIds): int
    {
        return $this->businesses->listForTerritories($territoryIds)->where('status', 'active')->count();
    }

    // MOCK: pendiente de la columna real de categoría/segmento
    public function segments(array $territoryIds): array
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
