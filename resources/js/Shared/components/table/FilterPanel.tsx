import type { ReactNode } from 'react';
import { Filter } from 'lucide-react';

/** Panel lateral de filtros: los campos llegan como children; "Aplicar" lo decide quien lo usa. */
interface FilterPanelProps {
    children: ReactNode;
    onApply: () => void;
    title?: string;
}

export default function FilterPanel({ children, onApply, title = 'Filtros' }: FilterPanelProps) {
    return (
        <aside className="rounded-xl border border-line bg-surface p-4">
            <h3 className="text-base font-semibold text-fg">{title}</h3>
            <div className="mt-3 space-y-4">{children}</div>
            <button
                type="button"
                onClick={onApply}
                className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
            >
                <Filter className="h-4 w-4" />
                Aplicar filtros
            </button>
        </aside>
    );
}
