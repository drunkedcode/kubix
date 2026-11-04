<?php

namespace App\Services\Domains\Territory\Config\Geocoders;

/**
 * Interface TerritoryGeocoder
 *
 * Define el contrato estándar que todo proveedor de datos geográficos
 * (ya sea local como IBGE o global como Nominatim/OSM) debe implementar
 * para garantizar polimorfismo y Cero Hardcoding en Kubix.
 */
interface TerritoryGeocoder
{
    /**
     * Obtiene la información general de un país.
     */
    public function getCountryInfo(string $name): array;

    /**
     * Obtiene la información y metadatos de un estado o provincia.
     */
    public function getStateInfo(string $name, string $countryCode): array;

    /**
     * Obtiene la información, centroide y polígonos de una ciudad/municipio.
     */
    public function getCityInfo(string $name, ?string $stateName = null): array;

    /**
     * Lista los estados/provincias del país configurado.
     * Si el proveedor no tiene catálogo exhaustivo (ej. Nominatim), devuelve [].
     *
     * @return array<int, array{code:string, abbr?:string, name:string}>
     */
    public function listStates(): array;

    /**
     * Lista las ciudades/municipios de un estado.
     * Si el proveedor no tiene catálogo exhaustivo (ej. Nominatim), devuelve [].
     *
     * @return array<int, array{code:string, name:string}>
     */
    public function listCities(string $stateCode): array;
}
