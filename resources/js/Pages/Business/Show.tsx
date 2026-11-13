import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { LayoutDashboard, DollarSign, History, Megaphone, MousePointerClick } from "lucide-react";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";
import RecentActivityPanel, { type ActivityItem } from "@/Shared/components/activity/RecentActivityPanel";
import BusinessHero, { type BusinessKpi, type BusinessProfile } from "./Partials/BusinessHero";
import OverviewTab, { type OverviewData } from "./Tabs/OverviewTab";
import FinanceTab, { type FinanceData } from "./Tabs/FinanceTab";
import AdsTab, { type AdsData } from "./Tabs/AdsTab";
import TrafficTab, { type TrafficData } from "./Tabs/TrafficTab";

type TabKey = "profile" | "finance" | "traffic" | "ads" | "history";

interface ShowProps {
  business: BusinessProfile;
  kpis: BusinessKpi[];
  territorySlug: string;
  territoryName: string;
  activeTab: TabKey;
  tabs: TabKey[];
  overview?: OverviewData;
  adsData?: AdsData;
  trafficData?: TrafficData;
  financeData?: FinanceData;
  history?: ActivityItem[];
}

const ALL_TABS: TabItem<TabKey>[] = [
  { key: "profile", label: "Visão Geral", icon: LayoutDashboard },
  { key: "finance", label: "Financeiro", icon: DollarSign },
  { key: "traffic", label: "Tráfego", icon: Megaphone },
  { key: "ads", label: "Campanhas", icon: MousePointerClick },
  { key: "history", label: "Histórico", icon: History },
];

const CONTENT: Record<TabKey, (p: ShowProps) => React.ReactNode> = {
  profile: (p) => p.overview && <OverviewTab data={p.overview} />,
  finance: (p) => <FinanceTab data={p.financeData} />,
  traffic: (p) => <TrafficTab data={p.trafficData} />,
  ads: (p) => <AdsTab data={p.adsData} />,
  history: (p) => (
    <RecentActivityPanel
      items={p.history ?? []}
      title="Histórico"
      empty="Ainda não há movimentos no histórico deste negócio."
    />
  ),
};

export default function Show(props: ShowProps) {
  const { business, territorySlug, activeTab, tabs } = props;

  // The backend decides which tabs exist for this user; the page only renders them.
  const visibleTabs = ALL_TABS.filter((t) => tabs.includes(t.key));

  const changeTab = (next: TabKey) =>
    router.get(
      route("businesses.show", { territory: territorySlug, business: business.id }),
      { tab: next },
      { preserveState: true, preserveScroll: true, replace: true },
    );

  return (
    <AdminLayout
      title={business.name}
      crumb="Detalhes do Negócio"
      hero={<BusinessHero business={business} territoryName={props.territoryName} kpis={props.kpis} />}
    >
      <Head title={business.name} />

      <div className="flex flex-col gap-5">
        <Tabs tabs={visibleTabs} active={activeTab} onChange={changeTab} />
        <div>{CONTENT[activeTab](props)}</div>
      </div>
    </AdminLayout>
  );
}
