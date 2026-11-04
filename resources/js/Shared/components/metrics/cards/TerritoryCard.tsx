// resources/js/Shared/components/metrics/cards/TerritoryCard.tsx
import TrendSparkline from '../sparklines/TrendSparkline';

export interface TerritoryCardData {
  name: string;
  status: 'active' | 'warning' | 'critical';
  metrics: {
    companies: { value: number; change: number };
    revenue: { value: number; change: number };
    occupancy: { value: number; change: number };
  };
  workdays: { total: number; completed: number };
  sparkline: number[];
}

interface TerritoryCardProps {
  data: TerritoryCardData;
  onViewDetails?: () => void;
  className?: string;
}

const statusConfig = {
  active: { label: 'Ativo', color: '#3B82F6', textClass: 'text-blue-400' },
  warning: { label: 'Alerta', color: '#F59E0B', textClass: 'text-amber-400' },
  critical: { label: 'Crítico', color: '#EF4444', textClass: 'text-red-400' },
};

function formatChange(value: number) {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value}%`;
}

export default function TerritoryCard({
  data,
  onViewDetails,
  className = '',
}: TerritoryCardProps) {
  const { name, status, metrics, workdays, sparkline } = data;
  const config = statusConfig[status];
  const completionPercent = workdays.total > 0
    ? Math.round((workdays.completed / workdays.total) * 100)
    : 0;

  return (
    <div
      className={`rounded-xl border border-navy-800 bg-navy-900 p-4 ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold text-white">{name}</h3>
          <p className={`text-xs flex items-center gap-1 mt-0.5 ${config.textClass}`}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
            {config.label}
          </p>
        </div>
        <button
          type="button"
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Más opciones"
        >
          ⋮
        </button>
      </div>

      <div className="mb-2">
        <TrendSparkline data={sparkline} color={config.color} height={36} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <p className="text-[10px] text-slate-400">Negocios</p>
          <p className="text-sm font-semibold text-white">{metrics.companies.value}</p>
          <p className={`text-[10px] ${metrics.companies.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatChange(metrics.companies.change)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">Plata</p>
          <p className="text-sm font-semibold text-white">{metrics.revenue.value}</p>
          <p className={`text-[10px] ${metrics.revenue.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatChange(metrics.revenue.change)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">Ocup.</p>
          <p className="text-sm font-semibold text-white">{metrics.occupancy.value}%</p>
          <p className={`text-[10px] ${metrics.occupancy.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatChange(metrics.occupancy.change)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400">Jornadas</p>
          <p className="text-sm font-semibold text-white">{workdays.total}</p>
        </div>

        <div className="relative w-12 h-12">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#1e293b" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15" fill="none" stroke={config.color} strokeWidth="3"
              strokeDasharray={`${completionPercent} 100`} strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-white">{completionPercent}%</span>
            <span className="text-[9px] text-slate-400">{workdays.completed}</span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-400">Completadas</p>
          <button
            type="button"
            onClick={onViewDetails}
            className="text-[10px] text-blue-400 hover:text-blue-300 mt-0.5"
          >
            Ver →
          </button>
        </div>
      </div>
    </div>
  );
}