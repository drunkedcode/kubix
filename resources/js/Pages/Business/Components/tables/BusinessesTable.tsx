import { ChevronRight } from 'lucide-react';

type BusinessStatus = 'active' | 'expiring' | 'overdue' | 'trial' | 'inactive';

export interface BusinessRow {
    id: number | string;
    name: string;
    location: string;
    avatarColor?: string;
    category: string;
    status: BusinessStatus;
    dueLabel: string;
}

interface BusinessesTableProps {
    rows: BusinessRow[];
    onRowClick?: (row: BusinessRow) => void;
    emptyLabel?: string;
    className?: string;
}

const STATUS = {
    active: { label: 'Activo', cls: 'bg-teal-400/15 text-teal-300', dot: 'bg-teal-400' },
    expiring: { label: 'Por vencer', cls: 'bg-yellow-400/15 text-yellow-300', dot: 'bg-yellow-400' },
    overdue: { label: 'Vencido', cls: 'bg-rose-400/15 text-rose-300', dot: 'bg-rose-400' },
    trial: { label: 'En prueba', cls: 'bg-sky-400/15 text-sky-300', dot: 'bg-sky-400' },
    inactive: { label: 'Inactivo', cls: 'bg-slate-500/15 text-slate-300', dot: 'bg-slate-400' },
} as const;

export default function BusinessesTable({
    rows,
    onRowClick,
    emptyLabel = 'No hay negocios para mostrar',
    className = '',
}: BusinessesTableProps) {
    return (
        <div className={`overflow-x-auto rounded-lg border border-navy-800 ${className}`}>
            <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-navy-950/60 text-slate-300">
                    <tr>
                        {['Empresa', 'Rubro', 'Estado', 'Vence / Último pago'].map((h) => (
                            <th key={h} className="px-4 py-3 font-medium">{h}</th>
                        ))}
                        <th className="w-8" />
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                {emptyLabel}
                            </td>
                        </tr>
                    )}
                    {rows.map((row) => {
                        const st = STATUS[row.status];
                        return (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick?.(row)}
                                className="cursor-pointer border-t border-navy-800 transition-colors hover:bg-navy-800/40"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${row.avatarColor ?? 'bg-navy-700'}`}
                                        >
                                            {row.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-white">{row.name}</p>
                                            <p className="truncate text-xs text-slate-400">{row.location}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-slate-200">{row.category}</td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${st.cls}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                                        {st.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-slate-300">{row.dueLabel}</td>
                                <td className="px-2">
                                    <ChevronRight className="h-4 w-4 text-slate-500" />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}