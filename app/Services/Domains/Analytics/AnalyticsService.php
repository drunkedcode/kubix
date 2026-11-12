<?php

namespace App\Services\Domains\Analytics;

/** Números de uso de la app (visualizaciones, clics, conversiones) de uno o varios negocios. */
class AnalyticsService
{
    /** Período de comparación de las tendencias. */
    public const PERIOD_DAYS = 28;

    private const TYPES = ['view', 'click', 'conversion'];

    /** Todo lo que la app puede reportar de un negocio. */
    public const EVENT_TYPES = ['view', 'click', 'call', 'whatsapp', 'map', 'conversion'];

    public function __construct(
        protected AnalyticsRepository $repo,
    ) {}

    /**
     * Totales de los últimos $days días y su variación (%) contra los $days anteriores.
     * La variación es null si antes no hubo nada con qué comparar.
     * Devuelve [tipo => ['value' => n, 'trend' => %|null]].
     */
    public function summary(array $businessIds, int $days = self::PERIOD_DAYS): array
    {
        $now      = now();
        $current  = $this->repo->countByType($businessIds, $now->copy()->subDays($days), $now);
        $previous = $this->repo->countByType($businessIds, $now->copy()->subDays($days * 2), $now->copy()->subDays($days));

        $result = [];

        foreach (self::TYPES as $type) {
            $value  = $current[$type] ?? 0;
            $before = $previous[$type] ?? 0;

            $result[$type] = [
                'value' => $value,
                'trend' => $before > 0 ? (int) round(($value - $before) / $before * 100) : null,
            ];
        }

        return $result;
    }

    /** Serie semanal (la última semana termina ahora): [{label, views, clicks, conversions}]. */
    public function weekly(array $businessIds, int $weeks = 8): array
    {
        $now    = now();
        $events = $this->repo->since($businessIds, $now->copy()->subWeeks($weeks));
        $points = [];

        for ($i = $weeks - 1; $i >= 0; $i--) {
            $end    = $now->copy()->subWeeks($i);
            $start  = $end->copy()->subWeek();
            $inWeek = $events->filter(fn ($e) => $e->occurred_at->gt($start) && $e->occurred_at->lte($end));

            $points[] = [
                'label'       => $end->format('d/m'),
                'views'       => $inWeek->where('type', 'view')->count(),
                'clicks'      => $inWeek->where('type', 'click')->count(),
                'conversions' => $inWeek->where('type', 'conversion')->count(),
            ];
        }

        return $points;
    }

    /** Los negocios más vistos del período, con su variación: [{id, views, trend}]. */
    public function topByViews(array $businessIds, int $limit = 3, int $days = self::PERIOD_DAYS): array
    {
        $now      = now();
        $current  = $this->repo->countByBusiness($businessIds, $now->copy()->subDays($days), $now, 'view');
        $previous = $this->repo->countByBusiness($businessIds, $now->copy()->subDays($days * 2), $now->copy()->subDays($days), 'view');

        arsort($current);

        return collect($current)
            ->take($limit)
            ->map(fn ($views, $id) => [
                'id'    => (int) $id,
                'views' => $views,
                'trend' => ($previous[$id] ?? 0) > 0 ? (int) round(($views - $previous[$id]) / $previous[$id] * 100) : null,
            ])
            ->values()
            ->all();
    }

    /** Vistas y clics de cada promoción: [id de promoción => ['views' => n, 'clicks' => n]]. */
    public function byPromotion(array $promotionIds): array
    {
        return collect($this->repo->countByPromotion($promotionIds))
            ->map(fn (array $counts) => ['views' => $counts['view'] ?? 0, 'clicks' => $counts['click'] ?? 0])
            ->all();
    }

    /** Guarda algo que una persona hizo con un negocio (y con una de sus promociones, si fue el caso). */
    public function record(int $businessId, ?int $userId, string $type, ?int $promotionId = null): void
    {
        $this->repo->create([
            'business_id'  => $businessId,
            'promotion_id' => $promotionId,
            'user_id'      => $userId,
            'type'         => $type,
        ]);
    }
}
