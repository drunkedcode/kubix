// resources/js/Shared/components/maps/BaseMap.tsx
import type { ReactNode } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG, WORLD_VIEW } from './config/mapConfig';

interface BaseMapProps {
    center?: [number, number];
    zoom?: number;
    className?: string;
    children?: ReactNode;
}

// Componente interno para obligar al mapa a recentrarse cada vez que cambien las coordenadas
function MapViewController({ center, zoom }: { center: [number, number]; zoom?: number }) {
    const map = useMap();
    useEffect(() => {
        if (center && !isNaN(center[0]) && !isNaN(center[1])) {
            map.setView(center, zoom ?? map.getZoom());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [center[0], center[1], zoom, map]);
    return null;
}

export default function BaseMap({
    center,
    zoom,
    className = 'h-[420px]',
    children,
}: BaseMapProps) {
    // Si no llega centro, usamos Brasil por defecto como fallback seguro
    const validCenter = useMemo<[number, number]>(
        () => [
            center && !isNaN(Number(center[0])) ? Number(center[0]) : -14.2350,
            center && !isNaN(Number(center[1])) ? Number(center[1]) : -51.9253,
        ],
        [center?.[0], center?.[1]],
    );

    const validZoom = useMemo(
        () => (zoom && !isNaN(Number(zoom)) ? Number(zoom) : WORLD_VIEW.zoom),
        [zoom],
    );

    return (
        <MapContainer
            center={validCenter}
            zoom={validZoom}
            minZoom={MAP_CONFIG.minZoom}
            maxZoom={MAP_CONFIG.maxZoom}
            className={`w-full overflow-hidden rounded-xl border border-navy-800 ${className}`}
        >
            <MapViewController center={validCenter} zoom={validZoom} />
            <TileLayer
                url={MAP_CONFIG.tileUrl}
                attribution={MAP_CONFIG.attribution}
                className="kubix-tiles"
            />
            {children}
        </MapContainer>
    );
}