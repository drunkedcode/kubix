<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterOwnerRequest;
use App\Services\Domains\App\AppSessionService;
use App\Services\Domains\User\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AuthController extends Controller
{
    public function __construct(
        protected UserService $users,
        protected AppSessionService $session,
    ) {}

    public function register(RegisterOwnerRequest $request): JsonResponse
    {
        $user = $this->users->register($request->validated());

        return response()->json([
            'token' => $this->users->issueToken($user),
            ...$this->session->open($user, $request->validated('latitude'), $request->validated('longitude')),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->users->authenticate($request->validated('email'), $request->validated('password'));

        return response()->json([
            'token' => $this->users->issueToken($user),
            ...$this->session->open($user, $request->validated('latitude'), $request->validated('longitude')),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($this->session->open($request->user()));
    }

    public function logout(Request $request): Response
    {
        $this->users->revokeCurrentToken($request->user());

        return response()->noContent();
    }
}
