<?php

namespace App\Http\Controllers\Territory;

use App\Http\Controllers\Controller;
use App\Services\Domains\Territory\TerritoryPreviewService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TerritoryPreviewController extends Controller
{
    public function __construct(
        protected TerritoryPreviewService $preview,
    ) {}

    /**
     * Pantalla de exploración/alta de territorios.
     * Selección por URL: ?country=BR&state=AM&city=1302603&neighborhood=node/123
     * Todo el trabajo (selects, cards, foco del mapa, markers, detalle de
     * barrio) lo arma TerritoryPreviewService::resolve() en un solo lugar.
     */
    public function create(Request $request): Response
    {
        $payload = $this->preview->resolve(
            $request->query('country'),
            $request->query('state'),
            $request->query('city'),
            $request->query('neighborhood'),
        );

        return Inertia::render('Territory/Create', $payload);
    }
}
