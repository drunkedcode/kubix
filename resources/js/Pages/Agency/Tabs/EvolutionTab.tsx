import TrendLine, { type TrendPoint } from "@/Shared/components/metrics/charts/TrendLine";

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

interface EvolutionTabProps {
  data: EvolutionData;
}

export default function EvolutionTab({ data }: EvolutionTabProps) {
  const delta = data.summary?.delta ?? 0;
  const deltaColor = delta > 0 ? "text-teal-400" : delta < 0 ? "text-rose-400" : "text-navy-500";
  const deltaSign = delta > 0 ? "+" : "";

  return (
    <div className="space-y-4 p-2 sm:p-6">
      <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
        <h3 className="mb-1 text-sm font-medium text-navy-200">Negocios registrados (acumulado)</h3>

        {data.summary && (
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-white">{data.summary.total}</span>
            <span className={`text-xs font-medium ${deltaColor}`}>
              {deltaSign}{delta} en las últimas {data.trend.length} semanas
            </span>
          </div>
        )}

        <TrendLine points={data.trend} />
      </div>

      {data.recent && data.recent.length > 0 && (
        <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
          <h3 className="mb-1 text-sm font-medium text-navy-200">Negocios recientes</h3>
          <p className="mb-4 text-xs text-navy-500">Últimas altas en este barrio</p>
          <ul className="space-y-2">
            {data.recent.map((b) => (
              <li key={b.id} className="flex items-center justify-between text-xs">
                <span className="text-navy-200">{b.name}</span>
                <span className="text-navy-500">{b.date}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}