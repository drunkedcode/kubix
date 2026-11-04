import type { ReactNode } from 'react';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import SidebarNavItem, { type NavItem } from './SidebarNavItem';
import Avatar from '@/Shared/ui/media/user/Avatar';

const cn = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(' ');

/**
 * Sidebar.tsx
 * Qué es:          barra lateral: usuario arriba (hero), navegación y botón de contraer.
 * Responsabilidad: pintar; todo llega por props (items, usuario, logout, colapsado).
 * Qué NO hace:     no lee Inertia ni cierra sesión: llama a onLogout.
 * Para cambiar:    la imagen hero con heroImage (url). Sin ella usa un degradado.
 *                  Logo con brandLogo. Colapsado: solo avatar, salir debajo.
 */
export interface SidebarProps {
    items?: NavItem[];
    brandName?: string;
    brandLogo?: ReactNode;
    heroImage?: string;
    userName?: string;
    userRole?: string;
    avatarUrl?: string | null;
    collapsed?: boolean;
    onToggle?: () => void;
    onLogout?: () => void;
}

export default function Sidebar({
    items = [],
    brandName = 'Kubix',
    brandLogo,
    heroImage,
    userName = 'Usuario',
    userRole = '',
    avatarUrl = null,
    collapsed = true,
    onToggle,
    onLogout,
}: SidebarProps) {
    return (
        <aside
            className={cn(
                'flex h-screen shrink-0 flex-col border-r border-sidebar-line bg-sidebar transition-all duration-200',
                collapsed ? 'w-20' : 'w-64',
            )}
        >
            {/* Hero: marca + usuario */}
            <div
                className="relative shrink-0 overflow-hidden border-b border-navy-800 bg-gradient-to-br from-teal-600/40 via-navy-800 to-navy-950"
                style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/50 to-navy-950/20" />

                <div className={cn('relative flex flex-col', collapsed ? 'items-center gap-3 px-2 py-4' : 'gap-6 px-4 pb-4 pt-4')}>
                    <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
                        {brandLogo}
                        {!collapsed && (
                            <span className="text-lg font-bold tracking-wide text-white">{brandName}</span>
                        )}
                    </div>

                    <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'gap-3')}>
                        <div title={collapsed ? `${userName}${userRole ? ` · ${userRole}` : ''}` : undefined}>
                            <Avatar name={userName} avatarUrl={avatarUrl} size="lg" />
                        </div>

                        {!collapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">{userName}</p>
                                {userRole && <p className="truncate text-xs text-slate-300">{userRole}</p>}
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={onLogout}
                            aria-label="Cerrar sesión"
                            title="Cerrar sesión"
                            className="cursor-pointer rounded-lg p-2 text-slate-300 transition-colors hover:bg-rose-500/15 hover:text-rose-300"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
                {items.map((item) => (
                    <SidebarNavItem key={item.label} {...item} collapsed={collapsed} />
                ))}
            </nav>

            <div className="mt-2 border-t border-navy-800 px-3 pb-2 pt-3">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-teal-500/5 hover:text-teal-300"
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
