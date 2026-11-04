<?php

namespace App\Http\Controllers\Territory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Territory\StoreTerritoryRequest;
use App\Http\Requests\Territory\UpdateBoundaryRequest;
use App\Services\Domains\Territory\TerritoryService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TerritoryController extends Controller
{
    public function __construct(
        protected TerritoryService $territoryService,
    ) {}

    public function index(Request $request): Response
    {
        $country = $request->query('country');
        $state   = $request->query('state');
        $city    = $request->query('city');

        $payload = $this->territoryService->resolveIndex(
            $country ? (int) $country : null,
            $state ? (int) $state : null,
            $city ? (int) $city : null,
        );

        return Inertia::render('Territory/Index', $payload);
    }

    /** Da de alta el barrio elegido en el explorador (polígono final del draw). */
    public function store(StoreTerritoryRequest $request): RedirectResponse
    {
        $d = $request->validated();

        $territorio = $this->territoryService->registerNeighborhood(
            countryCode: $d['country'],
            stateCode: $d['state'],
            cityCode: $d['city'],
            neighborhoodName: $d['name'],
            osmId: $d['osm_id'],
            polygon: $d['polygon'],
            boundarySource: $d['boundary_source'] ?? 'osm',
        );

        return back()->with('success', "Territorio \"{$territorio->name}\" dado de alta.");
    }

    /** Actualiza un territorio */
    public function update(UpdateBoundaryRequest $request, int $territory): RedirectResponse
    {
        $territorio = $this->territoryService->updateBoundary($territory, $request->validated()['polygon']);

        return back()->with('success', "Límite de \"{$territorio->name}\" actualizado.");
    }
}
