<?php

namespace App\Services\Domains\Territory\Config;

use App\Services\Domains\Territory\Config\Geocoders\TerritoryGeocoder;
use App\Services\Domains\Territory\Config\Geocoders\IbgeGeocoder;
use App\Services\Domains\Territory\Config\Geocoders\NominatimGeocoder;

/**
 * Class TerritoryDataService
 * 
 * Actúa como el enrutador central (Dispatcher) que decide qué proveedor 
 * de geocodificación utilizar según el país solicitado.
 */
class TerritoryDataService
{
    // Catálogo base de países soportados en el sistema Kubix
    private array $supportedCountries = [
        'BR' => 'Brasil',
        'CO' => 'Colombia',
        'VE' => 'Venezuela',
    ];

    /**
     * Retorna el geocodificador adecuado de forma dinámica.
     * Si no hay un proveedor gubernamental específico, usa Nominatim por defecto.
     */
    public function forCountry(string $countryCode = 'BR'): TerritoryGeocoder
    {
        $codigo = strtoupper($countryCode);
        $nombrePais = $this->supportedCountries[$codigo] ?? 'Brasil';

        return match ($codigo) {
            'BR'    => new IbgeGeocoder(),                                     // 🇧🇷 Brasil usa IBGE oficial
            default => (new NominatimGeocoder())->setCountry($nombrePais),      // 🌐 Cualquier otro país usa Nominatim global
        };
    }

    /**
     * Devuelve la lista de países habilitados en el sistema.
     */
    public function supportedCountries(): array
    {
        return $this->supportedCountries;
    }

    /**
     * Obtiene el nombre oficial del país a partir de su código alfa-2.
     */
    public function getCountryName(string $countryCode): string
    {
        return $this->supportedCountries[strtoupper($countryCode)] ?? 'Brasil';
    }
}