import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * AreasLayer.tsx
 * Qué es:          capa de solo lectura que dibuja áreas (polígonos) en el mapa.
 * Responsabilidad: pintar cada área con su color y tooltip, y ajustar la vista a ellas.
 * Quién lo usa:    cualquier mapa que solo muestre límites (ej. Dashboard/Tabs/GeneralTab).
 * Qué NO hace:     no edita ni dibuja límites nuevos (eso es DrawLayer.tsx) y no sabe
 *                  qué es un barrio, ciudad o estado: recibe geometría, nombre y color.
 * Para cambiar:    borde/relleno, color por defecto o padding del zoom se editan aquí.
 *                  El estilo de .kubix-tooltip vive en resources/css/app.css.
 * Contrato:        MapArea es el tipo único de área; DrawLayer lo reutiliza.
 *                  La geometría es GeoJSON Polygon o MultiPolygon, en orden [lng, lat].
 */
export interface MapArea {
    id: number | string;
    name: string;
    geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
    color?: string;
}

interface AreasLayerProps {
    areas: MapArea[];
    fit?: boolean; // ajusta la vista a todas las áreas
    padding?: number;
}

export default function AreasLayer({ areas, fit = true, padding = 30 }: AreasLayerProps) {
    const map = useMap();
    const areasKey = areas.map((a) => a.id).join(',');

    useEffect(() => {
        if (areas.length === 0) return;

        const group = L.featureGroup().addTo(map);

        areas.forEach((a) => {
            const color = a.color ?? '#2dd4bf';
            const poly = L.geoJSON(a.geometry).getLayers()[0] as L.Polygon;
            poly.setStyle({ color, weight: 2, fillColor: color, fillOpacity: 0.1 });
            poly.bindTooltip(a.name, { sticky: true, className: 'kubix-tooltip' });
            group.addLayer(poly);
        });

        if (fit) map.fitBounds(group.getBounds(), { padding: [padding, padding] });

        return () => {
            group.remove();
        };
    }, [map, areasKey, fit, padding]);

    return null;
}
