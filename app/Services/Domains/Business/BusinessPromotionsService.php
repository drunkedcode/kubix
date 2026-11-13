<?php

namespace App\Services\Domains\Business;

use App\Models\Business;
use App\Models\Promotion;
use App\Models\User;
use App\Services\Domains\Activity\ActivityService;
use App\Services\Domains\Payment\PaymentService;
use App\Services\Domains\Promotion\PromotionService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Receta de las campañas del dueño en la PWA: un método por paso (ver, crear, activar pagando,
 * pausar o reanudar). Solo el dueño del negocio puede, y para crear o activar el negocio ya
 * tiene que estar activo. La lógica vive en los servicios que llama.
 */
class BusinessPromotionsService
{
    public function __construct(
        protected BusinessService $businesses,
        protected PromotionService $promotions,
        protected PaymentService $payments,
        protected ActivityService $activity,
    ) {}

    /** Las campañas del negocio con sus vistas y clics. */
    public function list(User $owner, int $businessId): array
    {
        $business = $this->owned($owner, $businessId);

        return ['promotions' => $this->promotions->detailsFor($business->id)];
    }

    /** Crea una campaña como borrador. */
    public function create(User $owner, int $businessId, array $data): array
    {
        $business = $this->activeOwned($owner, $businessId);

        return $this->promotions->toApi($this->promotions->create($business->id, $data));
    }

    /** El dueño paga la campaña (precio del barrio) y queda activa. */
    public function activate(User $owner, int $businessId, int $promotionId, string $method): array
    {
        $business  = $this->activeOwned($owner, $businessId);
        $promotion = $this->promotions->findOf($business->id, $promotionId);

        $this->promotions->assertDraft($promotion);

        return DB::transaction(function () use ($owner, $business, $promotion, $method) {
            $payment   = $this->payments->pay($business, 'promotion', $method);
            $promotion = $this->promotions->activate($promotion, $payment->id);
            $this->note($owner, $business, 'promotion.activated', $promotion);

            return [
                'payment'   => $this->payments->toApi($payment),
                'promotion' => $this->promotions->toApi($promotion),
            ];
        });
    }

    /** Pausa o reanuda la campaña. */
    public function changeStatus(User $owner, int $businessId, int $promotionId, string $status): array
    {
        $business  = $this->activeOwned($owner, $businessId);
        $promotion = $this->promotions->findOf($business->id, $promotionId);

        $updated = $this->promotions->changeStatus($promotion, $status);
        $this->note($owner, $business, $status === 'paused' ? 'promotion.paused' : 'promotion.resumed', $updated);

        return $this->promotions->toApi($updated);
    }

    /** Anota en el historial del negocio lo que el dueño hizo con una campaña. */
    private function note(User $owner, Business $business, string $event, Promotion $promotion): void
    {
        $territoryId = $this->businesses->territoryIdOf($business);

        if ($territoryId) {
            $this->activity->record($territoryId, $owner->id, $business, $event, ['name' => $promotion->title]);
        }
    }

    private function owned(User $owner, int $businessId): Business
    {
        $business = $this->businesses->find($businessId);

        abort_if(! $business, 404);
        abort_unless($this->businesses->isOwner($owner, $business), 403);

        return $business;
    }

    private function activeOwned(User $owner, int $businessId): Business
    {
        $business = $this->owned($owner, $businessId);

        if ($business->status !== 'active') {
            throw ValidationException::withMessages(['business' => 'Ative o negócio antes de criar campanhas.']);
        }

        return $business;
    }
}
