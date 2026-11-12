import { BarChart3, Eye, MousePointerClick, Percent, ShoppingCart } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';
import StatCard from '@/Shared/components/metrics/cards/StatCard';
import MultiLineChart, { type ChartLine } from '@/Shared/components/metrics/charts/MultiLineChart';

export interface TrafficData {
  views: number;
  clicks: number;
  conversions: number;
  ctr: string;
  series: { label: string; views: number; clicks: number }[];
}

// Cliques van en su propio eje (oculto): son muchos menos que las visualizações.
const LINES: ChartLine[] = [
  { key: 'views', name: 'Visualizações', color: '#f59e0b' },
  { key: 'clicks', name: 'Cliques', color: '#6366f1', axis: 'right' },
];

/**
 * TrafficTab.tsx
 * Qué es:  pestaña Tráfego: uso del negocio en los últimos 28 días y su evolución semanal.
 */
export default function TrafficTab({ data }: { data?: TrafficData }) {
  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Visualizações (28 dias)" value={data.views.toLocaleString('pt-BR')} icon={Eye} tone="blue" />
        <StatCard label="Cliques (28 dias)" value={data.clicks.toLocaleString('pt-BR')} icon={MousePointerClick} tone="purple" />
        <StatCard label="CTR" value={data.ctr} icon={Percent} tone="orange" />
        <StatCard label="Conversões (28 dias)" value={data.conversions.toLocaleString('pt-BR')} icon={ShoppingCart} tone="green" />
      </div>

      <Card header={<CardTitle icon={BarChart3} title="Evolução do Tráfego" />}>
        <MultiLineChart points={data.series} lines={LINES} />
      </Card>
    </div>
  );
}
