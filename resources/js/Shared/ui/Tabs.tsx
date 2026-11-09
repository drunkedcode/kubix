import type { LucideIcon } from 'lucide-react';

export interface TabItem<K extends string = string> {
    key: K;
    label: string;
    icon: LucideIcon;
}

interface TabsProps<K extends string = string> {
    tabs: TabItem<K>[];
    active: K;
    onChange: (key: K) => void;
    className?: string;
}

/** Pestañas en píldora: la activa va en el color de la marca. */
export default function Tabs<K extends string = string>({
    tabs,
    active,
    onChange,
    className = '',
}: TabsProps<K>) {
    return (
        <div
            role="tablist"
            className={`flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full bg-surface-2 p-1.5 ${className}`}
        >
            {tabs.map(({ key, label, icon: Icon }) => {
                const isActive = active === key;
                return (
                    <button
                        key={key}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(key)}
                        className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                            isActive
                                ? 'bg-brand text-brand-fg shadow-sm'
                                : 'text-muted hover:text-fg'
                        }`}
                    >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="whitespace-nowrap">{label}</span>
                    </button>
                );
            })}
        </div>
    );
}
