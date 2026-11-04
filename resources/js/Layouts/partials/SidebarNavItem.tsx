import { useState, type ComponentType } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';

const cn = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(' ');

export interface NavChild {
    label: string;
    href: string;
    active?: boolean;
}

export interface NavItem {
    label: string;
    href?: string;
    icon: ComponentType<{ className?: string }>;
    active?: boolean;
    children?: NavChild[];
}

interface SidebarNavItemProps extends NavItem {
    collapsed?: boolean;
}

export default function SidebarNavItem({
    href = '#',
    icon: Icon,
    label,
    active = false,
    children,
    collapsed = false,
}: SidebarNavItemProps) {
    const hasActiveChild = children?.some((child) => child.active) ?? false;
    const [isOpen, setIsOpen] = useState(hasActiveChild);

    if (children) {
        return (
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen((v) => !v)}
                    title={collapsed ? label : undefined}
                    className={cn(
                        'flex w-full cursor-pointer items-center rounded-lg py-2.5 text-sm font-medium transition-colors',
                        collapsed ? 'justify-center' : 'justify-between gap-3 px-3',
                        hasActiveChild
                            ? 'text-teal-300'
                            : 'text-slate-400 hover:bg-teal-500/5 hover:text-white',
                    )}
                >
                    <div className={cn('flex items-center', !collapsed && 'gap-3')}>
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{label}</span>}
                    </div>
                    {!collapsed && (
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 shrink-0 transition-transform duration-200',
                                isOpen && 'rotate-180',
                            )}
                        />
                    )}
                </button>

                {isOpen && !collapsed && (
                    <div className="mt-1 space-y-1 pl-9 pr-2">
                        {children.map((child) => (
                            <Link
                                key={child.href + child.label}
                                href={child.href}
                                className={cn(
                                    'block rounded-md px-3 py-2 text-xs font-medium transition-colors',
                                    child.active
                                        ? 'border border-teal-500/20 bg-teal-500/15 text-teal-300'
                                        : 'text-slate-500 hover:bg-teal-500/5 hover:text-slate-200',
                                )}
                            >
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
                'flex items-center rounded-lg py-2.5 text-sm font-medium transition-colors',
                collapsed ? 'justify-center' : 'gap-3 px-3',
                active
                    ? 'border border-teal-500/20 bg-teal-500/15 text-teal-300'
                    : 'text-slate-400 hover:bg-teal-500/5 hover:text-white',
            )}
        >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
        </Link>
    );
}