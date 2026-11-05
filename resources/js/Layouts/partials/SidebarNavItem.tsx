import { useEffect, useState, type ComponentType } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

const cn = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(' ');

export interface NavItem {
    label: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
    active?: boolean;
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

    // Abierto por defecto si estás en el módulo o en alguno de sus hijos.
    const [open, setOpen] = useState(active || childActive);
    useEffect(() => {
        if (active || childActive) setOpen(true);
    }, [active, childActive]);

    // Con el sidebar contraído solo se ven los módulos padres.
    const showChildren = hasChildren && !collapsed && open;

    return (
        <div>
            <div className="flex items-center gap-1">
                <Link
                    href={href}
                    title={collapsed ? label : undefined}
                    className={cn(
                        'flex flex-1 items-center rounded-lg font-medium transition-colors',
                        isChild ? 'py-2 text-[13px]' : 'py-2.5 text-sm',
                        collapsed ? 'justify-center' : 'gap-3 px-3',
                        active
                            ? 'border border-teal-500/20 bg-teal-500/15 text-teal-300'
                            : childActive
                              ? 'text-white'
                              : 'text-slate-400 hover:bg-teal-500/5 hover:text-white',
                    )}
                >
                    <Icon className={cn('shrink-0', isChild ? 'h-4 w-4' : 'h-5 w-5')} />
                    {!collapsed && <span>{label}</span>}
                </Link>

                {hasChildren && !collapsed && (
                    <button
                        type="button"
                        onClick={() => setOpen((value) => !value)}
                        aria-label={open ? `Cerrar ${label}` : `Abrir ${label}`}
                        aria-expanded={open}
                        className="cursor-pointer rounded-lg p-2 text-slate-400 transition-colors hover:bg-teal-500/5 hover:text-white"
                    >
                        <ChevronDown
                            className={cn('h-4 w-4 transition-transform', open ? 'rotate-180' : '-rotate-90')}
                        />
                    </button>
                )}
            </div>

            {showChildren && (
                <div className={cn('mt-1 space-y-1', !collapsed && 'ml-5 border-l border-slate-700/50 pl-2')}>
                    {subItems.map((sub) => (
                        <SidebarNavItem key={sub.label} {...sub} depth={depth + 1} collapsed={collapsed} />
                    ))}
                </div>
            )}
        </div>
    );
}
