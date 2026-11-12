<?php

namespace App\Services\Domains\Promotion;

use App\Models\Promotion;
use Illuminate\Support\Collection;

class PromotionRepository
{
    /** Promociones vigentes del negocio: activas y sin vencer, la que termina antes primero. */
    public function activeFor(int $businessId): Collection
    {
        return Promotion::where('business_id', $businessId)
            ->where('status', 'active')
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->orderBy('ends_at')
            ->get();
    }

    /** Todas las promociones del negocio, las más recientes primero. */
    public function forBusiness(int $businessId): Collection
    {
        return Promotion::where('business_id', $businessId)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }

    public function create(array $attrs): Promotion
    {
        return Promotion::create($attrs);
    }

    /** La promoción, solo si es de ese negocio. */
    public function findOf(int $businessId, int $promotionId): ?Promotion
    {
        return Promotion::where('business_id', $businessId)->find($promotionId);
    }

    public function update(Promotion $promotion, array $attrs): Promotion
    {
        $promotion->update($attrs);

        return $promotion;
    }
}
