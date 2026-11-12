<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/** Una cosa que pasó en un territorio: quién la hizo, sobre qué y qué evento fue. */
class ActivityLog extends Model
{
    protected $table = 'activity_log';

    // Solo tiene created_at: un evento ocurrido no se edita.
    public const UPDATED_AT = null;

    protected $fillable = [
        'territory_id',
        'actor_id',
        'subject_type',
        'subject_id',
        'event',
        'properties',
    ];

    protected function casts(): array
    {
        return ['properties' => 'array'];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }
}
