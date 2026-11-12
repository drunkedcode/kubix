import { CalendarDays, Megaphone, Receipt, Wallet } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';
import StatCard from '@/Shared/components/metrics/cards/StatCard';
import { brl } from './money';

export interface FinanceData {
  totals: { total: number; onboarding: number; daily: number; promotion: number };
  lastPaymentDate: string | null;
  transactions: { id: number; concept: string; amount: number; status: string; date: string }[];
}

/**
 * FinanceTab.tsx
 * Qué es:  pestaña Financeiro del negocio: lo cobrado por concepto y el historial de pagos.
 */
export default function FinanceTab({ data }: { data?: FinanceData }) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total pago" value={brl(data.totals.total)} icon={Wallet} tone="teal" />
        <StatCard label="Adesão" value={brl(data.totals.onboarding)} icon={Receipt} tone="green" />
        <StatCard label="Diárias" value={brl(data.totals.daily)} icon={CalendarDays} tone="amber" />
        <StatCard label="Promoções" value={brl(data.totals.promotion)} icon={Megaphone} tone="purple" />
      </div>

      <Card header={<CardTitle icon={Receipt} title="Movimentações" />}>
        <p className="mb-3 text-xs text-muted">
          {data.lastPaymentDate ? `Último pagamento: ${data.lastPaymentDate}` : 'Nenhum pagamento registrado.'}
        </p>
        {data.transactions.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase text-muted">
                  <th className="py-2 font-medium">Descrição</th>
                  <th className="py-2 font-medium">Data</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((t) => (
                  <tr key={t.id} className="border-b border-line last:border-0">
                    <td className="py-3 text-fg">{t.concept}</td>
                    <td className="py-3 text-muted">{t.date}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-surface-2 px-3 py-0.5 text-xs font-medium text-fg">{t.status}</span>
                    </td>
                    <td className="py-3 text-right font-medium text-fg">{brl(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
