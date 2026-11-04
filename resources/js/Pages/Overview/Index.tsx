import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { OVERVIEW_LABEL, type TerritoryType } from "@/Layouts/partials/sidebarItems";
import { LayoutDashboard, TrendingUp } from "lucide-react";
import GeneralTab, { type GeneralData } from "./Tabs/GeneralTab";
import EvolutionTab, { type EvolutionData } from "./Tabs/EvolutionTab";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";

type TabKey = "general" | "evolution";

interface IndexProps {
  tab: TabKey;
  /** null = todos los territorios del usuario; con valor = un país, estado o ciudad. */
  territorySlug: string | null;
  general: GeneralData;
  evolution: EvolutionData;
}

interface SharedProps {
  territory?: { name: string; type: TerritoryType } | null;
  [key: string]: unknown;
}

const TABS: TabItem<TabKey>[] = [
  { key: "general", label: "General", icon: LayoutDashboard },
  { key: "evolution", label: "Evolución", icon: TrendingUp },
];

const CONTENT: Record<TabKey, (p: IndexProps) => React.ReactNode> = {
  general: (p) => <GeneralTab data={p.general} />,
  evolution: (p) => <EvolutionTab data={p.evolution} />,
};

export default function Index(props: IndexProps) {
  const { territorySlug } = props;
  const { props: shared } = usePage<SharedProps>();

  const activeTab: TabKey = CONTENT[props.tab] ? props.tab : "general";

  // Con un territorio puntual el título sigue su nivel (Mi País, Mi Estado, Mi Ciudad).
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
        <Tabs tabs={TABS} active={activeTab} onChange={changeTab} />
        <div>{CONTENT[activeTab](props)}</div>
      </div>
    </AdminLayout>
  );
}