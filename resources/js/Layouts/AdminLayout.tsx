import { useEffect, type ReactNode } from 'react';
import { router, usePage } from '@inertiajs/react';
import Sidebar, { type SidebarProps } from './partials/Sidebar';
import Header, { type ScopeCascade } from './partials/Header';
import { getNavItems, type TerritoryType } from './partials/sidebarItems';
import { useUiStore } from './store/useUiStore';

interface PageProps {
    auth: {
        user: { id: number; name: string; email: string; avatar_url?: string | null } | null;
        roles: string[];
        permissions: string[];
    };
    territory?: {
        slug: string;
        name: string;
        type: TerritoryType;
    } | null;
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
    const permissions = props.auth?.permissions ?? [];
    const territorySlug = props.territory?.slug ?? null;
    const territoryType = props.territory?.type ?? null;

    // Diagnóstico: qué recibe el layout en cada navegación
    useEffect(() => {
        console.log('[scope] props', {
            url,
            territory: props.territory,
            cascade: props.cascade,
            roles: props.auth?.roles,
        });
    }, [url, props.territory, props.cascade, props.auth?.roles]);

    // Ítems del sidebar según el nivel del territorio actual
    const rawNavItems = getNavItems({
        territory: territorySlug,
        type: territoryType,
        permissions,
    });

    // Marca como activo el ítem cuyo href coincide con la URL actual
    const navItems = rawNavItems.map((item) => {
        if (item.children) {
            const childrenWithActive = item.children.map((child) => ({
                ...child,
                active: child.href !== '#' && (url === child.href || url.startsWith(child.href)),
            }));
            const hasActiveChild = childrenWithActive.some((c) => c.active);

            return {
                ...item,
                active: hasActiveChild,
                children: childrenWithActive,
            };
        }

        return {
            ...item,
            active: item.href !== '#' && (url === item.href || url.startsWith(item.href || '')),
        };
    });

    // Entra al territorio elegido. Siempre aterriza en su dashboard:
    // cada nivel del árbol tiene su propio index y su propio sidebar.
    const goToTerritory = (slug: string) => {
        const target = route('agencies.index', { territory: slug });
        console.log('[scope] navega', { slug, target });
        router.get(target);
    };

    // Cascada: elegir un nodo entra a ese territorio;
    // "Todos" sube un nivel, y en el primer nivel va a la vista global (super admin) o al overview.
    const changeCascade = (levelIndex: number, value: string) => {
        console.log('[scope] cambio', {
            levelIndex,
            level: props.cascade?.levels?.[levelIndex]?.type,
            value: value || '(todos)',
        });

        if (value !== '') {
            goToTerritory(value);
            return;
        }

        const parent = props.cascade?.levels?.[levelIndex - 1]?.selected;

        if (parent) {
            goToTerritory(parent);
            return;
        }

        const target = route(props.cascade?.all === 'platform' ? 'territories.index' : 'overview');
        console.log('[scope] navega', { target });
        router.get(target);
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