<?php

namespace App\Services\Domains\Review;

/** Valoraciones que la gente le deja a los negocios. */
class ReviewService
{
    public function __construct(
        protected ReviewRepository $repo,
    ) {}

    /** De uno o varios negocios en conjunto: ['score' => promedio con un decimal, 'count' => cuántas]; score 0 si no hay. */
    public function summary(array $businessIds): array
    {
        $row = $this->repo->summary($businessIds);

        return [
            'score' => round((float) $row->average, 1),
            'count' => (int) $row->total,
        ];
    }

    /** Promedio (un decimal) de cada negocio que tenga valoraciones: [id de negocio => promedio]. */
    public function averagesFor(array $businessIds): array
    {
        return array_map(fn ($average) => round((float) $average, 1), $this->repo->averages($businessIds));
    }

    /** La persona valora el negocio (de 1 a 5); si ya lo había hecho, se actualiza. */
    public function rate(int $businessId, int $userId, int $rating, ?string $comment = null): void
    {
        $this->repo->save($businessId, $userId, $rating, $comment);
    }

    /** Lo que la persona le puso al negocio, o null si no lo valoró. */
    public function ratingBy(int $businessId, int $userId): ?int
    {
        return $this->repo->ratingBy($businessId, $userId);
    }
}
