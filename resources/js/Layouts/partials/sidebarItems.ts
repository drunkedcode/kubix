import {
  Building2,
  Store,
  Megaphone,
  Smartphone,
  Users,
  ShieldCheck,
  Map,
  type LucideIcon as LucideIconType,
} from "lucide-react";

export type LucideIcon = LucideIconType;

export type TerritoryType = "country" | "state" | "city" | "neighborhood";

export interface NavChild {
  href: string;
  label: string;
  active?: boolean;
}

export interface NavItem {
  href?: string;
  icon: LucideIcon;
  label: string;
  children?: NavChild[];
  active?: boolean;
}

interface NavContext {
  territory?: string | null;
  type?: TerritoryType | null;
  permissions?: string[];
}

const ALL_LEVELS: TerritoryType[] = ["country", "state", "city", "neighborhood"];
const NEIGHBORHOOD_ONLY: TerritoryType[] = ["neighborhood"];

// Definición con "levels" (en qué niveles aparece; sin "levels" = todos) y
// "permission" (qué permiso hace falta; sin "permission" = cualquiera).
// País, Estado y Ciudad son agregados (supervisan); solo el barrio opera.
interface ChildDef extends NavChild {
  levels?: TerritoryType[];
  permission?: string;
}

interface ItemDef extends Omit<NavItem, "children"> {
  levels?: TerritoryType[];
  permission?: string;
  children?: ChildDef[];
}

// Nombre del módulo de resumen según el nivel (también lo usa el título del dashboard)
export const OVERVIEW_LABEL: Record<TerritoryType, string> = {
  country: "País",
  state: "Estado",
  city: "Ciudad",
  neighborhood: "Agencia",
};

// Super admin en la vista global — sin territorio puntual
function getPlatformItems(): NavItem[] {
  return [
    {
      icon: Map,
      label: "Territorios",
      children: [
        { label: "Todos los territorios", href: route("territories.index") },
        { label: "Nuevo territorio", href: route("territories.create") },
      ],
    },
  ];
}

// Lista única de módulos del territorio
function defineItems(territory: string, type: TerritoryType): ItemDef[] {
  return [
    {
      icon: Building2,
      label: OVERVIEW_LABEL[type],
      href: route("agencies.index", { territory }),
    },
    {
      icon: Store,
      label: "Negocios",
      children: [
        { label: "Negocios", href: route("businesses.index", { territory }) },
        {
          label: "Nuevo negocio",
          href: route("businesses.create", { territory }),
          levels: NEIGHBORHOOD_ONLY,
        },
      ],
    },
    {
      icon: Megaphone,
      label: "Tráfico Pago",
      levels: NEIGHBORHOOD_ONLY,
      children: [
        { label: "Campañas activas", href: "#" },
        { label: "Nueva campaña", href: "#" },
      ],
    },
    {
      icon: Smartphone,
      label: "Vitrina PWA",
      levels: NEIGHBORHOOD_ONLY,
      children: [
        { label: "Principal", href: route("showcase.index", { territory }) },
        { label: "Ofertas del barrio", href: "#" },
      ],
    },
    {
      icon: Users,
      label: "Equipo",
      children: [
        {
          label: "Miembros",
          href: route("team.index", { territory }),
          permission: "view-team",
        },
        {
          label: "Nuevo miembro",
          href: route("team.create", { territory }),
          permission: "manage-team",
        },
      ],
    },
    {
      icon: ShieldCheck,
      label: "Kubix",
      children: [
        { label: "Mi Licencia", href: "#" },
        { label: "Soporte Central", href: "#" },
      ],
    },
  ];
}

const appliesTo = (levels: TerritoryType[] | undefined, type: TerritoryType) =>
  (levels ?? ALL_LEVELS).includes(type);

const allowed = (permission: string | undefined, permissions: string[]) =>
  !permission || permissions.includes(permission);

export function getNavItems(ctx: NavContext): NavItem[] {
  const { territory, type, permissions = [] } = ctx;

  if (!territory) return getPlatformItems();

  const level: TerritoryType = type ?? "neighborhood";

  return defineItems(territory, level)
    .filter((item) => appliesTo(item.levels, level) && allowed(item.permission, permissions))
    .map(({ levels: _levels, permission: _permission, children, ...item }) => ({
      ...item,
      ...(children && {
        children: children
          .filter((child) => appliesTo(child.levels, level) && allowed(child.permission, permissions))
          .map(({ levels: _childLevels, permission: _childPermission, ...child }) => child),
      }),
    }))
    // Un módulo cuyos subenlaces quedaron todos filtrados no se muestra vacío.
    .filter((item) => !("children" in item) || (item.children?.length ?? 0) > 0);
}