import { BarChart3, Copy, Megaphone, Shield } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';
import MultiLineChart, { type ChartLine } from '@/Shared/components/metrics/charts/MultiLineChart';
import { toastSuccess } from '@/Shared/alerts';
import { brl } from './money';
import { STATUS, type BusinessStatus } from '../Components/tables/BusinessesTable';

export type OverviewData = {
  performance: { label: string; views: number; clicks: number; conversions: number }[];
  campaigns: { id: number; title: string; endsAt: string | null; price: number | null }[];
  access: {
    code: string;
    status: BusinessStatus;
    team: { name: string; role: string }[];
  };
};

const LINES: ChartLine[] = [
  { key: 'views', name: 'Visualizações', color: '#f59e0b' },
  { key: 'clicks', name: 'Cliques', color: '#334155' },
  { key: 'conversions', name: 'Conversões', color: '#8b5cf6' },
];

const ROLE_LABEL: Record<string, string> = { owner: 'Proprietário' };

export default function OverviewTab({ data }: { data: OverviewData }) {
  const status = STATUS[data.access.status];

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.access.code);
      toastSuccess('Código copiado');
    } catch {
      // Sin permiso de portapapeles: el código sigue visible para copiarlo a mano.
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
      <Card header={<CardTitle icon={BarChart3} title="Desempenho" />}>
        <MultiLineChart points={data.performance} lines={LINES} />
      </Card>

      <Card header={<CardTitle icon={Megaphone} title="Campanhas Ativas" />}>
        {data.campaigns.length === 0 ? (
          <p className="text-sm text-muted">Este negócio ainda não tem campanhas ativas.</p>
        ) : (
          <ul className="space-y-3">
            {data.campaigns.map((campaign) => (
              <li key={campaign.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-fg">{campaign.title}</span>
                  <span className="block text-xs text-muted">
                    {campaign.endsAt ? `Até ${campaign.endsAt}` : 'Sem data de término'}
                  </span>
                </span>
                {campaign.price !== null && (
                  <span className="shrink-0 font-semibold text-fg">{brl(campaign.price / 100)}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card
        header={
          <CardTitle
            icon={Shield}
            title="Permissões e Acesso"
            action={
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${status.text}`}>
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            }
          />
        }
      >
        <p className="text-sm font-medium text-fg">Código do Negócio</p>
        <div className="mt-1 flex items-center justify-between rounded-lg border border-line bg-surface-2 px-3 py-2">
          <span className="font-mono text-sm text-fg">{data.access.code}</span>
          <button
            type="button"
            onClick={copyCode}
            aria-label="Copiar código"
            className="cursor-pointer rounded-md p-1 text-muted transition-colors hover:text-brand-text"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-sm font-medium text-fg">Responsáveis</p>
        {data.access.team.length === 0 ? (
          <p className="mt-1 text-sm text-muted">Nenhuma pessoa vinculada.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {data.access.team.map((person) => (
              <li key={`${person.role}-${person.name}`} className="flex items-center justify-between text-sm">
                <span className="truncate text-fg">{person.name}</span>
                <span className="rounded-full bg-surface-2 px-3 py-0.5 text-xs font-medium text-muted">
                  {ROLE_LABEL[person.role] ?? person.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
