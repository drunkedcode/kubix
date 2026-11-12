<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PayBusinessRequest;
use App\Http\Requests\Api\RegisterBusinessRequest;
use App\Http\Requests\Api\StoreEventRequest;
use App\Http\Requests\Api\StoreReviewRequest;
use App\Models\Territory;
use App\Services\Domains\App\BusinessProfileService;
use App\Services\Domains\Business\BusinessRegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BusinessController extends Controller
{
    public function __construct(
        protected BusinessRegistrationService $registration,
        protected BusinessProfileService $profiles,
    ) {}

    public function store(RegisterBusinessRequest $request): JsonResponse
    {
        return response()->json($this->registration->register($request->user(), $request->validated()), 201);
    }

    public function pay(PayBusinessRequest $request, int $business): JsonResponse
    {
        return response()->json($this->registration->pay($request->user(), $business, $request->validated('method')));
    }

    /** Perfil del negocio (abrirlo cuenta como una visualización). */
    public function show(Request $request, int $business): JsonResponse
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        return response()->json($this->profiles->show($territory, $request->user(), $business));
    }

    /** Algo que la persona hizo con el negocio: clic, llamada, WhatsApp, mapa, compra o vista de una promoción. */
    public function event(StoreEventRequest $request, int $business): Response
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        $this->profiles->event($territory, $request->user(), $business, $request->validated('type'), $request->validated('promotion_id'));

        return response()->noContent();
    }

    /** La persona valora el negocio (de 1 a 5); si ya lo había hecho, se actualiza. */
    public function review(StoreReviewRequest $request, int $business): JsonResponse
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        return response()->json($this->profiles->rate(
            $territory,
            $request->user(),
            $business,
            $request->validated('rating'),
            $request->validated('comment'),
        ));
    }
}
