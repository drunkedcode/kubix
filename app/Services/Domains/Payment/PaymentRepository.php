<?php

namespace App\Services\Domains\Payment;

use App\Models\Payment;
use Illuminate\Support\Collection;

class PaymentRepository
{
    public function create(array $attrs): Payment
    {
        return Payment::create($attrs);
    }

    /** Todos los pagos del negocio, los más recientes primero. */
    public function forBusiness(int $businessId): Collection
    {
        return Payment::where('business_id', $businessId)
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get();
    }
}
