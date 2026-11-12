<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PayBusinessRequest;
use App\Http\Requests\Api\StorePromotionRequest;
use App\Http\Requests\Api\UpdatePromotionStatusRequest;
use App\Services\Domains\Business\BusinessPromotionsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Las campañas de un negocio, vistas por su dueño en la app. */
class PromotionController extends Controller
{
    public function __construct(
        protected BusinessPromotionsService $promotions,
    ) {}

    public function index(Request $request, int $business): JsonResponse
    {
        return response()->json($this->promotions->list($request->user(), $business));
    }

    public function store(StorePromotionRequest $request, int $business): JsonResponse
    {
        return response()->json($this->promotions->create($request->user(), $business, $request->validated()), 201);
    }

    public function activate(PayBusinessRequest $request, int $business, int $promotion): JsonResponse
    {
        return response()->json($this->promotions->activate($request->user(), $business, $promotion, $request->validated('method')));
    }

    public function status(UpdatePromotionStatusRequest $request, int $business, int $promotion): JsonResponse
    {
        return response()->json($this->promotions->changeStatus($request->user(), $business, $promotion, $request->validated('status')));
    }
}
