import { useEffect, useState, type ComponentType } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

const cn = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(' ');

export interface NavItem {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    active?: boolean;
    /** Si es un atajo a una pestaña de su módulo: la clave de la pestaña. */
    tab?: string;
    subItems?: NavItem[];
}

interface SidebarNavItemProps extends NavItem {
    collapsed?: boolean;
    depth?: number;
}

export default function SidebarNavItem({
    href,
    icon: Icon,
    label,
    active = false,
    subItems = [],
    collapsed = false,
    depth = 0,
}: SidebarNavItemProps) {
    const hasChildren = subItems.length > 0;
    const childActive = subItems.some((sub) => sub.active);
    const isChild = depth > 0;
    // El módulo queda resaltado también cuando estás en uno de sus hijos.
    const highlighted = !isChild && (active || childActive);

    // Abierto por defecto si estás en el módulo o en alguno de sus hijos.
    const [open, setOpen] = useState(active || childActive);
    useEffect(() => {
        if (active || childActive) setOpen(true);
    }, [active, childActive]);

    // Con el sidebar contraído solo se ven los módulos padres.
    const showChildren = hasChildren && !collapsed && open;

    return (
        <div>
            <div
                className={cn(
                    'flex items-center rounded-lg transition-colors',
                    highlighted ? 'bg-brand text-brand-fg' : !isChild && 'hover:bg-brand/5',
                )}
            >
                <Link
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                        'flex flex-1 items-center font-medium transition-colors',
                        isChild ? 'py-1.5 text-[13px]' : 'py-2.5 text-sm',
                        collapsed ? 'justify-center' : 'gap-3 px-3',
                        highlighted && 'font-semibold',
                        isChild &&
                            (active ? 'font-semibold text-brand' : 'text-slate-300 hover:text-white'),
                        !isChild && !highlighted && 'text-slate-400 hover:text-white',
                    )}
                >
                    {isChild ? (
                        <span className="flex w-2 shrink-0 justify-center" aria-hidden="true">
                            <span
                                className={cn(
                                    'rounded-full',
                                    active ? 'h-2 w-2 bg-brand' : 'h-1 w-1 bg-slate-500',
                                )}
                            />
                        </span>
                    ) : (
                        <Icon className="h-5 w-5 shrink-0" />
                    )}
                    {!collapsed && <span>{label}</span>}
                </Link>

                {hasChildren && !collapsed && (
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        aria-label={open ? `Cerrar ${label}` : `Abrir ${label}`}
                        aria-expanded={open}
                        className={cn(
                            'cursor-pointer rounded-lg p-2 transition-colors',
                            !highlighted && 'text-slate-400 hover:text-white',
                        )}
                    >
                        <ChevronRight
                            className={cn('h-4 w-4 transition-transform', open && 'rotate-90')}
                        />
                    </button>
                )}
            </div>

            {showChildren && (
                <div className="mt-1 space-y-0.5 rounded-xl bg-black/25 py-2 pl-4 pr-2">
                    {subItems.map((sub) => (
                        <SidebarNavItem key={sub.label} {...sub} depth={depth + 1} collapsed={collapsed} />
                    ))}
                </div>
            )}
        </div>
    );
}
