<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\ContextController;
use App\Http\Controllers\Api\DirectoryController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::put('context', [ContextController::class, 'update']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::post('businesses', [BusinessController::class, 'store']);
        Route::post('businesses/{business}/pay', [BusinessController::class, 'pay'])->whereNumber('business');

        // Lo que depende del barrio donde está la persona (contexto en Redis).
        Route::middleware('user.territory')->group(function () {
            Route::get('directory', [DirectoryController::class, 'index']);
        });
    });
});