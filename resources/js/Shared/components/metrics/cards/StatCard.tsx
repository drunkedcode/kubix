import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp } from 'lucide-react';

type Tone = 'teal' | 'rose' | 'amber' | 'orange';

interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    tone?: Tone;
    trend?: number;
    trendLabel?: string;
    className?: string;
}

const TONES: Record<Tone, string> = {
    teal: 'bg-teal-500/10 text-teal-700 dark:text-teal-300',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
};

export default function StatCard({
    label,
    value,
    icon: Icon,
    tone = 'teal',
    trend,
    trendLabel = 'vs. último análisis',
    className = '',
}: StatCardProps) {
    const formatted = typeof value === 'number' ? value.toLocaleString('es-AR') : value;
    const isUp = (trend ?? 0) >= 0;

    return (
        <div
            className={`flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 ${className}`}
        >
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${TONES[tone]}`}
            >
                <Icon className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-muted">{label}</p>
                <p className="mt-0.5 text-xl font-bold leading-tight text-fg">{formatted}</p>
                {trend !== undefined && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                        <span
                            className={`flex items-center font-semibold ${
                                isUp ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                        >
                            {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(trend)}%
                        </span>
                        {trendLabel}
                    </p>
                )}
            </div>
        </div>
    );
}