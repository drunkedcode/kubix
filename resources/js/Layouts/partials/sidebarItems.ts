import { Building2, Map as MapIcon, MessageSquareWarning, Store, Users } from "lucide-react";
import type { NavItem } from "./SidebarNavItem";

export type TerritoryType = "country" | "state" | "city" | "neighborhood";

// Nombre del módulo de resumen según el nivel (también lo usa el título del Overview).
export const OVERVIEW_LABEL: Record<TerritoryType, string> = {
  country: "País",
  state: "Estado",
  city: "Ciudad",
  neighborhood: "Agencia",
};

interface NavContext {
  territory: string | null;
  type: TerritoryType | null;
}

// Cómo se dibuja cada módulo del catálogo (config/access.php): icono, etiqueta y ruta.
// El backend decide CUÁLES se muestran (prop "nav"); acá solo se define cómo se ven.
// Un módulo sin entrada acá no se dibuja. Para agregar uno: una línea acá.
// Un submódulo se registra con la clave 'modulo.pagina' (ej. 'agency.issues') y se dibuja bajo su módulo.
const MODULES: Record<string, (ctx: NavContext) => NavItem | null> = {
  overview: ({ territory, type }) => ({
    icon: Building2,
    label: territory && type ? OVERVIEW_LABEL[type] : "Agencias",
    href: territory
      ? route("overview.territory", { territory })
      : route("overview"),
  }),

  agency: ({ territory }) =>
    territory
      ? {
          icon: Building2,
          label: "Agencia",
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
          label: "Negocios",
          href: route("businesses.index", { territory }),
        }
      : null,

  team: ({ territory }) =>
    territory
      ? {
          icon: Users,
          label: "Equipo",
          href: route("team.index", { territory }),
        }
      : null,

  territories: () => ({
    icon: MapIcon,
    label: "Territorios",
    href: route("territories.index"),
  }),
  
};

export function getNavItems(nav: string[], ctx: NavContext): NavItem[] {
  const items: NavItem[] = [];
  const parents = new Map<string, NavItem>();

  nav.forEach((key) => {
    const item = MODULES[key]?.(ctx);
    if (!item) return;

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
