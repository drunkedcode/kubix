export interface TerritorySummary {
  slug: string;
  name: string;
  businessCount: number;
}

interface RankingBarsProps {
  territories: TerritorySummary[];
}

const GRID_STEPS = [0.25, 0.5, 0.75, 1];

export default function RankingBars({ territories }: RankingBarsProps) {
  const sorted = [...territories].sort((a, b) => b.businessCount - a.businessCount);
  const max = Math.max(1, ...sorted.map((t) => t.businessCount));

  return (
    <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
      {sorted.map((t) => {
        const pct = (t.businessCount / max) * 100;
        return (
          <div key={t.slug} className="group flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-muted" title={t.name}>
              {t.name}
            </span>
            <div className="relative h-5 flex-1 rounded-sm bg-surface-2">
              {GRID_STEPS.map((step) => (
                <div key={step} className="absolute inset-y-0 w-px bg-line" style={{ left: `${step * 100}%` }} />
              ))}
              <div
                className="h-full bg-brand transition-[width] duration-300 group-hover:bg-brand-hover"
                style={{ width: `${pct}%`, borderRadius: "0 4px 4px 0" }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-fg">
              {t.businessCount}
            </span>
          </div>
        );
      })}
    </div>
  );
}