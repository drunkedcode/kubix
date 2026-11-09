<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\PayBusinessRequest;
use App\Http\Requests\Api\RegisterBusinessRequest;
use App\Services\Domains\Business\BusinessRegistrationService;
use Illuminate\Http\JsonResponse;

class BusinessController extends Controller
{
    public function __construct(
        protected BusinessRegistrationService $registration,
    ) {}

    public function store(RegisterBusinessRequest $request): JsonResponse
    {
        return response()->json($this->registration->register($request->user(), $request->validated()), 201);
    }

    public function pay(PayBusinessRequest $request, int $business): JsonResponse
    {
        return response()->json($this->registration->pay($request->user(), $business, $request->validated('method')));
    }
}
