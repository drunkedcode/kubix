<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Oferta o campaña que un negocio publica en la app. */
class Promotion extends Model
{
    protected $fillable = [
        'business_id',
        'title',
        'description',
        'price_cents',
        'status',
        'starts_at',
        'ends_at',
        'payment_id',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at'   => 'datetime',
        ];
    }
}
