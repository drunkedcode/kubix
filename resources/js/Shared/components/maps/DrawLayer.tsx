import { useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import { Check, Pencil } from 'lucide-react';
import type { MapArea } from './AreasLayer';

/**
 * DrawLayer.tsx
 * Qué es:          capa de edición de límites: modo editar vértices y dibujar polígonos nuevos.
 * Responsabilidad: mostrar las áreas, permitir editarlas/crearlas (Geoman) y AVISAR
 *                  el resultado por callbacks. No guarda nada.
 * Quién lo usa:    Territory/Create.tsx (dar de alta / ajustar límite de un barrio).
 * Qué NO hace:     no persiste, no valida permisos (el padre pasa canEdit) y no sabe
 *                  qué representa el área. El padre actualiza `areas` con lo recibido.
 * Para cambiar:    herramientas de dibujo habilitadas en el useEffect de addControls;
 *                  textos del botón al final; idioma de Geoman en setLang.
 * Dependencias:    @geoman-io/leaflet-geoman-free (más pesado: cargar solo donde se edite).
 * Contrato:        MapArea viene de AreasLayer.tsx (Polygon o MultiPolygon).
 *                  onAreaChange(id, geometry): se editaron los vértices de un área.
 *                  onAreaCreate(geometry): se dibujó un polígono nuevo (Geoman solo dibuja
 *                  Polygon simples); la capa temporal se elimina y el padre lo devuelve
 *                  por `areas` si lo acepta.
 */
type AreaGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;

interface DrawLayerProps {
    areas: MapArea[];
    canEdit?: boolean;
    onAreaChange?: (id: MapArea['id'], geometry: AreaGeometry) => void;
    onAreaCreate?: (geometry: GeoJSON.Polygon) => void;
}

export default function DrawLayer({
    areas,
    canEdit = true,
    onAreaChange,
    onAreaCreate,
}: DrawLayerProps) {
    const map = useMap();
    const [editing, setEditing] = useState(false);
    const btnWrap = useRef<HTMLDivElement>(null);

    // refs para no reconstruir capas cuando el padre actualiza el estado mientras se edita
    const areasRef = useRef(areas);
    areasRef.current = areas;
    const onChangeRef = useRef(onAreaChange);
    onChangeRef.current = onAreaChange;
    const onCreateRef = useRef(onAreaCreate);
    onCreateRef.current = onAreaCreate;

    const areasKey = areas.map((a) => a.id).join(',');

    useEffect(() => {
        if (btnWrap.current) L.DomEvent.disableClickPropagation(btnWrap.current);
        map.pm.setLang('es');
    }, [map]);

    // Polígonos (con edición de vértices cuando editing = true)
    useEffect(() => {
        const group = L.featureGroup().addTo(map);

        areasRef.current.forEach((a) => {
            const color = a.color ?? '#2dd4bf';
            const poly = L.geoJSON(a.geometry).getLayers()[0] as L.Polygon;
            poly.setStyle({ color, weight: 2, fillColor: color, fillOpacity: 0.12 });
            poly.bindTooltip(a.name, { sticky: true, className: 'kubix-tooltip' });
            group.addLayer(poly);

            if (editing) {
                poly.pm.enable({ allowSelfIntersection: false });
                poly.on('pm:edit', () =>
                    onChangeRef.current?.(a.id, poly.toGeoJSON().geometry as AreaGeometry),
                );
            }
        });

        return () => {
            group.remove();
        };
    }, [map, areasKey, editing]);

    // Herramienta para dibujar nuevos límites
    useEffect(() => {
        if (!editing) return;

        map.pm.addControls({
            position: 'topleft',
            drawMarker: false,
            drawCircleMarker: false,
            drawPolyline: false,
            drawRectangle: false,
            drawCircle: false,
            drawText: false,
            drawPolygon: true,
            editMode: false,
            dragMode: false,
            cutPolygon: false,
            removalMode: false,
            rotateMode: false,
        });

        const handleCreate = (e: { layer: L.Layer }) => {
            onCreateRef.current?.((e.layer as L.Polygon).toGeoJSON().geometry as GeoJSON.Polygon);
            map.removeLayer(e.layer);
        };
        map.on('pm:create', handleCreate as L.LeafletEventHandlerFn);

        return () => {
            map.off('pm:create', handleCreate as L.LeafletEventHandlerFn);
            map.pm.removeControls();
        };
    }, [map, editing]);

    if (!canEdit) return null;

    return (
        <div ref={btnWrap} className="absolute right-3 top-3 z-[1000]">
            <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                title={editing ? 'Terminar edición' : 'Editar límite'}
                aria-label={editing ? 'Terminar edición' : 'Editar límite'}
                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-colors ${
                    editing
                        ? 'border-teal-500/50 bg-teal-500 text-navy-950'
                        : 'border-navy-700 bg-navy-900 text-slate-200 hover:bg-navy-800'
                }`}
            >
                {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </button>
        </div>
    );
}
