<?php

namespace App\Services\Domains\Promotion;

use App\Models\Promotion;
use App\Services\Domains\Analytics\AnalyticsService;
use Illuminate\Validation\ValidationException;

/** Promociones y campañas que publican los negocios. */
class PromotionService
{
    private const STATUS_LABELS = [
        'draft'   => 'Rascunho',
        'pending' => 'Pendente',
        'active'  => 'Ativa',
        'paused'  => 'Pausada',
        'ended'   => 'Encerrada',
    ];

    /** Estado actual => a cuáles puede pasar el dueño. */
    private const TRANSITIONS = [
        'active' => ['paused'],
        'paused' => ['active'],
    ];

    public function __construct(
        protected PromotionRepository $repo,
        protected AnalyticsService $analytics,
    ) {}

    /** Promociones vigentes del negocio, listas para pintar. El precio va en centavos. */
    public function activeFor(int $businessId): array
    {
        return $this->repo->activeFor($businessId)
            ->map(fn (Promotion $promotion) => [
                'id'     => $promotion->id,
                'title'  => $promotion->title,
                'endsAt' => $promotion->ends_at?->format('d/m/Y'),
                'price'  => $promotion->price_cents,
            ])
            ->values()
            ->all();
    }

    /** Todas las campañas del negocio con lo que rindió cada una: [{id, name, status, impressions, clicks}]. */
    public function campaignsFor(int $businessId): array
    {
        $promotions = $this->repo->forBusiness($businessId);
        $stats      = $this->analytics->byPromotion($promotions->pluck('id')->all());

        return $promotions
            ->map(fn (Promotion $promotion) => [
                'id'          => $promotion->id,
                'name'        => $promotion->title,
                'status'      => self::STATUS_LABELS[$this->statusOf($promotion)] ?? $promotion->status,
                'impressions' => $stats[$promotion->id]['views'] ?? 0,
                'clicks'      => $stats[$promotion->id]['clicks'] ?? 0,
            ])
            ->values()
            ->all();
    }

    /** Lo que la app ve de una promoción. El precio va en centavos. */
    public function toApi(Promotion $promotion, array $stats = []): array
    {
        $status = $this->statusOf($promotion);

        return [
            'id'          => $promotion->id,
            'title'       => $promotion->title,
            'description' => $promotion->description,
            'price'       => $promotion->price_cents,
            'status'      => $status,
            'statusLabel' => self::STATUS_LABELS[$status] ?? $status,
            'startsAt'    => $promotion->starts_at?->toIso8601String(),
            'endsAt'      => $promotion->ends_at?->toIso8601String(),
            'views'       => $stats['views'] ?? 0,
            'clicks'      => $stats['clicks'] ?? 0,
        ];
    }

    /** Todas las promociones del negocio, con vistas y clics de cada una. */
    public function detailsFor(int $businessId): array
    {
        $promotions = $this->repo->forBusiness($businessId);
        $stats      = $this->analytics->byPromotion($promotions->pluck('id')->all());

        return $promotions
            ->map(fn (Promotion $promotion) => $this->toApi($promotion, $stats[$promotion->id] ?? []))
            ->values()
            ->all();
    }

    /** Crea la promoción como borrador: todavía no se ve en la app hasta que se pague. */
    public function create(int $businessId, array $data): Promotion
    {
        return $this->repo->create([
            'business_id' => $businessId,
            'title'       => $data['title'],
            'description' => $data['description'] ?? null,
            'price_cents' => $data['price_cents'] ?? null,
            'ends_at'     => $data['ends_at'] ?? null,
            'status'      => 'draft',
        ]);
    }

    /** La promoción de ese negocio, o 404. */
    public function findOf(int $businessId, int $promotionId): Promotion
    {
        $promotion = $this->repo->findOf($businessId, $promotionId);

        abort_if(! $promotion, 404);

        return $promotion;
    }

    /** Solo un borrador se puede activar (pagando). */
    public function assertDraft(Promotion $promotion): void
    {
        if ($promotion->status !== 'draft') {
            throw ValidationException::withMessages(['promotion' => 'Esta campanha já foi ativada.']);
        }
    }

    /** Pasa el borrador a activa, con el pago que la activó. */
    public function activate(Promotion $promotion, int $paymentId): Promotion
    {
        $this->assertDraft($promotion);

        return $this->repo->update($promotion, [
            'status'     => 'active',
            'starts_at'  => now(),
            'payment_id' => $paymentId,
        ]);
    }

    /** Pausa una activa o reanuda una pausada (si todavía no terminó). */
    public function changeStatus(Promotion $promotion, string $to): Promotion
    {
        if (! in_array($to, self::TRANSITIONS[$promotion->status] ?? [], true)) {
            throw ValidationException::withMessages(['status' => 'Não é possível mudar esta campanha para esse estado.']);
        }

        if ($to === 'active' && $promotion->ends_at?->isPast()) {
            throw ValidationException::withMessages(['status' => 'Esta campanha já terminou.']);
        }

        return $this->repo->update($promotion, ['status' => $to]);
    }

    /** Una activa que ya pasó su fecha de fin cuenta como encerrada. */
    private function statusOf(Promotion $promotion): string
    {
        return $promotion->status === 'active' && $promotion->ends_at?->isPast() ? 'ended' : $promotion->status;
    }
}
