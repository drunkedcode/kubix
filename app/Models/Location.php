<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Location extends Model
{
    protected $fillable = [
        'locatable_type', 'locatable_id', 'territory_id', 'label', 'cep', 'street', 'number',
        'complement', 'neighborhood', 'city', 'state', 'latitude', 'longitude',
        'is_primary', 'status', 'created_by', 'updated_by',
    ];

    protected function casts(): array
    {
        return ['is_primary' => 'boolean'];
    }

    public function locatable(): MorphTo
    {
        return $this->morphTo();
    }

    public function territory(): BelongsTo
    {
        return $this->belongsTo(Territory::class);
    }
}
