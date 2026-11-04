// resources/js/Shared/ui/TerritoryDetailCard.tsx
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { Check, ChevronDown, ChevronUp, Copy, GripHorizontal, MapPin, Save, X } from 'lucide-react';

/**
 * TerritoryDetailCard.tsx
 * Qué es:          card flotante con el resumen de un barrio, justo antes del alta.
 * Responsabilidad: mostrar jerarquía, centroide y resumen del límite (tipo, vértices,
 *                  área), el motivo si no se puede guardar, y emitir onSubmit / onClose.
 * Quién lo usa:    Pages/Territory/Create.tsx (dentro del contenedor del mapa).
 * Qué NO hace:     no envía nada al servidor, no valida (recibe canSubmit y
 *                  disabledReason) y no edita el nombre.
 * Para cambiar:    posición inicial en INITIAL_OFFSET; el cálculo de área está
 *                  en areaKm2 (aproximado, solo informativo).
 * Requisito:       su contenedor debe ser `relative`. Se arrastra acotado a él.
 */
export interface TerritoryDetailCardProps {
    name: string;
    operated: boolean;
    hierarchy: { country?: string | null; state?: string | null; city?: string | null };
    lat: number | null;
    lng: number | null;
    polygon: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
    canSubmit: boolean;
    disabledReason?: string;
    onSubmit: () => void;
    onClose: () => void;
}

const INITIAL_OFFSET = { x: 12, bottom: 12 };

const ringsOf = (g: GeoJSON.Polygon | GeoJSON.MultiPolygon | null): number[][][] =>
    !g ? [] : g.type === 'Polygon' ? [g.coordinates[0] ?? []] : g.coordinates.map((p) => p[0] ?? []);

const vertexCount = (g: GeoJSON.Polygon | GeoJSON.MultiPolygon | null) =>
    ringsOf(g).reduce((s, r) => s + Math.max(r.length - 1, 0), 0);

// Área aproximada (proyección equirectangular + fórmula del polígono), en km²
const areaKm2 = (g: GeoJSON.Polygon | GeoJSON.MultiPolygon | null) => {
    const R = 6371;
    let total = 0;
    for (const ring of ringsOf(g)) {
        if (ring.length < 4) continue;
        const lat0 = (ring[0][1] * Math.PI) / 180;
        let sum = 0;
        for (let i = 0; i < ring.length - 1; i++) {
            const [x1, y1] = [(ring[i][0] * Math.PI) / 180 * Math.cos(lat0), (ring[i][1] * Math.PI) / 180];
            const [x2, y2] = [(ring[i + 1][0] * Math.PI) / 180 * Math.cos(lat0), (ring[i + 1][1] * Math.PI) / 180];
            sum += x1 * y2 - x2 * y1;
        }
        total += Math.abs(sum / 2) * R * R;
    }
    return total;
};

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-slate-400">{label}</span>
            <span className="truncate text-right font-medium text-white">{value || '—'}</span>
        </div>
    );
}

