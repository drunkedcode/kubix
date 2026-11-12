<?php

namespace App\Services\Domains\Agency;

use App\Models\Territory;
use App\Services\Domains\Activity\ActivityService;
use App\Services\Domains\Business\BusinessService;
use App\Services\Domains\Metrics\MetricsService;
use App\Services\Domains\Presence\PresenceService;

/*
|--------------------------------------------------------------------------
| AGENCIA (página index): LO QUE MUESTRA CADA PESTAÑA
|--------------------------------------------------------------------------
| Pantalla: Pages/Agency/Index.tsx · catálogo: agency.index
| Un método por pestaña, con el nombre de su clave. Cada uno es la "receta"
| de esa pestaña: pide a otros servicios y devuelve lo que el front pinta.
*/

class AgencyIndexService
{
    public function __construct(
        protected ActivityService $activity,
        protected AgencyService $agency,
        protected BusinessService $businesses,
        protected MetricsService $metrics,
        protected PresenceService $presence,
    ) {}

    /** Pestaña general: tarjetas, mapa y segmentos del barrio. */
    public function general(Territory $territory): array
    {
        $ids = [$territory->id];

        return [
            'general' => [
                'stats'    => $this->metrics->agencyKpis($ids),
                'markers'  => $this->businesses->toMarkers($this->businesses->listForTerritory($territory->id)),
                'areas'    => $territory->polygon
                    ? [['id' => $territory->id, 'name' => $territory->name, 'geometry' => $territory->polygon]]
                    : [],
                'segments' => $this->metrics->segments($ids),
                'performance' => $this->metrics->performance($ids),
                'top'      => $this->metrics->topBusinesses($ids),
                'activity' => $this->activity->recent($ids),
                'online'   => $this->presence->online($territory),
            ],
        ];
    }

    /** Pestaña evolution: tendencia de negocios y los más recientes. */
    public function evolution(Territory $territory): array
    {
        $ids   = [$territory->id];
        $trend = $this->businesses->trendForTerritories($ids);

        return [
            'evolution' => [
                'trend'   => $trend,
                'summary' => $this->businesses->trendSummary($trend),
                'recent'  => $this->businesses->recentForTerritories($ids),
            ],
        ];
    }

    /** Pestaña settings: configuración propia del barrio. */
    public function settings(Territory $territory): array
    {
        return ['settings' => $this->agency->settings($territory)];
    }
    
}
