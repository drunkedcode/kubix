import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { LayoutDashboard, DollarSign, Megaphone, MousePointerClick  } from "lucide-react";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";
import ProfileTab, { type BusinessProfile } from "./Tabs/ProfileTab";
import FinanceTab, { type FinanceData } from "./Tabs/FinanceTab";
import AdsTab, { type AdsData } from "./Tabs/AdsTab";
import TrafficTab from "./Tabs/TrafficTab";

type TabKey = "profile" | "finance" | "traffic"| "ads";

interface ShowProps {
  business: BusinessProfile;
  territorySlug: string;
  activeTab: TabKey;
  tabs: TabKey[];
  adsData?: AdsData;
  financeData?: FinanceData;
}

const ALL_TABS: TabItem<TabKey>[] = [
  { key: "profile", label: "Perfil", icon: LayoutDashboard },
  { key: "finance", label: "Finanzas", icon: DollarSign },
  { key: "traffic", label: "Tráfico", icon: Megaphone },
  { key: "ads", label: "Ads", icon: MousePointerClick },
];

const CONTENT: Record<TabKey, (p: ShowProps) => React.ReactNode> = {
  profile: (p) => <ProfileTab business={p.business} />,
  finance: (p) => <FinanceTab data={p.financeData} />,
  traffic: () => <TrafficTab />,
  ads: (p) => <AdsTab data={p.adsData} />,
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
    <AdminLayout title="Negocio" subtitle={business.name}>
      <Head title={business.name} />

      <div className="flex flex-col gap-2 p-2 sm:p-6">
        <button
          onClick={() => router.visit(route("businesses.index", { territory: territorySlug }))}
          className="w-fit text-xs text-navy-400 hover:text-navy-200"
        >
          ← Volver a negocios
        </button>

        <Tabs tabs={visibleTabs} active={activeTab} onChange={changeTab} />
        <div>{CONTENT[activeTab](props)}</div>
      </div>
    </AdminLayout>
  );
}