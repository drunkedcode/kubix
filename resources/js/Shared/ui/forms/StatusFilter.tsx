import type { LucideIcon } from 'lucide-react';

type Tone = 'green' | 'amber' | 'red' | 'blue';

export interface StatusFilterOption {
    value: string;
    label: string;
    tone: Tone;
    icon: LucideIcon;
    count?: number;
}

interface StatusFilterProps {
    options: StatusFilterOption[];
    value: string; // '' = Todos
    onChange: (value: string) => void;
    allLabel?: string;
    allCount?: number;
    className?: string;
}

const TONES: Record<Tone, { icon: string; active: string }> = {
    green: { icon: 'text-teal-600 dark:text-teal-400', active: 'border-teal-500/60 bg-teal-500/10' },
    amber: { icon: 'text-yellow-600 dark:text-yellow-400', active: 'border-yellow-500/60 bg-yellow-500/10' },
    red: { icon: 'text-rose-600 dark:text-rose-400', active: 'border-rose-500/60 bg-rose-500/10' },
    blue: { icon: 'text-sky-600 dark:text-sky-400', active: 'border-sky-500/60 bg-sky-500/10' },
};

export default function StatusFilter({
    options,
    value,
    onChange,
    allLabel = 'Todos',
    allCount,
    className = '',
}: StatusFilterProps) {
    return (
        <div className={`flex shrink-0 items-center gap-2 ${className}`} role="group">
            <button
                type="button"
                onClick={() => onChange('')}
                aria-pressed={value === ''}
                className={`flex h-[42px] cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors ${
                    value === ''
                        ? 'border-brand/50 bg-brand-soft text-brand-text'
                        : 'border-line text-muted hover:bg-surface-2'
                }`}
            >
                {allLabel}
                {allCount !== undefined && <span className="text-xs opacity-70">{allCount}</span>}
            </button>

            {options.map(({ value: v, label, tone, icon: Icon, count }) => {
                const selected = value === v;
                return (
                    <button
                        key={v}
                        type="button"
                        title={label}
                        aria-label={label}
                        aria-pressed={selected}
                        onClick={() => onChange(selected ? '' : v)}
                        className={`flex h-[42px] cursor-pointer items-center gap-1.5 rounded-lg border px-3 transition-colors ${
                            selected
                                ? TONES[tone].active
                                : 'border-transparent opacity-60 hover:bg-surface-2 hover:opacity-100'
                        }`}
                    >
                        <Icon className={`h-5 w-5 ${TONES[tone].icon}`} />
                        {count !== undefined && (
                            <span className="text-xs font-semibold text-fg">{count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}