<?php

namespace App\Services\Domains\App;

use App\Enums\BusinessSegment;
use App\Models\Business;
use App\Models\Territory;
use App\Models\User;
use App\Services\Domains\Analytics\AnalyticsService;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Promotion\PromotionService;
use App\Services\Domains\Review\ReviewService;
use Illuminate\Validation\ValidationException;

/**
 * El negocio visto desde la app: su perfil, lo que la gente hace con él (eventos) y sus
 * valoraciones. Solo negocios activos del barrio donde está la persona. Lo que hace el dueño
 * con su propio negocio no cuenta: ni vistas ni eventos, ni puede valorarlo.
 */
class BusinessProfileService
{
    public function __construct(
        protected BusinessService $businesses,
        protected AnalyticsService $analytics,
        protected PromotionService $promotions,
        protected ReviewService $reviews,
    ) {}

    /** Perfil del negocio; abrirlo cuenta como una visualización. El precio de las promociones va en centavos. */
    public function show(Territory $territory, User $user, int $businessId): array
    {
        $business = $this->visible($territory, $businessId);

        $this->track($business, $user, 'view');

        $location = $business->locations->firstWhere('is_primary', true) ?? $business->locations->first();

        return [
            'id'         => $business->id,
            'name'       => $business->name,
            'slug'       => $business->slug,
            'segment'    => ['value' => $business->segment, 'label' => BusinessSegment::tryFrom((string) $business->segment)?->label() ?? $business->segment],
            'phone'      => $business->phone,
            'location'   => $location ? ['latitude' => (float) $location->latitude, 'longitude' => (float) $location->longitude] : null,
            'rating'     => $this->reviews->summary([$business->id]),
            'myRating'   => $this->reviews->ratingBy($business->id, $user->id),
            'promotions' => $this->promotions->activeFor($business->id),
        ];
    }

    /** Registra algo que la persona hizo con el negocio (clic, llamada, WhatsApp, mapa, compra, vista de promoción). */
    public function event(Territory $territory, User $user, int $businessId, string $type, ?int $promotionId = null): void
    {
        $this->track($this->visible($territory, $businessId), $user, $type, $promotionId);
    }

    /** La persona valora el negocio; devuelve el promedio actualizado y lo que ella puso. */
    public function rate(Territory $territory, User $user, int $businessId, int $rating, ?string $comment = null): array
    {
        $business = $this->visible($territory, $businessId);

        if ($this->businesses->isOwner($user, $business)) {
            throw ValidationException::withMessages(['rating' => 'Você não pode avaliar o seu próprio negócio.']);
        }

        $this->reviews->rate($business->id, $user->id, $rating, $comment);

        return [
            'rating'   => $this->reviews->summary([$business->id]),
            'myRating' => $rating,
        ];
    }

    /** El negocio solo existe para la app si está activo y es de este barrio. */
    private function visible(Territory $territory, int $businessId): Business
    {
        $business = $this->businesses->find($businessId);

        abort_if(
            ! $business
            || $business->status !== 'active'
            || $this->businesses->territoryIdOf($business) !== $territory->id,
            404,
        );

        return $business;
    }

    /** Guarda el evento, salvo que lo haga el propio dueño. */
    private function track(Business $business, User $user, string $type, ?int $promotionId = null): void
    {
        if ($this->businesses->isOwner($user, $business)) {
            return;
        }

        $this->analytics->record($business->id, $user->id, $type, $promotionId);
    }
}
