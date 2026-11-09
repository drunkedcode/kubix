import { Bell, ChevronRight, Home, LogOut } from 'lucide-react';
import { Link } from '@inertiajs/react';
import ThemeToggle from './ThemeToggle';
import TerritoryFilterBar, {
    type Option,
    type TerritorySelection,
} from '../partials/TerritoryFilterBar.tsx';

export interface ScopeOption {
    value: string;
    label: string;
}

export type ScopeLevelType = 'country' | 'state' | 'city' | 'neighborhood';

export interface ScopeLevel {
    type: ScopeLevelType;
    selected: string | null;
    options: ScopeOption[];
}

/** Cascada País → Estado → Ciudad → Barrio que arma el backend según quién sos. */
export interface ScopeCascade {
    all?: 'platform' | 'overview' | null;
    levels?: ScopeLevel[];
}

/**
 * Header.tsx
 * Qué es:          barra superior oscura: inicio, migas de pan, selector de territorio,
 *                  tema, notificaciones y salir.
 * Qué NO hace:     no muestra el título de la página (lo hace PageHeader).
 */
interface HeaderProps {
    /** Migas de pan; la última es la página actual. */
    crumbs: string[];
    homeHref: string;
    notificationCount?: number;
    onNotificationsClick?: () => void;
    scope?: ScopeCascade | null;
    /** levelIndex = posición del nivel dentro de scope.levels; value '' = "Todos". */
    onCascadeChange?: (levelIndex: number, value: string) => void;
    onLogout?: () => void;
}

const ICON_BUTTON =
    'cursor-pointer rounded-xl border border-sidebar-line p-2.5 text-slate-300 transition-colors';

export default function Header({
    crumbs,
    homeHref,
    notificationCount = 0,
    onNotificationsClick,
    scope,
    onCascadeChange,
    onLogout,
}: HeaderProps) {
    const levels: ScopeLevel[] = Array.isArray(scope?.levels) ? scope!.levels! : [];

    const optionsOf = (type: ScopeLevelType): Option[] =>
        (levels.find((l) => l.type === type)?.options ?? []).map((o) => ({ ...o }));

    const selection: TerritorySelection = {
        country: levels.find((l) => l.type === 'country')?.selected,
        state: levels.find((l) => l.type === 'state')?.selected,
        city: levels.find((l) => l.type === 'city')?.selected,
        neighborhood: levels.find((l) => l.type === 'neighborhood')?.selected,
    };

    // El filtro emite la selección completa; acá se traduce al nivel que cambió.
    const handleSelectionChange = (next: TerritorySelection) => {
        const index = levels.findIndex((l) => (next[l.type] ?? '') !== (l.selected ?? ''));
        if (index === -1) return;

        onCascadeChange?.(index, next[levels[index].type] ?? '');
    };

    // "Todos" en el primer nivel: global (super admin), o quien ve más de un nodo.
    const allowAll = !!scope?.all || (levels[0]?.options.length ?? 0) > 1;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-sidebar-line bg-sidebar px-5">
            <nav aria-label="Migas de pan" className="flex min-w-0 items-center gap-2 text-sm">
                <Link
                    href={homeHref}
                    aria-label="Inicio"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-brand transition-colors hover:bg-white/10"
                >
                    <Home className="h-5 w-5" />
                </Link>
                {crumbs.map((crumb, index) => (
                    <span key={`${crumb}-${index}`} className="flex min-w-0 items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600" />
                        <span
                            className={
                                index === crumbs.length - 1
                                    ? 'truncate font-semibold text-white'
                                    : 'truncate text-slate-400'
                            }
                        >
                            {crumb}
                        </span>
                    </span>
                ))}
            </nav>

            <div className="flex items-center gap-3">
                {levels.length > 0 && (
                    <TerritoryFilterBar
                        variant="inline"
                        allowAll={allowAll}
                        selection={selection}
                        onSelectionChange={handleSelectionChange}
                        countries={optionsOf('country')}
                        states={optionsOf('state')}
                        cities={optionsOf('city')}
                        neighborhoods={optionsOf('neighborhood')}
                    />
                )}

                <ThemeToggle />

                <button
                    type="button"
                    onClick={onNotificationsClick}
                    aria-label="Notificaciones"
                    className={`${ICON_BUTTON} relative hover:bg-brand/10 hover:text-brand`}
                >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-fg shadow-md">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onLogout}
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                    className={`${ICON_BUTTON} hover:bg-rose-500/15 hover:text-rose-300`}
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
