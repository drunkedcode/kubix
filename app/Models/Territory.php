<?php

namespace App\Models;

use App\Models\Concerns\HasMedia;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Territory extends Model
{
    use HasFactory;
    use HasMedia;

    protected $fillable = [
        'parent_id',
        'type',
        'name',
        'slug',
        'code',
        'osm_id',
        'boundary_source',
        'path',
        'latitude',
        'longitude',
        'polygon',
        'settings',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'polygon' => 'array',
            'settings' => 'array',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Territory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Territory::class, 'parent_id');
    }
}
