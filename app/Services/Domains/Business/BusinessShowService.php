<?php

namespace App\Services\Domains\Business;

use App\Enums\BusinessSegment;
use App\Models\Business;
use App\Services\Domains\Activity\ActivityService;
use App\Services\Domains\Analytics\AnalyticsService;
use App\Services\Domains\Payment\PaymentService;
use App\Services\Domains\Promotion\PromotionService;
use App\Services\Domains\Review\ReviewService;

/**
 * Feeds the tabs of the Business "show" page.
 * One public method per tab (plus the base profile used by the page header).
 */
class BusinessShowService
{
    public function __construct(
        protected BusinessService $businesses,
        protected AnalyticsService $analytics,
        protected ReviewService $reviews,
        protected PromotionService $promotions,
        protected PaymentService $payments,
        protected ActivityService $activity,
    ) {}

    /** Base data of the page, present on every tab. */
    public function profile(Business $business): array
    {
        $location = $business->locations->firstWhere('is_primary', true)
            ?? $business->locations->first();

        return [
            'id'        => $business->id,
            'name'      => $business->name,
            'slug'      => $business->slug,
            'status'    => $business->status,
            'category'  => BusinessSegment::tryFrom((string) $business->segment)?->label() ?? $business->segment,
            'location'  => $location ? [
                'latitude'  => (float) $location->latitude,
                'longitude' => (float) $location->longitude,
            ] : null,
            'rating'    => $this->reviews->summary([$business->id]),
            'createdAt' => $business->created_at->format('d/m/Y'),
        ];
    }

    /** Las 4 tarjetas del encabezado: uso de los últimos 28 días (con su variación) y campañas vigentes. */
    public function kpis(Business $business): array
    {
        $summary = $this->analytics->summary([$business->id]);

        return [
            $this->kpi('Visualizações', $summary['view']['value'], 'eye', 'blue', $summary['view']['trend']),
            $this->kpi('Cliques', $summary['click']['value'], 'pointer', 'purple', $summary['click']['trend']),
            $this->kpi('Conversões', $summary['conversion']['value'], 'cart', 'green', $summary['conversion']['trend']),
            $this->kpi('Campanhas Ativas', count($this->promotions->activeFor($business->id)), 'megaphone', 'amber'),
        ];
    }

    /** Pestaña profile (Visão Geral): desempeño semanal, campañas vigentes y acceso (código, estado y personas). */
    public function overview(Business $business): array
    {
        return [
            'performance' => $this->analytics->weekly([$business->id]),
            'campaigns'   => $this->promotions->activeFor($business->id),
            'access'      => [
                'code'   => sprintf('VI-%04d', $business->id),
                'status' => $business->status,
                'team'   => $this->businesses->team($business),
            ],
        ];
    }

    /** Una tarjeta del encabezado; la variación solo va si hay con qué comparar. */
    private function kpi(string $label, int $value, string $icon, string $tone, ?int $trend = null): array
    {
        return array_filter([
            'label' => $label,
            'value' => number_format($value, 0, ',', '.'),
            'icon'  => $icon,
            'tone'  => $tone,
            'trend' => $trend,
        ], fn ($field) => $field !== null);
    }

    /** Pestaña finance: lo cobrado al negocio por concepto y su historial de pagos. */
    public function finance(Business $business): array
    {
        return $this->payments->historyFor($business->id);
    }

    /** Pestaña traffic: uso de los últimos 28 días y su evolución semanal. */
    public function traffic(Business $business): array
    {
        $summary = $this->analytics->summary([$business->id]);
        $views   = $summary['view']['value'];
        $clicks  = $summary['click']['value'];

        return [
            'views'       => $views,
            'clicks'      => $clicks,
            'conversions' => $summary['conversion']['value'],
            'ctr'         => $views > 0 ? number_format($clicks / $views * 100, 1, ',', '.') . '%' : '—',
            'series'      => array_map(
                fn (array $week) => ['label' => $week['label'], 'views' => $week['views'], 'clicks' => $week['clicks']],
                $this->analytics->weekly([$business->id]),
            ),
        ];
    }

    /** Pestaña ads: campañas del negocio con lo que rindió cada una. */
    public function ads(Business $business): array
    {
        return ['campaigns' => $this->promotions->campaignsFor($business->id)];
    }

    /** Pestaña history: lo que le pasó al negocio (alta, aprobación, pagos y campañas). */
    public function history(Business $business): array
    {
        $territoryId = $this->businesses->territoryIdOf($business);

        return ['history' => $territoryId ? $this->activity->about($territoryId, $business) : []];
    }
}
