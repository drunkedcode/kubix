<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LocateRequest;
use App\Services\Domains\App\AppSessionService;
use Illuminate\Http\JsonResponse;

class ContextController extends Controller
{
    public function __construct(
        protected AppSessionService $session,
    ) {}

    public function update(LocateRequest $request): JsonResponse
    {
        return response()->json($this->session->open(
            $request->user(),
            $request->validated('latitude'),
            $request->validated('longitude'),
        ));
    }
}
