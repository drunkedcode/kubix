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

export default function Tabs<K extends string = string>({
    tabs,
    active,
    onChange,
    className = '',
}: TabsProps<K>) {
    return (
        <div
            role="tablist"
            className={`flex items-center gap-1 overflow-x-auto overflow-y-hidden border-b border-line ${className}`}
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
                        className={`-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                            isActive
                                ? 'border-brand text-brand'
                                : 'border-transparent text-muted hover:text-fg'
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