export default function TerritoryDetailCard({
    name,
    operated,
    hierarchy,
    lat,
    lng,
    polygon,
    canSubmit,
    disabledReason,
    onSubmit,
    onClose,
}: TerritoryDetailCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const drag = useRef({ startX: 0, startY: 0, x: 0, y: 0 });
    const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
    const [dragging, setDragging] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [copied, setCopied] = useState(false);

    // Posición inicial (abajo a la izquierda del contenedor), solo la primera vez
    useEffect(() => {
        const card = cardRef.current;
        const parent = card?.offsetParent as HTMLElement | null;
        if (!card || !parent || pos) return;
        setPos({ x: INITIAL_OFFSET.x, y: Math.max(8, parent.clientHeight - card.offsetHeight - INITIAL_OFFSET.bottom) });
    }, [pos]);

    const clamp = useCallback((x: number, y: number) => {
        const card = cardRef.current;
        const parent = card?.offsetParent as HTMLElement | null;
        if (!card || !parent) return { x, y };
        return {
            x: Math.min(Math.max(8, x), Math.max(8, parent.clientWidth - card.offsetWidth - 8)),
            y: Math.min(Math.max(8, y), Math.max(8, parent.clientHeight - card.offsetHeight - 8)),
        };
    }, []);

    const onDown = (e: PointerEvent<HTMLDivElement>) => {
        if (!pos) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag.current = { startX: e.clientX, startY: e.clientY, x: pos.x, y: pos.y };
        setDragging(true);
    };
    const onMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!dragging) return;
        setPos(clamp(drag.current.x + e.clientX - drag.current.startX, drag.current.y + e.clientY - drag.current.startY));
    };
    const onUp = () => setDragging(false);

    const copyGeoJson = async () => {
        if (!polygon) return;
        await navigator.clipboard.writeText(JSON.stringify(polygon));
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const vertices = vertexCount(polygon);
    const area = areaKm2(polygon);
    const badge = operated
        ? { text: 'Operado', cls: 'bg-teal-500/10 text-teal-300 border-teal-500/20' }
        : polygon
          ? { text: 'Disponible', cls: 'bg-sky-500/10 text-sky-300 border-sky-500/20' }
          : { text: 'Sin límite', cls: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };

    return (
        <div
            ref={cardRef}
            style={{ left: pos?.x ?? INITIAL_OFFSET.x, top: pos?.y ?? 0, visibility: pos ? 'visible' : 'hidden' }}
            className={`absolute z-[1000] w-80 max-w-[calc(100%-16px)] select-none rounded-2xl border border-navy-700 bg-navy-900/95 shadow-2xl backdrop-blur-md ${
                dragging ? 'ring-2 ring-teal-500/30' : ''
            }`}
        >
            {/* Header (asa para arrastrar) */}
            <div
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                className={`flex touch-none items-center gap-2 border-b border-navy-800 px-3 py-2.5 ${
                    dragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
            >
                <GripHorizontal className="h-4 w-4 shrink-0 text-slate-500" />
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{name}</p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${badge.cls}`}>
                    {badge.text}
                </span>
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setCollapsed((v) => !v)}
                    aria-label={collapsed ? 'Expandir' : 'Colapsar'}
                    className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-navy-800 hover:text-white"
                >
                    {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
                <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={onClose}
                    aria-label="Cerrar"
                    className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-navy-800 hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {!collapsed && (
                <>
                    {/* Main */}
                    <div className="space-y-3 px-3 py-3">
                        <div className="space-y-1.5">
                            <Row label="País" value={hierarchy.country ?? ''} />
                            <Row label="Estado" value={hierarchy.state ?? ''} />
                            <Row label="Ciudad" value={hierarchy.city ?? ''} />
                            <Row label="Barrio" value={name} />
                        </div>

                        <div className="space-y-1.5 border-t border-navy-800 pt-3">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                                <MapPin className="h-3.5 w-3.5" /> Límite
                            </div>
                            <Row label="Centroide" value={lat != null && lng != null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : ''} />
                            <Row label="Geometría" value={polygon?.type ?? 'Sin límite'} />
                            <Row label="Vértices" value={polygon ? String(vertices) : ''} />
                            <Row label="Área aprox." value={polygon ? `${area.toFixed(2)} km²` : ''} />
                            {polygon && (
                                <button
                                    type="button"
                                    onClick={copyGeoJson}
                                    className="mt-1 inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-slate-400 hover:text-teal-300"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                    {copied ? 'Copiado' : 'Copiar GeoJSON'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="space-y-2 border-t border-navy-800 px-3 py-3">
                        {!canSubmit && disabledReason && (
                            <p className="text-[11px] text-amber-300">{disabledReason}</p>
                        )}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={!canSubmit}
                                onClick={onSubmit}
                                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-bold text-navy-950 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {operated ? 'Guardar límite' : 'Dar de alta'}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="cursor-pointer rounded-xl border border-navy-700 bg-navy-800 px-3 py-2.5 text-xs text-slate-300 transition-colors hover:bg-navy-700 hover:text-white"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}