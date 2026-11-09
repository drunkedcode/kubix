<?php

namespace App\Services\Domains\App;

use App\Models\Business;
use App\Models\Territory;
use App\Services\Domains\Business\BusinessService;

/** Receta del Diretório de la app: los negocios activos del barrio donde está la persona. */
class DirectoryService
{
    private const PER_PAGE = 20;

    public function __construct(
        protected BusinessService $businesses,
    ) {}

    /** Filtros opcionales: segment (clave del segmento) y q (texto en el nombre). */
    public function index(Territory $territory, array $filters = []): array
    {
        $page = $this->businesses->directoryFor(
            $territory->id,
            $filters['segment'] ?? null,
            $filters['q'] ?? null,
            self::PER_PAGE,
        );

        return [
            'data' => $page->getCollection()
                ->map(fn (Business $business) => $this->entry($business))
                ->values()
                ->all(),
            'meta' => [
                'page'     => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total'    => $page->total(),
            ],
        ];
    }

    private function entry(Business $business): array
    {
        $location = $business->locations->firstWhere('is_primary', true) ?? $business->locations->first();

        return [
            'id'        => $business->id,
            'name'      => $business->name,
            'slug'      => $business->slug,
            'segment'   => $business->segment,
            'component' => $business->settings['component'] ?? null,
            'latitude'  => $location ? (float) $location->latitude : null,
            'longitude' => $location ? (float) $location->longitude : null,
        ];
    }
}
