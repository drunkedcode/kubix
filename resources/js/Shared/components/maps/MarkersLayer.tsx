// resources/js/Shared/components/maps/MarkersLayer.tsx
import { useEffect } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { makePinIcon } from './config/pinIcon';

export interface MapMarker {
    id: number | string;
    lat?: number;
    lng?: number;
    latitude?: number;
    longitude?: number;
    title?: string;
    name?: string;
    subtitle?: string;
    color?: string;
    glyph?: string;
    badge?: string;
    /** Destino al tocar el pin (lo decide el backend; ej: el aterrizaje de un territorio). */
    href?: string;
}

interface MarkersLayerProps {
    markers?: MapMarker[];
    onMarkerClick?: (marker: MapMarker) => void;
    /** Ajusta la vista a todos los pines cada vez que cambian. Apagado por defecto. */
    fit?: boolean;
    padding?: number;
    /** Zoom máximo al encuadrar (evita acercarse demasiado con un solo pin). */
    maxZoom?: number;
}

export default function MarkersLayer({
    markers = [],
    onMarkerClick,
    fit = false,
    padding = 60,
    maxZoom = 14,
}: MarkersLayerProps) {
    const map = useMap();

    // Resolver coordenadas independientemente de cómo las mande el backend (lat/lng o latitude/longitude)
    const resolved = markers
        .map((m) => ({
            ...m,
            resolvedLat: Number(m.lat ?? m.latitude),
            resolvedLng: Number(m.lng ?? m.longitude),
        }))
        .filter((m) => !isNaN(m.resolvedLat) && !isNaN(m.resolvedLng));

    // Cambia cuando cambian los pines (no en cada render), para no reencuadrar de más
    const fitKey = resolved.map((m) => `${m.id}:${m.resolvedLat},${m.resolvedLng}`).join('|');

    useEffect(() => {
        if (!fit || resolved.length === 0) return;

        const bounds = L.latLngBounds(
            resolved.map((m) => [m.resolvedLat, m.resolvedLng] as [number, number]),
        );
        map.fitBounds(bounds, { padding: [padding, padding], maxZoom });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, fit, fitKey, padding, maxZoom]);

    return (
        <>
            {resolved.map((m) => {
                const title = m.title || m.name || 'Ubicación';
                const color = m.color || '#3b82f6'; // Azul por defecto si no viene color

                return (
                    <Marker
                        key={m.id}
                        position={[m.resolvedLat, m.resolvedLng]}
                        icon={makePinIcon(color, m.glyph)}
                        eventHandlers={{ click: () => onMarkerClick?.(m) }}
                    >
                        <Tooltip direction="top" offset={[0, -36]} className="kubix-tooltip">
                            <strong>{title}</strong>
                            {m.subtitle && <div>{m.subtitle}</div>}
                            {m.badge && <div style={{ color }}>{m.badge}</div>}
                        </Tooltip>
                    </Marker>
                );
            })}
        </>
    );
}