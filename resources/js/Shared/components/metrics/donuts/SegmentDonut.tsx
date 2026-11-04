// resources/js/Shared/components/metrics/donuts/SegmentDonut.tsx
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ArrowRight } from "lucide-react";

export interface DonutSegment {
  label: string;
  count: number;
  color?: string;
}

export interface SegmentDonutProps {
  segments: DonutSegment[];
  title?: string;
  centerLabel?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
  className?: string;
}

// Paleta por orden. Evita los colores de los pines (rojo, naranja, amarillo).
const DEFAULT_COLORS = [
  "#2dd4bf",
  "#a78bfa",
  "#38bdf8",
  "#e879f9",
  "#64748b",
  "#818cf8",
];

export default function SegmentDonut({
  segments,
  title = "Resumen por rubro",
  centerLabel = "empresas",
  viewAllLabel = "Ver todos",
  onViewAll,
  className = "",
}: SegmentDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.count, 0);
  const items = segments.map((s, i) => ({
    ...s,
    color: s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    percent: total > 0 ? Math.round((s.count / total) * 100) : 0,
  }));

  return (
    <section
      className={`rounded-xl border border-navy-800 bg-navy-900 p-5 ${className}`}
    >
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>

      <div className="flex items-center gap-4">
        <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                dataKey="count"
                nameKey="label"
                innerRadius="68%"
                outerRadius="100%"
                paddingAngle={items.length > 1 ? 2 : 0}
                stroke="none"
              >
                {items.map((item) => (
                  <Cell key={item.label} fill={item.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#111f36",
                  border: "1px solid #182a47",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white">
              {total.toLocaleString("es-AR")}
            </span>
            <span className="text-xs text-slate-400">{centerLabel}</span>
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-2">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: item.color }}
              />
              <span className="min-w-0 flex-1 truncate text-slate-200">
                {item.label}
              </span>
              <span className="font-medium text-white">
                {item.count.toLocaleString("es-AR")}
              </span>
              <span className="w-10 text-right text-xs text-slate-400">
                {item.percent}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-navy-800 hover:text-teal-300"
        >
          {viewAllLabel} <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}
