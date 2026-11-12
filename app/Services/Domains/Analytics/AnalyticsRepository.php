<?php

namespace App\Services\Domains\Analytics;

use App\Models\AnalyticsEvent;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AnalyticsRepository
{
    /** Cuántos eventos hubo de cada tipo en el período, entre esos negocios: [tipo => cantidad]. */
    public function countByType(array $businessIds, Carbon $from, Carbon $to): array
    {
        return AnalyticsEvent::whereIn('business_id', $businessIds)
            ->whereBetween('occurred_at', [$from, $to])
            ->selectRaw('type, count(*) as total')
            ->groupBy('type')
            ->pluck('total', 'type')
            ->all();
    }

    /** Cuántos eventos de un tipo tuvo cada negocio en el período: [id de negocio => cantidad]. */
    public function countByBusiness(array $businessIds, Carbon $from, Carbon $to, string $type): array
    {
        return AnalyticsEvent::whereIn('business_id', $businessIds)
            ->where('type', $type)
            ->whereBetween('occurred_at', [$from, $to])
            ->selectRaw('business_id, count(*) as total')
            ->groupBy('business_id')
            ->pluck('total', 'business_id')
            ->all();
    }

    /** Eventos (tipo y fecha) desde una fecha, para armar series. */
    public function since(array $businessIds, Carbon $from): Collection
    {
        return AnalyticsEvent::whereIn('business_id', $businessIds)
            ->where('occurred_at', '>', $from)
            ->get(['type', 'occurred_at']);
    }

    /** Vistas y clics de cada promoción: [id de promoción => [tipo => cantidad]]. */
    public function countByPromotion(array $promotionIds): array
    {
        return AnalyticsEvent::whereIn('promotion_id', $promotionIds)
            ->whereIn('type', ['view', 'click'])
            ->selectRaw('promotion_id, type, count(*) as total')
            ->groupBy('promotion_id', 'type')
            ->get()
            ->groupBy('promotion_id')
            ->map(fn ($rows) => $rows->pluck('total', 'type')->all())
            ->all();
    }

    public function create(array $attrs): AnalyticsEvent
    {
        return AnalyticsEvent::create($attrs);
    }
}
