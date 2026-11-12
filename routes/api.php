<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\ContextController;
use App\Http\Controllers\Api\DirectoryController;
use App\Http\Controllers\Api\PromotionController;
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

        // Campañas del negocio: solo su dueño.
        Route::get('businesses/{business}/promotions', [PromotionController::class, 'index'])->whereNumber('business');
        Route::post('businesses/{business}/promotions', [PromotionController::class, 'store'])->whereNumber('business');
        Route::post('businesses/{business}/promotions/{promotion}/activate', [PromotionController::class, 'activate'])->whereNumber(['business', 'promotion']);
        Route::post('businesses/{business}/promotions/{promotion}/status', [PromotionController::class, 'status'])->whereNumber(['business', 'promotion']);

        // Lo que depende del barrio donde está la persona (contexto en Redis).
        Route::middleware('user.territory')->group(function () {
            Route::get('directory', [DirectoryController::class, 'index']);
            Route::get('businesses/{business}', [BusinessController::class, 'show'])->whereNumber('business');
            Route::post('businesses/{business}/events', [BusinessController::class, 'event'])->whereNumber('business')->middleware('throttle:120,1');
            Route::post('businesses/{business}/reviews', [BusinessController::class, 'review'])->whereNumber('business')->middleware('throttle:20,1');
        });
    });
});