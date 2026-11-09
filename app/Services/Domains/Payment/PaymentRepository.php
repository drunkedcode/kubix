<?php

namespace App\Services\Domains\Payment;

use App\Models\Payment;

class PaymentRepository
{
    public function create(array $attrs): Payment
    {
        return Payment::create($attrs);
    }
}
