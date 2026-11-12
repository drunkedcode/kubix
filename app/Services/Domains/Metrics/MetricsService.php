<?php

namespace App\Services\Domains\Metrics;

use App\Services\Domains\Analytics\AnalyticsService;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Review\ReviewService;

/*
|--------------------------------------------------------------------------
| METRICS: LOS NÚMEROS QUE SE MUESTRAN
|--------------------------------------------------------------------------
| Recibe siempre una lista de ids de territorios: uno en un barrio, varios en
| un totalizador. Todo número de pantalla sale de aquí; las páginas deciden
| QUÉ mostrar y no cuentan. Todo número sale de datos reales.
*/

class MetricsService
{
    public function __construct(
        protected BusinessService $businesses,
        protected AnalyticsService $analytics,
        protected ReviewService $reviews,
    ) {}

    /** Las 4 tarjetas de la portada de Agencia: uso de la app y negocios, con variación a 28 días. */
    public function agencyKpis(array $territoryIds): array
    {
        $ids      = $this->businesses->idsForTerritories($territoryIds);
        $usage    = $this->analytics->summary($ids);
        $weekly   = $this->analytics->weekly($ids);
        $rating   = $this->reviews->summary($ids);
        $monthAgo = now()->subDays(AnalyticsService::PERIOD_DAYS);
        $active   = $this->activeCount($territoryIds);

        return [
            $this->card('Visualizações', $usage['view']['value'], 'eye', 'amber', $usage['view']['trend'], array_column($weekly, 'views')),
            $this->card('Negócios Ativos', $active, 'store', 'blue', $this->growth($active, $this->businesses->activeAsOf($territoryIds, $monthAgo))),
            $this->card('Conversões', $usage['conversion']['value'], 'cart', 'purple', $usage['conversion']['trend'], array_column($weekly, 'conversions')),
            $this->card('Avaliação da Agência', $this->ratingLabel($rating, ' / 5'), 'star', 'green'),
        ];
    }

    /** Gráfico de rendimiento: una fila por semana (engajamento, conversões y negócios registrados acumulados). */
    public function performance(array $territoryIds): array
    {
        $trend  = $this->businesses->trendForTerritories($territoryIds);
        $weekly = $this->analytics->weekly($this->businesses->idsForTerritories($territoryIds));

        return array_map(fn (array $point, int $i) => [
            'label'       => $point['label'],
            'engagement'  => ($weekly[$i]['views'] ?? 0) + ($weekly[$i]['clicks'] ?? 0) + ($weekly[$i]['conversions'] ?? 0),
            'conversions' => $weekly[$i]['conversions'] ?? 0,
            'businesses'  => $point['count'],
        ], $trend, array_keys($trend));
    }

    /** Los negocios activos más vistos del período, con su valoración real. */
    public function topBusinesses(array $territoryIds, int $limit = 3): array
    {
        $active  = $this->businesses->listForTerritories($territoryIds)->where('status', 'active')->keyBy('id');
        $top     = $this->analytics->topByViews($active->keys()->all(), $limit);
        $ratings = $this->reviews->averagesFor(array_column($top, 'id'));

        return array_map(fn (array $row) => [
            'id'      => $row['id'],
            'name'    => $active[$row['id']]->name,
            'segment' => $active[$row['id']]->segment,
            'rating'  => $ratings[$row['id']] ?? 0.0,
            'trend'   => $row['trend'] ?? 0,
        ], $top);
    }

    /** Las 4 tarjetas de Negócios: conteos con su crecimiento a 28 días y la valoración media. */
    public function businessKpis(array $territoryIds): array
    {
        $all      = $this->businesses->listForTerritories($territoryIds);
        $rating   = $this->reviews->summary($all->pluck('id')->all());
        $monthAgo = now()->subDays(AnalyticsService::PERIOD_DAYS);
        $active   = $all->where('status', 'active')->count();

        return [
            $this->card('Total de Negócios', $all->count(), 'store', 'amber', $this->growth($all->count(), $this->businesses->registeredAsOf($territoryIds, $monthAgo))),
            $this->card('Aprovados', $active, 'check', 'green', $this->growth($active, $this->businesses->activeAsOf($territoryIds, $monthAgo))),
            $this->card('Pendentes', $all->where('status', 'standby')->count(), 'clock', 'orange'),
            $this->card('Avaliação Média', $this->ratingLabel($rating), 'star', 'amber'),
        ];
    }

    /** Negocios por categoría (las que tienen alguno), de mayor a menor. */
    public function segments(array $territoryIds): array
    {
        return collect($this->businesses->countBySegment($territoryIds))
            ->where('total', '>', 0)
            ->map(fn (array $segment) => ['label' => $segment['label'], 'count' => $segment['total']])
            ->values()
            ->all();
    }

    private function activeCount(array $territoryIds): int
    {
        return $this->businesses->listForTerritories($territoryIds)->where('status', 'active')->count();
    }

    /** Una tarjeta; la variación y el mini gráfico solo van si hay datos. */
    private function card(string $label, int|string $value, string $icon, string $tone, ?int $trend = null, ?array $spark = null): array
    {
        return array_filter([
            'label' => $label,
            'value' => $value,
            'icon'  => $icon,
            'tone'  => $tone,
            'trend' => $trend,
            'spark' => $spark,
        ], fn ($field) => $field !== null);
    }

    /** Crecimiento (%) de $now respecto de $before; null si antes no había nada. */
    private function growth(int $now, int $before): ?int
    {
        return $before > 0 ? (int) round(($now - $before) / $before * 100) : null;
    }

    private function ratingLabel(array $rating, string $suffix = ''): string
    {
        return $rating['count'] > 0 ? number_format($rating['score'], 1, ',', '.') . $suffix : '—';
    }
}
