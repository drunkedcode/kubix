import type { ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import Sidebar, { type SidebarProps } from './partials/Sidebar';
import Header, { type ScopeCascade } from './partials/Header';
import { getNavItems, type TerritoryType } from './partials/sidebarItems';
import type { NavItem } from './partials/SidebarNavItem';
import { useUiStore } from './store/useUiStore';

interface PageProps {
    auth: {
        user: { id: number; name: string; email: string; avatar_url?: string | null } | null;
        roles: string[];
    };
    territory?: {
        slug: string;
        name: string;
        type: TerritoryType;
    } | null;
    // Módulos del sidebar que el backend permite ver en la casa actual (config/access.php).
    nav?: string[];
    // Cascada del header (compartida). Se llama "cascade" para no chocar con
    // props de página como "scope".
    cascade?: ScopeCascade | null;
    [key: string]: unknown;
}

interface AdminLayoutProps {
    title: string;
    subtitle?: string;
    notificationCount?: number;
    sidebar?: SidebarProps;
    children: ReactNode;
}

export default function AdminLayout({
    title,
    subtitle,
    notificationCount,
    sidebar,
    children,
}: AdminLayoutProps) {
    const collapsed = useUiStore((s) => s.sidebarCollapsed);
    const toggleSidebar = useUiStore((s) => s.toggleSidebar);

    const { props, url } = usePage<PageProps>();

    // route() devuelve una URL absoluta y "url" de Inertia solo la ruta: se compara por ruta.
    const isActive = (href?: string) => {
        if (!href) return false;
        const path = new URL(href, window.location.origin).pathname;
        return url === path || url.startsWith(`${path}/`) || url.startsWith(`${path}?`);
    };

    const withActive = (item: NavItem): NavItem => ({
        ...item,
        active: isActive(item.href),
        subItems: item.subItems?.map(withActive),
    });

    const navItems = getNavItems(props.nav ?? [], {
        territory: props.territory?.slug ?? null,
        type: props.territory?.type ?? null,
    }).map(withActive);

    // Entra al territorio elegido: el barrio cae en su Agency; el resto, en su Overview.
    const goToTerritory = (slug: string, type?: TerritoryType) => {
        router.get(
            type === 'neighborhood'
                ? route('agencies.index', { territory: slug })
                : route('overview.territory', { territory: slug }),
        );
    };

    // Cascada: elegir un nodo entra a ese territorio; "Todos" sube un nivel, y en el
    // primer nivel va a la vista global (super admin) o al overview.
    const changeCascade = (levelIndex: number, value: string) => {
        const levels = props.cascade?.levels ?? [];

        if (value !== '') {
            goToTerritory(value, levels[levelIndex]?.type as TerritoryType | undefined);
            return;
        }

        const parent = levels[levelIndex - 1];

        if (parent?.selected) {
            goToTerritory(parent.selected, parent.type as TerritoryType);
            return;
        }

        router.get(route(props.cascade?.all === 'platform' ? 'territories.index' : 'overview'));
    };

    return (
        <div className="flex h-screen bg-page text-fg antialiased">
            <Sidebar
                items={navItems}
                userName={props.auth?.user?.name}
                userRole={props.auth?.roles?.[0]}
                avatarUrl={props.auth?.user?.avatar_url}
                {...sidebar}
                collapsed={collapsed}
                onToggle={toggleSidebar}
                onLogout={() => router.post(route('logout'))}
            />

            <div className="flex flex-1 flex-col overflow-hidden bg-page p-5">
                <Header
                    title={title}
                    subtitle={subtitle}
                    notificationCount={notificationCount}
                    scope={props.cascade}
                    onCascadeChange={changeCascade}
                />

                <main className="flex-1 overflow-y-auto bg-page">{children}</main>
            </div>
        </div>
    );
}
