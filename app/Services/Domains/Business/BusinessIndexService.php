<?php

namespace App\Services\Domains\Business;

use App\Enums\BusinessSegment;
use App\Models\Territory;
use App\Services\Domains\Agency\AgencyService;
use App\Services\Domains\Metrics\MetricsService;

/*
|--------------------------------------------------------------------------
| NEGÓCIOS (página index): LO QUE MUESTRA CADA PESTAÑA
|--------------------------------------------------------------------------
| Pantalla: Pages/Business/Index.tsx · catálogo: business.index
| Un método por pestaña, con el nombre de su clave. Los KPIs del encabezado
| van siempre, sea cual sea la pestaña.
*/

class BusinessIndexService
{
    public function __construct(
        protected BusinessService $businesses,
        protected MetricsService $metrics,
        protected AgencyService $agency,
    ) {}

    /** Las tarjetas del encabezado de Negócios. */
    public function kpis(Territory $territory): array
    {
        return $this->metrics->businessKpis([$territory->id]);
    }

    /** Pestaña list: todos los negocios del barrio, con filtros y paginación. */
    public function list(Territory $territory, array $filters): array
    {
        return [
            'segments'   => BusinessSegment::options(),
            'businesses' => $this->businesses->pageFor($territory->id, $filters),
        ];
    }

    /** Pestaña approvals: negocios en análisis (sin pagar el onboarding) y lo que vale activarlos. */
    public function approvals(Territory $territory): array
    {
        return [
            'businesses'      => $this->businesses->pageFor($territory->id, ['statuses' => ['standby']]),
            'onboardingPrice' => $this->agency->settings($territory)['onboarding_price'],
        ];
    }

    /** Pestaña categories: negocios por categoría. */
    public function categories(Territory $territory): array
    {
        return ['categories' => $this->businesses->countBySegment([$territory->id])];
    }
}
