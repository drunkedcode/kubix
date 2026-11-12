import { useLayoutEffect, type ReactNode } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { router, usePage } from '@inertiajs/react';
import Sidebar, { type SidebarProps } from './partials/Sidebar';
import Header, { type ScopeCascade } from './partials/Header';
import PageHeader from './partials/PageHeader';
import { getNavItems, type TerritoryType } from './partials/sidebarItems';
import type { NavItem } from './partials/SidebarNavItem';
import { useUiStore } from './store/useUiStore';
import { BRAND } from '@/Shared/brand';

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
    // Pestañas que la persona ve en cada módulo del sidebar (atajos hijos).
    navTabs?: Record<string, string[]>;
    // Muñeca activa (clave de config 'access.dolls') o null = tablero Kubix; define el tema.
    doll?: string | null;
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
    /** Fila de KPIs bajo el título (normalmente 4 StatCard). */
    kpis?: ReactNode;
    /** Reemplaza la cabecera estándar (pantallas con banner propio). */
    hero?: ReactNode;
    /** Última miga en pantallas de detalle (ej. "Detalhes do Negócio"); va tras el módulo activo. */
    crumb?: string;
    children: ReactNode;
}

export default function AdminLayout({
    title,
    subtitle,
    notificationCount,
    sidebar,
    kpis,
    hero,
    crumb,
    children,
}: AdminLayoutProps) {
    const collapsed = useUiStore((s) => s.sidebarCollapsed);
    const toggleSidebar = useUiStore((s) => s.toggleSidebar);

    const { props, url } = usePage<PageProps>();

    // La muñeca activa define el tema: [data-doll="vi"] en app.css. Sin muñeca, tema del tablero.
    useLayoutEffect(() => {
        const root = document.documentElement;

        if (props.doll) {
            root.dataset.doll = props.doll;
        } else {
            delete root.dataset.doll;
        }

        return () => {
            delete root.dataset.doll;
        };
    }, [props.doll]);

    // route() devuelve una URL absoluta y "url" de Inertia solo la ruta: se compara por ruta.
    const isActive = (href?: string) => {
        if (!href) return false;
        const path = new URL(href, window.location.origin).pathname;
        return url === path || url.startsWith(`${path}/`) || url.startsWith(`${path}?`);
    };

    // Pestaña actual (?tab=); sin ella, la primera permitida. Marca el atajo hijo que corresponde.
    const currentTab = new URLSearchParams(url.split('?')[1] ?? '').get('tab');

    const withActive = (item: NavItem): NavItem => {
        const onPage = isActive(item.href);
        const firstTab = item.subItems?.find((sub) => sub.tab)?.tab;

        return {
            ...item,
            active: onPage,
            subItems: item.subItems?.map((sub) =>
                sub.tab ? { ...sub, active: onPage && (currentTab ?? firstTab) === sub.tab } : withActive(sub),
            ),
        };
    };

    const navItems = getNavItems(props.nav ?? [], {
        territory: props.territory?.slug ?? null,
        type: props.territory?.type ?? null,
        tabs: props.navTabs ?? {},
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

    // Camino activo del sidebar: alimenta las migas y el ícono de la cabecera de página.
    const parent = navItems.find((item) => item.active || item.subItems?.some((sub) => sub.active));
    const child = parent?.subItems?.find((sub) => sub.active);
    const trail = parent ? (child ? [parent, child] : [parent]) : [];
    const current = trail[trail.length - 1];

    const homeHref = props.territory
        ? props.territory.type === 'neighborhood'
            ? route('agencies.index', { territory: props.territory.slug })
            : route('overview.territory', { territory: props.territory.slug })
        : route(props.cascade?.all === 'platform' ? 'territories.index' : 'overview');

    // Marca por muñeca: VI en sus agencias; sin muñeca, el tablero Kubix.
    const brand =
        props.doll === 'vi'
            ? {
                  name: 'VI Bairro',
                  subtitle: 'Gestão de Agência',
                  logo: <img src={BRAND.icon} alt="" className="h-9 w-9 rounded-lg object-contain" />,
              }
            : { name: 'Kubix', subtitle: 'Gestão da Plataforma', logo: undefined };

    return (
        <div className="flex h-screen bg-page text-fg antialiased">
            <Sidebar
                items={navItems}
                brandName={brand.name}
                brandSubtitle={brand.subtitle}
                brandLogo={brand.logo}
                userName={props.auth?.user?.name}
                userRole={props.auth?.roles?.[0]}
                avatarUrl={props.auth?.user?.avatar_url}
                {...sidebar}
                collapsed={collapsed}
                onToggle={toggleSidebar}
            />

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-page">
                <Header
                    crumbs={
                        crumb
                            ? [...(parent ? [parent.label] : []), crumb]
                            : trail.length > 0
                              ? trail.map((item) => item.label)
                              : [title]
                    }
                    homeHref={homeHref}
                    notificationCount={notificationCount}
                    scope={props.cascade}
                    onCascadeChange={changeCascade}
                    onLogout={() => router.post(route('logout'))}
                />

                <main className="flex-1 overflow-y-auto bg-page p-5">
                    {hero ?? (
                        <PageHeader icon={current?.icon ?? LayoutDashboard} title={title} subtitle={subtitle}>
                            {kpis}
                        </PageHeader>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
