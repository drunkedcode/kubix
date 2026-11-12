import { Link } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';
import DataTable, { type Column } from '@/Shared/components/table/DataTable';

export interface ProductivityRow {
    id: number;
    name: string;
    roleLabel: string;
    captured: number;
    active: number;
    resolved: number;
    actions: number;
}

interface ProductivityTabProps {
    rows: ProductivityRow[];
    /** Slug del barrio, para armar la ruta de cada persona. */
    territory: string;
}

/** De los negocios que captó, cuántos terminaron activos (pagaron el onboarding). */
const conversion = (row: ProductivityRow) => (row.captured > 0 ? `${Math.round((row.active / row.captured) * 100)}%` : '—');

/**
 * ProductivityTab.tsx
 * Qué es:  pestaña Produtividade de Equipes: lo que hizo cada persona en este barrio
 *          (negocios captados y activos, conversión, reclamaciones resueltas y acciones).
 */
export default function ProductivityTab({ rows, territory }: ProductivityTabProps) {
    const columns: Column<ProductivityRow>[] = [
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
        { key: 'captured', header: 'Captados', className: 'text-right', cell: (r) => <span className="font-medium text-fg">{r.captured}</span> },
        { key: 'active', header: 'Ativos', className: 'text-right', cell: (r) => <span className="text-fg">{r.active}</span> },
        { key: 'conversion', header: 'Conversão', className: 'text-right', cell: (r) => <span className="text-muted">{conversion(r)}</span> },
        { key: 'resolved', header: 'Reclamações resolvidas', className: 'text-right', cell: (r) => <span className="text-fg">{r.resolved}</span> },
        { key: 'actions', header: 'Ações', className: 'text-right', cell: (r) => <span className="text-muted">{r.actions}</span> },
    ];

    return (
        <Card header={<CardTitle icon={TrendingUp} title="Produtividade da Equipe" />}>
            <DataTable
                columns={columns}
                rows={rows}
                rowKey={(r) => r.id}
                emptyLabel="Ainda não há pessoas na equipe deste território."
            />
        </Card>
    );
}
