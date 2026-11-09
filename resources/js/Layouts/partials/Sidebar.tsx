import type { ReactNode } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import SidebarNavItem, { type NavItem } from './SidebarNavItem';
import Avatar from '@/Shared/ui/media/user/Avatar';

const cn = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(' ');

/**
 * Sidebar.tsx
 * Qué es:          barra lateral: marca arriba, navegación, tarjeta del usuario y botón de contraer.
 * Responsabilidad: pintar; todo llega por props (items, marca, usuario, colapsado).
 * Qué NO hace:     no lee Inertia ni cierra sesión (salir vive en la barra superior).
 * Para cambiar:    marca con brandName / brandSubtitle / brandLogo. Sin logo dibuja la inicial.
 */
export interface SidebarProps {
    items?: NavItem[];
    brandName?: string;
    brandSubtitle?: string;
    brandLogo?: ReactNode;
    userName?: string;
    userRole?: string;
    avatarUrl?: string | null;
    collapsed?: boolean;
    onToggle?: () => void;
}

export default function Sidebar({
    items = [],
    brandName = 'Kubix',
    brandSubtitle,
    brandLogo,
    userName = 'Usuario',
    userRole = '',
    avatarUrl = null,
    collapsed = true,
    onToggle,
}: SidebarProps) {
    return (
        <aside
            className={cn(
                'flex h-screen shrink-0 flex-col border-r border-sidebar-line bg-sidebar transition-all duration-200',
                collapsed ? 'w-20' : 'w-64',
            )}
        >
            {/* Marca */}
            <div
                className={cn(
                    'flex h-16 shrink-0 items-center border-b border-sidebar-line',
                    collapsed ? 'justify-center px-2' : 'gap-3 px-4',
                )}
            >
                {brandLogo ?? (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-base font-bold text-brand-fg">
                        {brandName.charAt(0)}
                    </div>
                )}
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="truncate text-sm font-bold leading-tight text-white">{brandName}</p>
                        {brandSubtitle && (
                            <p className="truncate text-xs leading-tight text-slate-400">{brandSubtitle}</p>
                        )}
                    </div>
                )}
            </div>

            <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3">
                {items.map((item) => (
                    <SidebarNavItem key={item.label} {...item} collapsed={collapsed} />
                ))}
            </nav>

            {/* Usuario */}
            <div className="border-t border-sidebar-line px-3 py-3">
                <div
                    title={collapsed ? `${userName}${userRole ? ` · ${userRole}` : ''}` : undefined}
                    className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3 px-1')}
                >
                    <Avatar name={userName} avatarUrl={avatarUrl} size="lg" />
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white">{userName}</p>
                            {userRole && <p className="truncate text-xs text-slate-400">{userRole}</p>}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-sidebar-line px-3 pb-2 pt-2">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-brand/5 hover:text-brand"
                >
                    {collapsed ? (
                        <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                        <>
                            <PanelLeftClose className="h-4 w-4" />
                            <span className="text-xs font-medium">Contraer</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
