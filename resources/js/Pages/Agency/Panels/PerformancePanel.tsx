import { BarChart3 } from 'lucide-react';
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
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';

export interface PerformancePoint {
    label: string;
    engagement: number;
    users: number;
    businesses: number;
}

interface PerformancePanelProps {
    points: PerformancePoint[];
    className?: string;
}

const thousands = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v));

/** Negócios va sobre su propio eje (oculto): son pocos y quedarían pegados al cero. */
export default function PerformancePanel({ points, className }: PerformancePanelProps) {
    return (
        <Card className={className} header={<CardTitle icon={BarChart3} title="Performance da Agência" />}>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke="var(--line)" vertical={false} />
                        <XAxis
                            dataKey="label"
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
                        <YAxis yAxisId="right" orientation="right" hide />
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
                        <Line yAxisId="left" type="monotone" dataKey="engagement" name="Engajamento" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line yAxisId="left" type="monotone" dataKey="users" name="Novos Usuários" stroke="#6366f1" strokeWidth={2} dot={false} />
                        <Line yAxisId="right" type="monotone" dataKey="businesses" name="Novos Negócios" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
