import { Megaphone } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';

export interface AdsData {
  campaigns: { id: number; name: string; status: string; impressions: number; clicks: number }[];
}

const STATUS_DOT: Record<string, string> = {
  Ativa: 'bg-green-500',
  Pausada: 'bg-amber-500',
  Pendente: 'bg-amber-500',
  Rascunho: 'bg-muted',
  Encerrada: 'bg-muted',
};

/**
 * AdsTab.tsx
 * Qué es:  pestaña Campanhas: tabla de las campañas del negocio.
 */
export default function AdsTab({ data }: { data?: AdsData }) {
  if (!data) return null;

  return (
    <Card header={<CardTitle icon={Megaphone} title="Campanhas" />}>
      {data.campaigns.length === 0 ? (
        <p className="text-sm text-muted">Este negócio ainda não tem campanhas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-muted">
                <th className="py-2 font-medium">Campanha</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 text-right font-medium">Impressões</th>
                <th className="py-2 text-right font-medium">Cliques</th>
              </tr>
            </thead>
            <tbody>
              {data.campaigns.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-0">
                  <td className="py-3 text-fg">{c.name}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1.5 text-fg">
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[c.status] ?? 'bg-muted'}`} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 text-right text-muted">{c.impressions.toLocaleString('pt-BR')}</td>
                  <td className="py-3 text-right text-muted">{c.clicks.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
