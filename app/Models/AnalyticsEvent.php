<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** Algo que hizo una persona con un negocio en la app: verlo, tocarlo, escribirle, comprar. */
class AnalyticsEvent extends Model
{
    // Solo tiene occurred_at: un evento ocurrido no se edita.
    public $timestamps = false;

    protected $fillable = ['business_id', 'promotion_id', 'user_id', 'type'];

    protected function casts(): array
    {
        return ['occurred_at' => 'datetime'];
    }
}
