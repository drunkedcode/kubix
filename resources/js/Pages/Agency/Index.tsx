import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import type { ScopeOption } from "@/Layouts/partials/Header";
import AgencyHero from "./AgencyHero";
import GeneralTab, { type GeneralData } from "./Tabs/GeneralTab";
import EvolutionTab, { type EvolutionData } from "./Tabs/EvolutionTab";
import SettingsTab, { type SettingsData } from "./Tabs/SettingsTab";
import { Gauge, LayoutDashboard, TrendingUp } from "lucide-react";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";
import { TAB_LABELS } from "@/Layouts/partials/sidebarItems";

type TabKey = "general" | "evolution" | "settings";

interface IndexProps {
  tab: TabKey; // pestaña activa (el backend ya garantiza que está permitida)
  tabs: TabKey[]; // pestañas que el usuario puede ver (config/access.php)
  scope: ScopeOption;
  agency: { status: "active" | "inactive"; updated_at: string };
  general: GeneralData;
  evolution: EvolutionData;
  settings: SettingsData;
}

const ALL_TABS: TabItem<TabKey>[] = [
  { key: "general", label: TAB_LABELS.agency.general, icon: LayoutDashboard },
  { key: "evolution", label: TAB_LABELS.agency.evolution, icon: TrendingUp },
  { key: "settings", label: TAB_LABELS.agency.settings, icon: Gauge },
];

const CONTENT: Record<TabKey, (p: IndexProps) => React.ReactNode> = {
  general: (p) => <GeneralTab data={p.general} territory={p.scope.value} />,
  evolution: (p) => <EvolutionTab data={p.evolution} />,
  settings: (p) => <SettingsTab data={p.settings} territory={p.scope.value} />,
};

export default function Index(props: IndexProps) {
  const visibleTabs = ALL_TABS.filter((t) => props.tabs.includes(t.key));

  const changeTab = (tab: TabKey) =>
    router.get(
      route("agencies.index", { territory: props.scope.value }),
      { tab },
      { preserveState: true, preserveScroll: true, replace: true },
    );

  return (
    <AdminLayout
      title="Agência"
      hero={
        <AgencyHero
          name={props.scope.label}
          active={props.agency.status === "active"}
          updatedAt={props.agency.updated_at}
        />
      }
    >
      <Head title="Agência" />

      <div className="flex flex-col gap-5">
        <Tabs tabs={visibleTabs} active={props.tab} onChange={changeTab} />
        <div>{CONTENT[props.tab](props)}</div>
      </div>
    </AdminLayout>
  );
}
