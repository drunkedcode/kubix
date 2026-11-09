import { Building2, Map as MapIcon, MessageSquareWarning, Store, Users } from "lucide-react";
import type { NavItem } from "./SidebarNavItem";

export type TerritoryType = "country" | "state" | "city" | "neighborhood";

// Nombre del módulo de resumen según el nivel (también lo usa el título del Overview).
export const OVERVIEW_LABEL: Record<TerritoryType, string> = {
  country: "País",
  state: "Estado",
  city: "Cidade",
  neighborhood: "Agência",
};

// Nombre de cada pestaña (clave de config/access.php). Único lugar: el sidebar la usa para sus
// atajos y las páginas la usan para su barra de pestañas. Un módulo sin entrada acá no tiene atajos.
export const TAB_LABELS: Record<string, Record<string, string>> = {
  agency: { general: "Geral", evolution: "Evolução", settings: "Configurações" },
  business: { list: "Todos os Negócios", approvals: "Aprovações", categories: "Categorias" },
};

interface NavContext {
  territory: string | null;
  type: TerritoryType | null;
  /** Pestañas que la persona ve en cada módulo (prop compartida "navTabs"). */
  tabs: Record<string, string[]>;
}

// Cómo se dibuja cada módulo del catálogo (config/access.php): icono, etiqueta y ruta.
// El backend decide CUÁLES se muestran (prop "nav"); acá solo se define cómo se ven.
// Un módulo sin entrada acá no se dibuja. Para agregar uno: una línea acá.
// Un submódulo se registra con la clave 'modulo.pagina' (ej. 'agency.issues') y se dibuja bajo su módulo.
const MODULES: Record<string, (ctx: NavContext) => NavItem | null> = {
  overview: ({ territory, type }) => ({
    icon: Building2,
    label: territory && type ? OVERVIEW_LABEL[type] : "Agências",
    href: territory
      ? route("overview.territory", { territory })
      : route("overview"),
  }),

  agency: ({ territory }) =>
    territory
      ? {
          icon: Building2,
          label: "Agência",
          href: route("agencies.index", { territory }),
        }
      : null,

  "agency.issues": ({ territory }) =>
    territory
      ? {
          icon: MessageSquareWarning,
          label: "Issues",
          href: route("issues.index", { territory }),
        }
      : null,

  business: ({ territory }) =>
    territory
      ? {
          icon: Store,
          label: "Negócios",
          href: route("businesses.index", { territory }),
        }
      : null,

  team: ({ territory }) =>
    territory
      ? {
          icon: Users,
          label: "Equipes",
          href: route("team.index", { territory }),
        }
      : null,

  territories: () => ({
    icon: MapIcon,
    label: "Territórios",
    href: route("territories.index"),
  }),

};

export function getNavItems(nav: string[], ctx: NavContext): NavItem[] {
  const items: NavItem[] = [];
  const parents = new Map<string, NavItem>();

  nav.forEach((key) => {
    const item = MODULES[key]?.(ctx);
    if (!item) return;

    // Atajos a las pestañas: solo en módulos de primer nivel y si la persona ve dos o más.
    const tabs = ctx.tabs[key] ?? [];
    const labels = TAB_LABELS[key];
    if (!key.includes('.') && labels && tabs.length > 1) {
      item.subItems = tabs.map((tab) => ({
        label: labels[tab] ?? tab,
        href: `${item.href}?tab=${tab}`,
        icon: item.icon,
        tab,
      }));
    }

    // 'agency.issues' cuelga de 'agency'; si el módulo no está, sube a primer nivel.
    const parent = key.includes('.') ? parents.get(key.split('.')[0]) : undefined;

    if (parent) {
      (parent.subItems ??= []).push(item);
    } else {
      items.push(item);
      parents.set(key, item);
    }
  });

  return items;
}
