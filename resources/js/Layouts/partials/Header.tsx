import { Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
// Ajustá la ruta al lugar donde tengas TerritoryFilterBar
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

interface HeaderProps {
    title: string;
    subtitle?: string;
    notificationCount?: number;
    onNotificationsClick?: () => void;
    scope?: ScopeCascade | null;
    /** levelIndex = posición del nivel dentro de scope.levels; value '' = "Todos". */
    onCascadeChange?: (levelIndex: number, value: string) => void;
}

export default function Header({
    title,
    subtitle,
    notificationCount = 0,
    onNotificationsClick,
    scope,
    onCascadeChange,
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
        <header className="flex items-center justify-between border-b border-line bg-page px-5 py-1">
            <div>
                <h1 className="text-lg font-bold tracking-wide text-fg">{title}</h1>
                {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
            </div>

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
                    className="relative cursor-pointer rounded-xl border border-line p-2.5 text-muted transition-colors hover:bg-surface hover:text-brand"
                >
                    <Bell className="h-5 w-5" />
                    {notificationCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-fg shadow-md">
                            {notificationCount > 99 ? '99+' : notificationCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}