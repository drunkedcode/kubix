// resources/js/Shared/components/maps/config/pinIcon.ts
import L from 'leaflet';

/**
 * pinIcon.ts
 * Qué es:          el dibujo del pin del mapa.
 * Responsabilidad: SOLO la forma (gota SVG, tamaño, punto de anclaje).
 * Quién lo usa:    MarkersLayer.tsx
 * Qué NO hace:     no sabe qué significa un color; recibe color y símbolo ya decididos.
 * Para cambiar:    otra forma de pin (círculo, ícono por rubro) se edita solo aquí.
 */
export const makePinIcon = (color: string, glyph = '') =>
    L.divIcon({
        className: 'kubix-pin',
        iconSize: [30, 40],
        iconAnchor: [15, 40],
        html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 1C7.3 1 1 7.2 1 14.8c0 10.2 14 24.2 14 24.2s14-14 14-24.2C29 7.2 22.7 1 15 1z" fill="${color}" stroke="#0a1426" stroke-width="2"/>
            <circle cx="15" cy="15" r="7" fill="#fff" fill-opacity="0.92"/>
            <text x="15" y="19" text-anchor="middle" font-size="11" font-weight="700" font-family="sans-serif" fill="#0a1426">${glyph}</text>
        </svg>`,
    });