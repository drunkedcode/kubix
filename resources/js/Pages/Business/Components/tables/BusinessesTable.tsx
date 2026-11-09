import { Link } from '@inertiajs/react';
import { Banknote, Eye } from 'lucide-react';
import DataTable, { type Column } from '@/Shared/components/table/DataTable';

export type BusinessStatus = 'active' | 'standby' | 'inactive';

export interface BusinessRow {
    id: number;
    name: string;
    subtitle: string | null;
    category: string;
    segment: string;
    status: BusinessStatus;
    registered: string | null;
}

interface BusinessesTableProps {
    rows: BusinessRow[];
    /** Slug del barrio, para armar la ruta del detalle. */
    territory: string;
    /** 'list' = lista general · 'approvals' = en análisis, con acción de registrar el pago. */
    mode?: 'list' | 'approvals';
    /** Precio del onboarding del barrio, en centavos (solo 'approvals'). */
    onboardingPrice?: number | null;
    onActivate?: (row: BusinessRow) => void;
}

export const formatBRL = (cents: number | null | undefined) =>
    cents == null ? '—' : (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const STATUS: Record<BusinessStatus, { label: string; dot: string; text: string }> = {
    active: { label: 'Ativo', dot: 'bg-green-500', text: 'text-green-700 dark:text-green-400' },
    standby: { label: 'Em análise', dot: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
    inactive: { label: 'Inativo', dot: 'bg-slate-400', text: 'text-muted' },
};

export const SEGMENT_PILL: Record<string, string> = {
    food: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
    beauty: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    legal: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
    health: 'bg-green-500/15 text-green-700 dark:text-green-300',
    retail: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
    other: 'bg-slate-500/15 text-slate-700 dark:text-slate-300',
};

export default function BusinessesTable({
    rows,
    territory,
    mode = 'list',
    onboardingPrice,
    onActivate,
}: BusinessesTableProps) {
    const business: Column<BusinessRow> = {
        key: 'business',
        header: 'Negócio',
        cell: (row) => (
            <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand-text">
                    {row.name.charAt(0)}
                </span>
                <div className="min-w-0">
                    <p className="truncate font-semibold text-fg">{row.name}</p>
                    <p className="truncate text-xs text-muted">{row.subtitle ?? '—'}</p>
                </div>
            </div>
        ),
    };

    const category: Column<BusinessRow> = {
        key: 'category',
        header: 'Categoria',
        cell: (row) => (
            <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    SEGMENT_PILL[row.segment] ?? SEGMENT_PILL.other
                }`}
            >
                {row.category}
            </span>
        ),
    };

    const view: Column<BusinessRow>['cell'] = (row) => (
        <Link
            href={route('businesses.show', { territory, business: row.id })}
            aria-label={`Ver ${row.name}`}
            title="Ver detalhes"
            className="inline-flex rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-brand-text"
        >
            <Eye className="h-4 w-4" />
        </Link>
    );

    const columns: Column<BusinessRow>[] =
        mode === 'approvals'
            ? [
                  business,
                  category,
                  { key: 'registered', header: 'Cadastro', className: 'text-muted', cell: (row) => row.registered ?? '—' },
                  { key: 'price', header: 'Onboarding', className: 'font-medium text-fg', cell: () => formatBRL(onboardingPrice) },
                  {
                      key: 'actions',
                      header: 'Ações',
                      cell: (row) => (
                          <div className="flex items-center gap-2">
                              {view(row)}
                              <button
                                  type="button"
                                  disabled={onboardingPrice == null}
                                  title={
                                      onboardingPrice == null
                                          ? 'Defina o preço do onboarding em Configurações da agência'
                                          : 'Registrar pagamento em dinheiro'
                                  }
                                  onClick={() => onActivate?.(row)}
                                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-brand-fg transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                  <Banknote className="h-3.5 w-3.5" />
                                  Registrar pagamento
                              </button>
                          </div>
                      ),
                  },
              ]
            : [
                  business,
                  category,
                  {
                      key: 'status',
                      header: 'Status',
                      cell: (row) => {
                          const status = STATUS[row.status];
                          return (
                              <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${status.text}`}>
                                  <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                                  {status.label}
                              </span>
                          );
                      },
                  },
                  // Sin datos todavía: llegan con las valoraciones y las analíticas.
                  { key: 'rating', header: 'Avaliação', className: 'text-muted', cell: () => '—' },
                  { key: 'views', header: 'Visualizações', className: 'text-muted', cell: () => '—' },
                  { key: 'actions', header: 'Ações', cell: view },
              ];

    return (
        <DataTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            emptyLabel={
                mode === 'approvals'
                    ? 'Nenhum negócio aguardando aprovação.'
                    : 'Nenhum negócio encontrado com esses filtros.'
            }
        />
    );
}
