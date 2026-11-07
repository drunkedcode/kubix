import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { OVERVIEW_LABEL, type TerritoryType } from "@/Layouts/partials/sidebarItems";
import { LayoutDashboard, LayoutGrid, TrendingUp } from "lucide-react";
import GeneralTab, { type GeneralData } from "./Tabs/GeneralTab";
import EvolutionTab, { type EvolutionData } from "./Tabs/EvolutionTab";
import TerritoriesTab, { type TerritoriesData } from "./Tabs/TerritoriesTab";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";

type TabKey = "territories" | "general" | "evolution";

interface IndexProps {
  tab: TabKey; // pestaña activa (el backend ya garantiza que está permitida)
  tabs: TabKey[]; // pestañas que el usuario puede ver (config/access.php)
  /** null = todos los territorios del usuario; con valor = un país, estado o ciudad. */
  territorySlug: string | null;
  territories: TerritoriesData;
  general: GeneralData;
  evolution: EvolutionData;
}

interface SharedProps {
  territory?: { name: string; type: TerritoryType } | null;
  [key: string]: unknown;
}

// Las tarjetas son los hijos del alcance: la etiqueta de su pestaña sigue el nivel.
const CHILDREN_LABEL: Record<TerritoryType, string> = {
  country: "Estados",
  state: "Ciudades",
  city: "Barrios",
  neighborhood: "Agencias",
};

const allTabs = (territoriesLabel: string): TabItem<TabKey>[] => [
  { key: "territories", label: territoriesLabel, icon: LayoutGrid },
  { key: "general", label: "General", icon: LayoutDashboard },
  { key: "evolution", label: "Evolución", icon: TrendingUp },
];

const CONTENT: Record<TabKey, (p: IndexProps) => React.ReactNode> = {
  territories: (p) => <TerritoriesTab items={p.territories} />,
  general: (p) => <GeneralTab data={p.general} />,
  evolution: (p) => <EvolutionTab data={p.evolution} />,
};

export default function Index(props: IndexProps) {
  const { territorySlug } = props;
  const { props: shared } = usePage<SharedProps>();

  const territoriesLabel =
    territorySlug && shared.territory ? CHILDREN_LABEL[shared.territory.type] : "Mis agencias";
  const visibleTabs = allTabs(territoriesLabel).filter((t) => props.tabs.includes(t.key));

  // Con un territorio puntual el título sigue su nivel (País, Estado, Ciudad).
  const title = territorySlug && shared.territory ? OVERVIEW_LABEL[shared.territory.type] : "Mis Agencias";
  const subtitle = territorySlug && shared.territory
    ? `Totales de ${shared.territory.name}`
    : "Resumen agregado de todos tus territorios";

  const changeTab = (tab: TabKey) =>
    router.get(
      territorySlug ? route("overview.territory", { territory: territorySlug }) : route("overview"),
      { tab },
      { preserveState: true, preserveScroll: true, replace: true },
    );

  return (
    <AdminLayout title={title} subtitle={subtitle}>
      <Head title={title} />

      <div className="flex flex-col gap-1">
        <Tabs tabs={visibleTabs} active={props.tab} onChange={changeTab} />
        <div>{CONTENT[props.tab](props)}</div>
      </div>
    </AdminLayout>
  );
}
