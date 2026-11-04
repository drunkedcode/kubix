<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\PermissionRegistrar;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'superadmin@kubix.com'],
            [
                'name' => 'Amdress',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        app(PermissionRegistrar::class)->setPermissionsTeamId(0);

        if (! $user->hasRole('super_admin')) {
            $user->assignRole('super_admin');
        }
    }
}