export interface FinanceData {
  monthly_subscription: number;
  ad_spend_budget: number;
  commission_rate: string;
  total_billed_ytd: number;
  last_payment_status: string;
  last_payment_date: string;
  transactions: { id: number; concept: string; amount: number; status: string; date: string }[];
}

export default function FinanceTab({ data }: { data?: FinanceData }) {
  if (!data) return null;

  const stats = [
    { label: "Suscripción mensual", value: data.monthly_subscription.toFixed(2) },
    { label: "Presupuesto de tráfico", value: data.ad_spend_budget.toFixed(2) },
    { label: "Comisión", value: data.commission_rate },
    { label: "Facturado en el año", value: data.total_billed_ytd.toFixed(2) },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-navy-800 bg-navy-900 p-4">
            <p className="text-xs text-navy-400">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
        <h3 className="mb-1 text-sm font-medium text-navy-200">Movimientos</h3>
        <p className="mb-4 text-xs text-navy-500">
          Último pago: {data.last_payment_status} · {data.last_payment_date}
        </p>
        <ul className="space-y-2">
          {data.transactions.map((t) => (
            <li key={t.id} className="flex items-center justify-between text-xs">
              <span className="text-navy-200">{t.concept}</span>
              <span className="text-navy-400">
                {t.date} · {t.status} · {t.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}