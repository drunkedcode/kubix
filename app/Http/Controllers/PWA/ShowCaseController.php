<?php

namespace App\Http\Controllers\PWA;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowCaseController extends Controller
{
    public function index(Request $request): Response
    {
        $territory = app('currentTerritory');

        return Inertia::render('PWA/Index', [
            'territorySlug' => $territory->slug,
        ]);
    }

    public function create(Request $request): Response
    {
        $territory = app('currentTerritory');

        return Inertia::render('PWA/Showcase/Create', [
            'territorySlug' => $territory->slug,
        ]);
    }

    public function show(Request $request, string $territory, string $id): Response
    {
        $currentTerritory = app('currentTerritory');

        return Inertia::render('PWA/Showcase/Show', [
            'territorySlug' => $currentTerritory->slug,
            'id' => $id,
        ]);
    }
}