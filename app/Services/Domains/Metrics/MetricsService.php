<?php

namespace App\Services\Domains\Metrics;

use App\Services\Domains\Business\BusinessService;

/*
|--------------------------------------------------------------------------
| METRICS: LOS NÚMEROS QUE SE MUESTRAN
|--------------------------------------------------------------------------
| Recibe siempre una lista de ids de territorios: uno en un barrio, varios en
| un totalizador. Todo número de pantalla sale de aquí; las páginas deciden
| QUÉ mostrar y no cuentan. Cuando VI mande datos reales, los // MOCK se
| reemplazan solo en este archivo.
*/

class MetricsService
{
    public function __construct(
        protected BusinessService $businesses,
    ) {}

    /** Las tarjetas de la pestaña General. */
    public function summary(array $territoryIds): array
    {
        $registered = $this->businesses->countForTerritories($territoryIds);

        return [
            ['label' => 'Negocios registrados', 'value' => $registered, 'icon' => 'building', 'tone' => 'teal',  'trend' => 12], // MOCK: trend
            ['label' => 'Al día',               'value' => 31,  'icon' => 'star',     'tone' => 'teal',  'trend' => 8],  // MOCK
            ['label' => 'Por vencer',           'value' => 10,  'icon' => 'contrast', 'tone' => 'amber', 'trend' => -3], // MOCK
            ['label' => 'Vencidos',             'value' => 7,   'icon' => 'flame',    'tone' => 'rose',  'trend' => 5],  // MOCK
            ['label' => 'Onlines',              'value' => 150, 'icon' => 'flame',    'tone' => 'teal',  'trend' => 80], // MOCK
        ];
    }

    // MOCK: pendiente de la columna real de categoría/segmento
    public function segments(array $territoryIds): array
    {
        return [
            ['label' => 'Restaurantes', 'count' => 18],
            ['label' => 'Salones',      'count' => 12],
            ['label' => 'Barberías',    'count' => 9],
            ['label' => 'Salud',        'count' => 5],
            ['label' => 'Otros',        'count' => 4],
        ];
    }
}
