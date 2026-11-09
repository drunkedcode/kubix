import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import TrendSparkline from '@/Shared/components/metrics/sparklines/TrendSparkline';

type Tone = 'teal' | 'rose' | 'amber' | 'orange' | 'blue' | 'purple' | 'green';

export interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    tone?: Tone;
    trend?: number;
    /** Texto junto a la tendencia; solo se muestra si se pasa. */
    trendLabel?: string;
    /** Serie corta para el mini gráfico de la derecha. */
    spark?: number[];
    className?: string;
}

const TONES: Record<Tone, string> = {
    teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    amber: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
    orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-300',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-300',
    green: 'bg-green-500/10 text-green-600 dark:text-green-300',
};

const SPARK: Record<Tone, string> = {
    teal: '#14b8a6',
    rose: '#f43f5e',
    amber: '#fbbf24',
    orange: '#f97316',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    green: '#22c55e',
};

export default function StatCard({
    label,
    value,
    icon: Icon,
    tone = 'teal',
    trend,
    trendLabel,
    spark,
    className = '',
}: StatCardProps) {
    const formatted = typeof value === 'number' ? value.toLocaleString('es-AR') : value;
    const isUp = (trend ?? 0) >= 0;

    return (
        <div
            className={`flex items-center gap-4 rounded-xl border border-line bg-surface p-4 ${className}`}
        >
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${TONES[tone]}`}
            >
                <Icon className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">{label}</p>
                <p className="mt-0.5 text-2xl font-bold leading-tight text-fg">{formatted}</p>
                {trend !== undefined && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                        <span
                            className={`flex items-center font-semibold ${
                                isUp ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                        >
                            {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {isUp ? '+' : '-'}
                            {Math.abs(trend)}%
                        </span>
                        {trendLabel}
                    </p>
                )}
            </div>

            {spark && spark.length > 1 && (
                <TrendSparkline data={spark} color={SPARK[tone]} height={48} width={96} className="shrink-0" />
            )}
        </div>
    );
}
