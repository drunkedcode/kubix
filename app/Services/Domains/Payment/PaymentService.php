<?php

namespace App\Services\Domains\Payment;

use App\Models\Business;
use App\Models\Payment;
use App\Services\Domains\Agency\AgencyService;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Territory\TerritoryService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

/**
 * Cobros de los negocios. El monto sale del precio que cada barrio definió en su
 * configuración (centavos). Hoy el pago es simulado: cuando exista la pasarela, solo
 * cambia pay() y el resto del sistema no se entera.
 */
class PaymentService
{
    /** Concepto cobrado => clave del precio en la configuración del barrio. */
    private const PRICE_KEYS = [
        'onboarding' => 'onboarding_price',
        'daily'      => 'daily_price',
        'promotion'  => 'promotion_price',
    ];

    public function __construct(
        protected PaymentRepository $repo,
        protected BusinessService $businesses,
        protected AgencyService $agency,
        protected TerritoryService $territories,
    ) {}

    /** Lo que la app puede ver de un pago. */
    public function toApi(Payment $payment): array
    {
        return [
            'id'     => $payment->id,
            'kind'   => $payment->kind,
            'amount' => $payment->amount,
            'method' => $payment->method,
            'status' => $payment->status,
            'paidAt' => $payment->paid_at?->toIso8601String(),
        ];
    }

    /** Lo que vale ese concepto en el barrio del negocio, en centavos. */
    public function priceFor(Business $business, string $kind): int
    {
        $key = self::PRICE_KEYS[$kind] ?? null;

        if ($key === null) {
            throw new InvalidArgumentException("Concepto de cobro desconocido: {$kind}");
        }

        $territoryId = $this->businesses->territoryIdOf($business);
        $territory   = $territoryId ? $this->territories->find($territoryId) : null;
        $price       = $territory ? $this->agency->settings($territory)[$key] : null;

        if ($price === null) {
            throw ValidationException::withMessages([
                'price' => 'El barrio todavía no definió este precio.',
            ]);
        }

        return $price;
    }

    /**
     * Cobra el concepto al negocio. $confirmedBy es quien lo marcó a mano (pago en
     * efectivo registrado por el equipo); null cuando paga el propio dueño.
     * Pagar el onboarding activa el negocio.
     */
    public function pay(Business $business, string $kind, string $method, ?int $confirmedBy = null): Payment
    {
        if ($kind === 'onboarding' && $business->status === 'active') {
            throw ValidationException::withMessages([
                'business' => 'Este negocio ya está activo.',
            ]);
        }

        $amount = $this->priceFor($business, $kind);

        return DB::transaction(function () use ($business, $kind, $method, $amount, $confirmedBy) {
            // MOCK: sin pasarela, el pago nace confirmado. Con pasarela real se crea
            // pendiente y un webhook lo confirma.
            $payment = $this->repo->create([
                'business_id'  => $business->id,
                'kind'         => $kind,
                'amount'       => $amount,
                'method'       => $method,
                'status'       => 'paid',
                'paid_at'      => now(),
                'confirmed_by' => $confirmedBy,
            ]);

            if ($kind === 'onboarding') {
                $this->businesses->activate($business, $confirmedBy);
            }

            return $payment;
        });
    }
}
