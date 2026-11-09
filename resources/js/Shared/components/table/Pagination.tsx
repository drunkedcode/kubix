import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PageMeta {
    current: number;
    last: number;
    total: number;
    from: number | null;
    to: number | null;
}

/** Pie de tabla: "Mostrando 1–5 de 248 ..." y números de página (ventana de 5 alrededor de la actual). */
interface PaginationProps {
    page: PageMeta;
    /** Lo que se cuenta, en plural: "negócios", "membros". */
    noun: string;
    onChange: (page: number) => void;
}

const BUTTON = 'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm transition-colors';

export default function Pagination({ page, noun, onChange }: PaginationProps) {
    const first = Math.max(1, page.current - 2);
    const last = Math.min(page.last, page.current + 2);
    const numbers = Array.from({ length: last - first + 1 }, (_, i) => first + i);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-muted">
            <span>
                {page.total === 0
                    ? 'Nenhum resultado'
                    : `Mostrando ${page.from}–${page.to} de ${page.total.toLocaleString('pt-BR')} ${noun}`}
            </span>

            {page.last > 1 && (
                <nav className="flex items-center gap-1" aria-label="Paginação">
                    <button
                        type="button"
                        aria-label="Página anterior"
                        disabled={page.current === 1}
                        onClick={() => onChange(page.current - 1)}
                        className={`${BUTTON} cursor-pointer hover:bg-surface-2 disabled:cursor-default disabled:opacity-40`}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    {numbers.map((n) => (
                        <button
                            key={n}
                            type="button"
                            aria-current={n === page.current ? 'page' : undefined}
                            onClick={() => onChange(n)}
                            className={`${BUTTON} cursor-pointer ${
                                n === page.current
                                    ? 'bg-brand font-semibold text-brand-fg'
                                    : 'hover:bg-surface-2'
                            }`}
                        >
                            {n}
                        </button>
                    ))}

                    <button
                        type="button"
                        aria-label="Próxima página"
                        disabled={page.current === page.last}
                        onClick={() => onChange(page.current + 1)}
                        className={`${BUTTON} cursor-pointer hover:bg-surface-2 disabled:cursor-default disabled:opacity-40`}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </nav>
            )}
        </div>
    );
}
