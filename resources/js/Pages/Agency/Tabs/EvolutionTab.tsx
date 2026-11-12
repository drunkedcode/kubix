import { Store, TrendingUp } from "lucide-react";
import Card from "@/Shared/components/card/Card";
import CardTitle from "@/Shared/components/card/CardTitle";
import MultiLineChart, { type ChartLine } from "@/Shared/components/metrics/charts/MultiLineChart";

export type TrendPoint = { label: string; count: number };

export interface TrendSummary {
  total: number;
  delta: number;
}

export interface RecentBusiness {
  id: number;
  name: string;
  date: string;
}

export interface EvolutionData {
  trend: TrendPoint[];
  summary?: TrendSummary;
  recent?: RecentBusiness[];
}

const LINES: ChartLine[] = [{ key: "count", name: "Negócios cadastrados", color: "#f59e0b" }];

/**
 * EvolutionTab.tsx
 * Qué es:  pestaña Evolução de Agência: crecimiento acumulado de negocios y las últimas altas.
 */
export default function EvolutionTab({ data }: { data: EvolutionData }) {
  const delta = data.summary?.delta ?? 0;
  const deltaColor = delta > 0 ? "text-green-600 dark:text-green-400" : delta < 0 ? "text-rose-500" : "text-muted";
  const deltaSign = delta > 0 ? "+" : "";

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card header={<CardTitle icon={TrendingUp} title="Evolução de Negócios" />}>
        {data.summary && (
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-fg">{data.summary.total}</span>
            <span className={`text-sm font-medium ${deltaColor}`}>
              {deltaSign}
              {delta} nas últimas {data.trend.length} semanas
            </span>
          </div>
        )}

        <MultiLineChart points={data.trend} lines={LINES} xKey="label" />
      </Card>

      <Card header={<CardTitle icon={Store} title="Negócios Recentes" />}>
        {!data.recent || data.recent.length === 0 ? (
          <p className="text-sm text-muted">Ainda não há negócios neste bairro.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.recent.map((business) => (
              <li key={business.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-text">
                  {business.name.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{business.name}</span>
                <span className="shrink-0 text-xs text-muted">{business.date}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
