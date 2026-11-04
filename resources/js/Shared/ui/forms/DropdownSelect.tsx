import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check } from 'lucide-react';

export interface DropdownOption {
    value: string;
    label: string;
}

interface DropdownSelectProps {
    options: DropdownOption[];
    value: string;
    onChange: (value: string) => void;
    trigger: ReactNode;
    ariaLabel: string;
    align?: 'left' | 'right';
    className?: string;
}

export default function DropdownSelect({
    options,
    value,
    onChange,
    trigger,
    ariaLabel,
    align = 'right',
    className = '',
}: DropdownSelectProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label={ariaLabel}
                aria-expanded={open}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-navy-800 px-3 py-2.5 text-sm text-slate-300 transition-colors hover:bg-navy-900 hover:text-teal-300"
            >
                {trigger}
            </button>

            {open && (
                <ul
                    role="listbox"
                    className={`absolute top-full z-20 mt-2 max-h-72 w-60 overflow-y-auto rounded-xl border border-navy-800 bg-navy-900 p-1.5 shadow-xl shadow-navy-950/50 ${
                        align === 'right' ? 'right-0' : 'left-0'
                    }`}
                >
                    {options.map((opt) => {
                        const selected = opt.value === value;
                        return (
                            <li key={opt.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={selected}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setOpen(false);
                                    }}
                                    className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                                        selected
                                            ? 'bg-teal-500/10 text-teal-300'
                                            : 'text-slate-300 hover:bg-teal-500/5 hover:text-teal-300'
                                    }`}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {selected && <Check className="h-4 w-4 shrink-0" />}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}