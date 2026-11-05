<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Agency\AgencyController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Business\BusinessController;
use App\Http\Controllers\Overview\OverviewController;
use App\Http\Controllers\PWA\ShowCaseController;
use App\Http\Controllers\Team\TeamController;
use App\Http\Controllers\Territory\TerritoryController;
use App\Http\Controllers\Territory\TerritoryPreviewController;

/*
|--------------------------------------------------------------------------
| Regla de este archivo
|--------------------------------------------------------------------------
| Las rutas están agrupadas por casa: PLATAFORMA, OVERVIEW y AGENCY.
| Cada ruta lleva su can:<permiso>, y los permisos se declaran solo en
| config/access.php. Excepción: el detalle de un negocio, cuyas pestañas
| decide el controlador (resolveTab, 403 si no ve ninguna).
*/

// ======================================
// Public
// ======================================
Route::get('/login', [LoginController::class, 'create'])->name('login');
Route::post('/login', [LoginController::class, 'store'])->name('login.store');

// ======================================
// Authenticated
// ======================================
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // ----------------------------------
    // PLATAFORMA: explorador global, sin territorio en contexto
    // ----------------------------------
    Route::middleware('can:view-territory-explorer')->prefix('territories')->name('territories.')->group(function () {
        Route::get('/', [TerritoryController::class, 'index'])->name('index');
        Route::get('/create', [TerritoryPreviewController::class, 'create'])->name('create');
        Route::post('/', [TerritoryController::class, 'store'])->name('store');

        // Las rutas con parámetro van al final para no capturar palabras como "create".
        Route::patch('/{territory}', [TerritoryController::class, 'update'])->name('update');
    });

    // ----------------------------------
    // OVERVIEW de todos los territorios del usuario (ej: Pedro con 2 barrios).
    // Sin can:: no hay un territorio único; OverviewService filtra por membresías.
    // ----------------------------------
    Route::get('/overview', [OverviewController::class, 'all'])->name('overview');

    // ----------------------------------
    // Un territorio concreto. territory.resolve va primero: define el territorio
    // actual y el equipo de Spatie con el que se evalúan los can:.
    // ----------------------------------
    Route::middleware('territory.resolve')
        ->prefix('{territory}')
        ->group(function () {

            // OVERVIEW de un país, estado o ciudad
            Route::get('/overview', [OverviewController::class, 'territory'])
                ->middleware('can:view-dashboard')
                ->name('overview.territory');

            // AGENCY: un barrio
            Route::prefix('agencies')->name('agencies.')->group(function () {
                Route::get('/', [AgencyController::class, 'index'])
                    ->middleware('can:view-dashboard')
                    ->name('index');

                Route::post('/settings', [AgencyController::class, 'updateSettings'])
                    ->middleware('can:manage-agency')
                    ->name('settings.update');
            });

            // ISSUES: reclamos del barrio (submódulo de Agencia)
            Route::prefix('issues')->name('issues.')->group(function () {
                Route::get('/', [AgencyController::class, 'issues'])
                    ->middleware('can:view-issues')
                    ->name('index');
            });

            Route::prefix('businesses')->name('businesses.')->group(function () {
                Route::get('/', [BusinessController::class, 'index'])
                    ->middleware('can:view-business-list')
                    ->name('index');

                // Rutas fijas primero: si no, '/create' lo captura '/{business}'.
                Route::middleware('can:manage-business')->group(function () {
                    Route::get('/create', [BusinessController::class, 'create'])->name('create');
                    Route::post('/', [BusinessController::class, 'store'])->name('store');
                });

                Route::get('/{business}', [BusinessController::class, 'show'])
                    ->whereNumber('business')
                    ->name('show');
            });

            // Equipo: quién trabaja en este territorio (cada nivel asigna lo que le corresponde).
            Route::prefix('team')->name('team.')->middleware('can:view-team')->group(function () {
                Route::get('/', [TeamController::class, 'index'])->name('index');

                Route::middleware('can:manage-team')->group(function () {
                    Route::get('/create', [TeamController::class, 'create'])->name('create');
                    Route::get('/lookup', [TeamController::class, 'lookup'])
                        ->middleware('throttle:20,1')
                        ->name('lookup');
                    Route::post('/', [TeamController::class, 'store'])->name('store');
                    Route::delete('/{user}', [TeamController::class, 'destroy'])
                        ->whereNumber('user')
                        ->name('destroy');
                });
            });

            // Vitrina PWA: provisoria; pasará a ser una pestaña de Agency.
            Route::prefix('showcase')->middleware('can:view-dashboard')->name('showcase.')->group(function () {
                Route::get('/', [ShowCaseController::class, 'index'])->name('index');
                Route::get('/create', [ShowCaseController::class, 'create'])->name('create');
                Route::get('/{id}', [ShowCaseController::class, 'show'])->name('show');
            });
        });
});
