import { Link } from '@inertiajs/react';
import { Store } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';
import DataTable, { type Column } from '@/Shared/components/table/DataTable';
import { STATUS, type BusinessStatus } from '@/Pages/Business/Components/tables/BusinessesTable';

export interface LinkedBusiness {
  id: number;
  name: string;
  subtitle: string | null;
  category: string;
  status: BusinessStatus;
  registered: string | null;
}

/**
 * BusinessesTab.tsx (Equipes)
 * Qué es:  negocios que captó esta persona, con su estado y el enlace a cada uno.
 */
export default function BusinessesTab({ rows, territory }: { rows: LinkedBusiness[]; territory: string }) {
  const columns: Column<LinkedBusiness>[] = [
    {
      key: 'name',
      header: 'Negócio',
      cell: (b) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">{b.name}</p>
          {b.subtitle && <p className="text-xs text-muted">{b.subtitle}</p>}
        </div>
      ),
    },
    { key: 'category', header: 'Categoria', cell: (b) => <span className="text-fg">{b.category}</span> },
    {
      key: 'status',
      header: 'Status',
      cell: (b) => (
        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${STATUS[b.status].text}`}>
          <span className={`h-2 w-2 rounded-full ${STATUS[b.status].dot}`} />
          {STATUS[b.status].label}
        </span>
      ),
    },
    { key: 'registered', header: 'Cadastro', cell: (b) => <span className="text-muted">{b.registered ?? '—'}</span> },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (b) => (
        <Link
          href={route('businesses.show', { territory, business: b.id })}
          className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2"
        >
          Ver
        </Link>
      ),
    },
  ];

  return (
    <Card header={<CardTitle icon={Store} title="Negócios Vinculados" />}>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(b) => b.id}
        emptyLabel="Esta pessoa ainda não captou negócios neste bairro."
      />
    </Card>
  );
}
