import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export interface ChartLine {
    key: string;
    name: string;
    color: string;
    /** 'right' = eje propio (oculto), para series de otra escala. */
    axis?: 'left' | 'right';
}

/**
 * MultiLineChart.tsx
 * Qué es:  gráfico de varias líneas sobre el eje X de los puntos (clave "label" por defecto).
 * Marco:   quien lo usa pone la tarjeta y el título.
 */
interface MultiLineChartProps {
    points: Record<string, string | number>[];
    lines: ChartLine[];
    xKey?: string;
    height?: number;
}

const thousands = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));

export default function MultiLineChart({ points, lines, xKey = 'label', height = 256 }: MultiLineChartProps) {
    const hasRight = lines.some((line) => line.axis === 'right');

    return (
        <div className="w-full" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <CartesianGrid stroke="var(--line)" vertical={false} />
                    <XAxis
                        dataKey={xKey}
                        tick={{ fill: 'var(--muted)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        yAxisId="left"
                        tick={{ fill: 'var(--muted)', fontSize: 12 }}
                        tickFormatter={thousands}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                    />
                    {hasRight && <YAxis yAxisId="right" orientation="right" hide />}
                    <Tooltip
                        contentStyle={{
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            borderRadius: 8,
                            color: 'var(--fg)',
                            fontSize: 12,
                        }}
                    />
                    <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    {lines.map((line) => (
                        <Line
                            key={line.key}
                            yAxisId={line.axis ?? 'left'}
                            type="monotone"
                            dataKey={line.key}
                            name={line.name}
                            stroke={line.color}
                            strokeWidth={2}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
