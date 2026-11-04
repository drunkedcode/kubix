<?php

namespace Database\Seeders;

use App\Models\Territory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TerritorySeeder extends Seeder
{
    private const LL = [
        'Brasil' => [-14.2350, -51.9253],
        'Colombia' => [4.5709, -74.2973],
        'Amazonas' => [-3.4168, -65.8561],
        'Paraná' => [-24.8900, -51.5500],
        'Antioquia' => [6.7500, -75.5000],
        'Manaus' => [-3.1190, -60.0217],
        'Curitiba' => [-25.4284, -49.2733],
        'Medellín' => [6.2442, -75.5812],
        'Armando Mendes' => [-3.0900, -59.9400],
        'Parque Dez de Novembro' => [-3.0950, -60.0050],
        'Aleixo' => [-3.0700, -59.9800],
        'Ponta Negra' => [-3.0900, -60.0900],
        'Capão Raso' => [-25.5000, -49.2900],
        'Pinheirinho' => [-25.5130, -49.2900],
        'Batel' => [-25.4387, -49.2870],
        'Centro' => [-25.4297, -49.2719],
        'El Poblado' => [6.2088, -75.5659],
        'Laureles' => [6.2476, -75.5900],
        'El Centro' => [6.2518, -75.5636],
        'Belén' => [6.2300, -75.6000],
    ];

    private function ll(string $name): array
    {
        [$lat, $lng] = self::LL[$name] ?? [null, null];
        return ['latitude' => $lat, 'longitude' => $lng];
    }

    public function run(): void
    {
        $territoriesData = [
            [
                'name' => 'Brasil',
                'code' => 'BR',
                'states' => [
                    [
                        'name' => 'Amazonas',
                        'code' => '13',
                        'cities' => [
                            [
                                'name' => 'Manaus',
                                'code' => '1302603',
                                'districts' => ['Armando Mendes', 'Parque Dez de Novembro', 'Aleixo', 'Ponta Negra']
                            ]
                        ]
                    ],
                    [
                        'name' => 'Paraná',
                        'code' => '41',
                        'cities' => [
                            [
                                'name' => 'Curitiba',
                                'code' => '4106902',
                                'districts' => ['Capão Raso', 'Pinheirinho', 'Batel', 'Centro']
                            ]
                        ]
                    ]
                ]
            ],
            [
                'name' => 'Colombia',
                'code' => 'CO',
                'states' => [
                    [
                        'name' => 'Antioquia',
                        'code' => 'ANT',
                        'cities' => [
                            [
                                'name' => 'Medellín',
                                'code' => '05001',
                                'districts' => ['El Poblado', 'Laureles', 'El Centro', 'Belén']
                            ]
                        ]
                    ]
                ]
            ]
        ];

        foreach ($territoriesData as $countryData) {
            // 1️⃣ PAÍS
            $countryPath = (string) (Territory::where('type', 'country')->count() + 1);
            $country = Territory::firstOrCreate(
                ['type' => 'country', 'name' => $countryData['name']],
                [
                    ...$this->ll($countryData['name']),
                    'slug' => Str::slug($countryData['name']),
                    'code' => $countryData['code'],
                    'path' => $countryPath,
                    'status' => 'active',
                ]
            );

            foreach ($countryData['states'] as $stateData) {
                // 2️⃣ ESTADO
                $statePathCount = $country->children()->where('type', 'state')->count() + 1;
                $statePath = $country->path . '/' . $statePathCount;

                $state = Territory::firstOrCreate(
                    ['type' => 'state', 'parent_id' => $country->id, 'name' => $stateData['name']],
                    [
                        ...$this->ll($stateData['name']),
                        'slug' => Str::slug($stateData['name']),
                        'code' => $stateData['code'],
                        'path' => $statePath,
                        'status' => 'active',
                    ]
                );

                foreach ($stateData['cities'] as $cityData) {
                    // 3️⃣ CIUDAD
                    $cityPathCount = $state->children()->where('type', 'city')->count() + 1;
                    $cityPath = $state->path . '/' . $cityPathCount;

                    $city = Territory::firstOrCreate(
                        ['type' => 'city', 'parent_id' => $state->id, 'name' => $cityData['name']],
                        [
                            ...$this->ll($cityData['name']),
                            'slug' => Str::slug($cityData['name']),
                            'code' => $cityData['code'],
                            'path' => $cityPath,
                            'status' => 'active',
                        ]
                    );

                    foreach ($cityData['districts'] as $index => $districtName) {
                        // 4️⃣ DISTRITO / BARRIO
                        $districtPathCount = $index + 1;
                        $districtPath = $city->path . '/' . $districtPathCount;

                        Territory::firstOrCreate(
                            ['type' => 'neighborhood', 'parent_id' => $city->id, 'name' => $districtName],
                            [
                                ...$this->ll($districtName),
                                'slug' => Str::slug($districtName),
                                'path' => $districtPath,
                                'status' => 'active',
                            ]
                        );
                    }
                }
            }
        }
    }
}