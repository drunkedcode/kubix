<?php

namespace App\Services\Domains\Agency;

use App\Models\Territory;
use App\Services\Domains\Issue\IssueService;
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
    public function __construct(
        protected IssueService $issues,
    ) {}

    /** Pestaña general: resumen y los últimos reclamos. */
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
            'recent' => $issues->take(5)->values()->all(),
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

    private function all(Territory $territory): Collection
    {
        return collect($this->issues->forTerritory($territory->id));
    }
}
