<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\MorphToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'referral_code',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be functions/casts.
     *
     * @return array<string, data-type>|mixed
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Territorios que este usuario gestiona (membresías de tipo territorio).
    public function territories(): MorphToMany
    {
        return $this->morphedByMany(Territory::class, 'memberable', 'memberships')
            ->withPivot('role', 'starts_at', 'ends_at')
            ->withTimestamps();
    }

    // Negocios de los que es miembro (owner, staff...).
    public function businesses(): MorphToMany
    {
        return $this->morphedByMany(Business::class, 'memberable', 'memberships')
            ->withPivot('role', 'starts_at', 'ends_at')
            ->withTimestamps();
    }
}