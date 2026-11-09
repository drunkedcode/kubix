<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\DirectoryRequest;
use App\Models\Territory;
use App\Services\Domains\App\DirectoryService;
use Illuminate\Http\JsonResponse;

class DirectoryController extends Controller
{
    public function __construct(
        protected DirectoryService $directory,
    ) {}

    public function index(DirectoryRequest $request): JsonResponse
    {
        /** @var Territory $territory */
        $territory = app('currentTerritory');

        return response()->json($this->directory->index($territory, $request->validated()));
    }
}
