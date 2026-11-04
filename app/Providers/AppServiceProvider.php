<?php

namespace App\Providers;

use App\Models\User;
use App\Services\Domains\Membership\MembershipService;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // El super admin pasa cualquier chequeo can(), sin importar el team actual.
        Gate::before(function (User $user) {
            return app(MembershipService::class)->isSuperAdmin($user) ? true : null;
        });
    }
}