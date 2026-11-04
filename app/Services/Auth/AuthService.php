<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\PermissionRegistrar;

class AuthService
{
    public function attempt(array $credentials, bool $remember = false): bool
    {
        return Auth::attempt($credentials, $remember);
    }

    public function logout(): void
    {
        Auth::logout();
    }

    public function redirectPathFor(User $user): string
    {
        // 0 = platform sentinel: super_admin with no single territory.
        app(PermissionRegistrar::class)->setPermissionsTeamId(0);
        $user->unsetRelation('roles');
        $user->unsetRelation('permissions');

        if ($user->hasRole('super_admin')) {
            return route('territories.index');
        }

        $territories = $user->territories()->get(['territories.id', 'territories.slug', 'territories.type']);

        if ($territories->isEmpty()) {
            abort(403, 'Usuário sem território vinculado.');
        }

        // Varios territorios: el totalizador.
        if ($territories->count() > 1) {
            return route('overview');
        }

        // Uno solo: el barrio entra a su agencia; cualquier otro nivel, a su totalizador.
        $only = $territories->first();

        return $only->type === 'neighborhood'
            ? route('agencies.index', ['territory' => $only->slug])
            : route('overview.territory', ['territory' => $only->slug]);
    }
}