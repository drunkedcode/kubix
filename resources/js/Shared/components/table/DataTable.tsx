import type { ReactNode } from 'react';

export interface Column<T> {
    key: string;
    header: string;
    className?: string;
    cell: (row: T) => ReactNode;
}

/**
 * DataTable.tsx
 * Qué es:  tabla genérica: columnas declaradas y filas. No sabe de negocios ni de equipos.
 * Marco:   el borde y el pie (paginación) los pone quien la usa.
 */
interface DataTableProps<T> {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    emptyLabel?: string;
}

export default function DataTable<T>({
    columns,
    rows,
    rowKey,
    emptyLabel = 'Nada para mostrar',
}: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                    <tr className="text-xs font-semibold text-muted">
                        {columns.map((column) => (
                            <th key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                                {emptyLabel}
                            </td>
                        </tr>
                    )}
                    {rows.map((row) => (
                        <tr key={rowKey(row)} className="border-t border-line transition-colors hover:bg-surface-2">
                            {columns.map((column) => (
                                <td key={column.key} className={`px-4 py-3 ${column.className ?? ''}`}>
                                    {column.cell(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
