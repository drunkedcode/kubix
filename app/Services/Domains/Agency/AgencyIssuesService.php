<?php

namespace App\Services\Domains\Agency;

use App\Models\Territory;
use Illuminate\Support\Collection;

/*
|--------------------------------------------------------------------------
| AGENCIA / ISSUES (submódulo): LO QUE MUESTRA CADA PESTAÑA
|--------------------------------------------------------------------------
| Pantalla: Pages/Agency/Issues/Index.tsx · catálogo: agency.issues
| Un método por pestaña, con el nombre de su clave.
*/

class AgencyIssuesService
{
    /** Pestaña general: resumen de reclamos. */
    public function general(Territory $territory): array
    {
        $issues = $this->all($territory);
        $open   = $issues->where('status', '!=', 'resolved');

        return [
            'summary' => [
                'open'        => $open->count(),
                'resolved'    => $issues->where('status', 'resolved')->count(),
                'oldest_days' => (int) $open->max('age_days'),
            ],
        ];
    }

    /** Pestaña open: reclamos nuevos y en curso. */
    public function open(Territory $territory): array
    {
        return ['open' => $this->all($territory)->where('status', '!=', 'resolved')->values()->all()];
    }

    /** Pestaña resolved: reclamos cerrados. */
    public function resolved(Territory $territory): array
    {
        return ['resolved' => $this->all($territory)->where('status', 'resolved')->values()->all()];
    }

    /** MOCK: pasa a leer de la tabla de issues cuando VI empiece a reportarlos. */
    private function all(Territory $territory): Collection
    {
        return collect([
            ['id' => 1, 'title' => 'El mural no carga las fotos nuevas',      'reporter' => 'Ana Souza',    'category' => 'Mural',      'status' => 'new',         'age_days' => 1],
            ['id' => 2, 'title' => 'Negocio duplicado en el directorio',      'reporter' => 'Carlos Lima',  'category' => 'Directorio', 'status' => 'in_progress', 'age_days' => 4],
            ['id' => 3, 'title' => 'No llega la notificación de empleos',     'reporter' => 'Marta Reis',   'category' => 'Empleos',    'status' => 'new',         'age_days' => 6],
            ['id' => 4, 'title' => 'El splash muestra el barrio equivocado',  'reporter' => 'Pedro Alves',  'category' => 'VI',         'status' => 'resolved',    'age_days' => 9],
            ['id' => 5, 'title' => 'Horario incorrecto en una panadería',     'reporter' => 'Julia Nunes',  'category' => 'Directorio', 'status' => 'resolved',    'age_days' => 12],
        ]);
    }
}
