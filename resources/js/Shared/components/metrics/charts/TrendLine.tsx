export interface TrendPoint {
  label: string;
  count: number;
}

interface TrendLineProps {
  points: TrendPoint[];
  height?: number;
}

export default function TrendLine({ points, height = 160 }: TrendLineProps) {
  const width = 600;
  const padding = { top: 12, right: 12, bottom: 24, left: 28 };
  const max = Math.max(1, ...points.map((p) => p.count));
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;

  const coords = points.map((p, i) => ({
    x: padding.left + stepX * i,
    y: padding.top + innerH - (p.count / max) * innerH,
    ...p,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
  const baseY = padding.top + innerH;
  const areaPath =
    coords.length > 1
      ? `${linePath} L${coords[coords.length - 1].x},${baseY} L${coords[0].x},${baseY} Z`
      : "";

  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
      {gridSteps.map((g) => {
        const y = padding.top + innerH - g * innerH;
        const value = Math.round(g * max);
        return (
          <g key={g}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#1e293b" strokeWidth={1} />
            <text x={0} y={y + 3} fontSize={8} fill="#64748b">
              {value}
            </text>
          </g>
        );
      })}

      {areaPath && <path d={areaPath} fill="#2dd4bf" opacity={0.1} />}

      {coords.length > 1 && (
        <path d={linePath} fill="none" stroke="#2dd4bf" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      )}

      {coords.map((c, i) => {
        const isLast = i === coords.length - 1;
        return (
          <g key={i}>
            <title>{`${c.label}: ${c.count}`}</title>
            {isLast && <circle cx={c.x} cy={c.y} r={4} fill="#2dd4bf" stroke="#0b1220" strokeWidth={2} />}
            <circle cx={c.x} cy={c.y} r={10} fill="transparent" />
            <text x={c.x} y={height - 6} textAnchor="middle" fontSize={9} fill="#64748b">
              {c.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}