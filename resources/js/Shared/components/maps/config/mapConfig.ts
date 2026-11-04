/**
 * mapConfig.ts
 * Qué es:          configuración técnica del mapa.
 * Responsabilidad: SOLO lo técnico (tiles, atribución, límites de zoom).
 * Quién lo usa:    BaseMap.tsx
 * Qué NO hace:     no asume ningún lugar. La vista (centro y zoom) la decide
 *                  quien usa el mapa, o AreasLayer con fitBounds.
 * Para cambiar:    proveedor de tiles o límites de zoom, se edita aquí.
 */
export const MAP_CONFIG = {
    tileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    minZoom: 2,
    maxZoom: 18,
};

// Solo un punto neutro (el mundo entero) para el caso en que nadie diga nada.
export const WORLD_VIEW = { center: [20, 0] as [number, number], zoom: 2 };