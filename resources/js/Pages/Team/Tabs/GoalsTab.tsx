import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Target } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';
import DataTable, { type Column } from '@/Shared/components/table/DataTable';

export interface GoalRow {
    id: number;
    name: string;
    roleLabel: string;
    target: number | null;
    progress: number;
    previous: { target: number | null; progress: number };
}

export interface GoalsData {
    month: string;
    previousMonth: string;
    rows: GoalRow[];
}

interface GoalsTabProps {
    data: GoalsData;
    canManage: boolean;
    /** Slug del barrio, para armar las rutas. */
    territory: string;
}

const field =
    'w-20 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg focus:border-brand focus:outline-none';

function GoalForm({ row, territory }: { row: GoalRow; territory: string }) {
    const [value, setValue] = useState(row.target?.toString() ?? '');
    const unchanged = value === '' || Number(value) === row.target;

    const save = () =>
        router.post(route('team.goal.update', { territory, user: row.id }), { target: Number(value) }, { preserveScroll: true });

    return (
        <div className="flex items-center justify-end gap-2">
            <input type="number" min={0} max={1000} value={value} onChange={(e) => setValue(e.target.value)} className={field} />
            <button
                type="button"
                onClick={save}
                disabled={unchanged}
                className="cursor-pointer rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
                Salvar
            </button>
        </div>
    );
}

function Progress({ target, progress }: { target: number | null; progress: number }) {
    if (target === null) {
        return <span className="text-sm text-muted">Sem meta · {progress} captados</span>;
    }

    const pct = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 100;

    return (
        <div className="min-w-[160px]">
            <p className="mb-1 text-sm text-fg">
                {progress} de {target} <span className="text-muted">({pct}%)</span>
            </p>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-brand'}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

/**
 * GoalsTab.tsx
 * Qué es:  pestaña Metas de Equipes: la meta de captación de negocios de cada promotor este mes,
 *          su avance real y el resultado del mes anterior. Quien puede gestionar el equipo la fija.
 */
export default function GoalsTab({ data, canManage, territory }: GoalsTabProps) {
    const columns: Column<GoalRow>[] = [
        {
            key: 'member',
            header: 'Membro',
            cell: (r) => (
                <div className="min-w-0">
                    <Link
                        href={route('team.show', { territory, user: r.id })}
                        className="block truncate font-semibold text-fg transition-colors hover:text-brand-text"
                    >
                        {r.name}
                    </Link>
                    <p className="truncate text-xs text-muted">{r.roleLabel}</p>
                </div>
            ),
        },
        { key: 'progress', header: `Meta de ${data.month}`, cell: (r) => <Progress target={r.target} progress={r.progress} /> },
        {
            key: 'previous',
            header: data.previousMonth,
            className: 'text-right',
            cell: (r) => (
                <span className="text-sm text-muted">
                    {r.previous.target === null ? `${r.previous.progress} captados` : `${r.previous.progress} de ${r.previous.target}`}
                </span>
            ),
        },
        ...(canManage
            ? [{ key: 'set', header: 'Definir meta', className: 'text-right', cell: (r: GoalRow) => <GoalForm key={`${r.id}-${r.target}`} row={r} territory={territory} /> }]
            : []),
    ];

    return (
        <Card header={<CardTitle icon={Target} title={`Metas de captação · ${data.month}`} />}>
            <DataTable
                columns={columns}
                rows={data.rows}
                rowKey={(r) => r.id}
                emptyLabel="Ainda não há promotores neste território."
            />
        </Card>
    );
}
