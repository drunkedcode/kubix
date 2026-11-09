<?php

namespace App\Services\Domains\Agency;

use App\Models\Territory;
use App\Services\Domains\Territory\TerritoryService;
use Illuminate\Support\Arr;

/**
 * La "agencia" de un barrio es el propio barrio: este servicio opera sobre esa entidad.
 * La identidad (logo, colores, lema) es fija de VI y no se configura; cada barrio solo
 * define su parte económica (precios, en centavos de real).
 * Lo que muestra cada pantalla vive en AgencyIndexService y AgencyIssuesService;
 * los números, en MetricsService; los totalizadores, en OverviewService.
 */
class AgencyService
{
    private const SETTING_KEYS = ['onboarding_price', 'daily_price', 'promotion_price'];

    public function __construct(
        protected TerritoryService $territories,
    ) {}

    /** Configuración económica del barrio; lo no definido va null. */
    public function settings(Territory $territory): array
    {
        $saved = $territory->settings ?? [];

        return collect(self::SETTING_KEYS)
            ->mapWithKeys(fn (string $key) => [$key => $saved[$key] ?? null])
            ->all();
    }

    /** Datos del banner de la agencia: estado real del barrio y el momento en que se cargó la pantalla. */
    public function profile(Territory $territory): array
    {
        return [
            'status'     => $territory->status,
            'updated_at' => now()->toIso8601String(),
        ];
    }

    /** Guarda la configuración. El territorio lo decide la URL, nunca el formulario. */
    public function updateSettings(Territory $territory, array $data): void
    {
        $this->territories->updateSettings($territory, Arr::only($data, self::SETTING_KEYS));
    }
}
