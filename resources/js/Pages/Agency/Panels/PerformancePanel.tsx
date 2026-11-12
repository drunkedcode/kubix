import { BarChart3 } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';
import MultiLineChart, { type ChartLine } from '@/Shared/components/metrics/charts/MultiLineChart';

export type PerformancePoint = {
    label: string;
    engagement: number;
    conversions: number;
    businesses: number;
};

interface PerformancePanelProps {
    points: PerformancePoint[];
    className?: string;
}

// Conversões y Negócios van sobre su propio eje (oculto): son pocos y quedarían pegados al cero.
const LINES: ChartLine[] = [
    { key: 'engagement', name: 'Engajamento', color: '#f59e0b' },
    { key: 'conversions', name: 'Conversões', color: '#6366f1', axis: 'right' },
    { key: 'businesses', name: 'Novos Negócios', color: '#22c55e', axis: 'right' },
];

export default function PerformancePanel({ points, className }: PerformancePanelProps) {
    return (
        <Card className={className} header={<CardTitle icon={BarChart3} title="Performance da Agência" />}>
            <MultiLineChart points={points} lines={LINES} />
        </Card>
    );
}
