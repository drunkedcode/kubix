/**
 * businessStatus.ts
 * Qué es:          única fuente de verdad del estado de cobro de un negocio.
 * Responsabilidad: definir cada estado con su etiqueta, color y símbolo.
 * Quién lo usa:    (a migrar) mapa vía el padre, BusinessesTable, StatusFilter,
 *                  BusinessHeader. Hoy cada uno tiene su copia.
 * Qué NO hace:     no calcula el estado (lo deriva el backend desde vencimientos).
 * Para cambiar:    agregar un estado = una línea aquí + su tipo en BusinessStatus.
 */
export type BusinessStatus = 'active' | 'expiring' | 'overdue' | 'trial';

export const BUSINESS_STATUS: Record<
    BusinessStatus,
    { label: string; color: string; glyph: string }
> = {
    active: { label: 'Activo', color: '#2dd4bf', glyph: '✓' },
    expiring: { label: 'Por vencer', color: '#facc15', glyph: '…' },
    overdue: { label: 'Vencido', color: '#f43f5e', glyph: '!' },
    trial: { label: 'En prueba', color: '#38bdf8', glyph: '★' },
};