<?php

namespace App\Models;

use App\Models\Concerns\HasLocations;
use App\Models\Concerns\HasMedia;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class Business extends Model
{
    use HasFactory;
    use HasLocations;
    use HasMedia;

    protected $fillable = [
        'name',
        'slug',
        'segment',
        'phone',
        'document',
        'status',
        'settings',
        'registered_by',
        'referred_by',
        'activated_at',
        'activated_by',
    ];

    protected $casts = [
        'settings'     => 'array',
        'activated_at' => 'datetime',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // Personas del negocio (dueño, empleados...), por la tabla de membresías.
    public function members(): MorphToMany
    {
        return $this->morphToMany(User::class, 'memberable', 'memberships')
            ->withPivot('role', 'starts_at', 'ends_at')
            ->withTimestamps();
    }
}