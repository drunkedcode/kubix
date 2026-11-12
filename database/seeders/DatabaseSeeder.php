<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);
        $this->command->call('access:sync');
        $this->call(UserSeeder::class);
        $this->call(TerritorySeeder::class);

        // Datos de prueba: negocios, pagos y métricas. Nunca en producción.
        if (app()->environment('local')) {
            $this->call(DemoSeeder::class);
        }
    }
}