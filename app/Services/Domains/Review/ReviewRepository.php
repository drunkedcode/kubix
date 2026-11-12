<?php

namespace App\Services\Domains\Review;

use App\Models\BusinessReview;

class ReviewRepository
{
    /** Promedio y cantidad de valoraciones de esos negocios en conjunto. */
    public function summary(array $businessIds): object
    {
        return BusinessReview::whereIn('business_id', $businessIds)
            ->selectRaw('avg(rating) as average, count(*) as total')
            ->first();
    }

    /** Promedio de cada negocio: [id de negocio => promedio]. */
    public function averages(array $businessIds): array
    {
        return BusinessReview::whereIn('business_id', $businessIds)
            ->selectRaw('business_id, avg(rating) as average')
            ->groupBy('business_id')
            ->pluck('average', 'business_id')
            ->all();
    }

    /** Crea la valoración de la persona o actualiza la que ya había dejado. */
    public function save(int $businessId, int $userId, int $rating, ?string $comment): void
    {
        BusinessReview::updateOrCreate(
            ['business_id' => $businessId, 'user_id' => $userId],
            ['rating' => $rating, 'comment' => $comment],
        );
    }

    /** Lo que la persona le puso al negocio, o null si no lo valoró. */
    public function ratingBy(int $businessId, int $userId): ?int
    {
        $rating = BusinessReview::where('business_id', $businessId)->where('user_id', $userId)->value('rating');

        return $rating === null ? null : (int) $rating;
    }
}
