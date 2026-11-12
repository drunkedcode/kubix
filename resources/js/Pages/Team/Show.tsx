import { Head, router } from "@inertiajs/react";
import { History, Store, Zap } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";
import RecentActivityPanel, { type ActivityItem } from "@/Shared/components/activity/RecentActivityPanel";
import MemberHero, { type MemberKpi, type MemberProfile } from "./Partials/MemberHero";
import BusinessesTab, { type LinkedBusiness } from "./Tabs/BusinessesTab";

type TabKey = "businesses" | "activities" | "history";

interface ShowProps {
  member: MemberProfile;
  kpis: MemberKpi[];
  territorySlug: string;
  activeTab: TabKey;
  tabs: TabKey[];
  businesses?: LinkedBusiness[];
  activities?: ActivityItem[];
  history?: ActivityItem[];
}

const ALL_TABS: TabItem<TabKey>[] = [
  { key: "businesses", label: "Negócios Vinculados", icon: Store },
  { key: "activities", label: "Atividades", icon: Zap },
  { key: "history", label: "Histórico", icon: History },
];

const CONTENT: Record<TabKey, (p: ShowProps) => React.ReactNode> = {
  businesses: (p) => <BusinessesTab rows={p.businesses ?? []} territory={p.territorySlug} />,
  activities: (p) => (
    <RecentActivityPanel
      items={p.activities ?? []}
      title="Atividades"
      empty="Esta pessoa ainda não realizou ações registradas."
    />
  ),
  history: (p) => (
    <RecentActivityPanel
      items={p.history ?? []}
      title="Histórico"
      empty="Ainda não há movimentos no histórico desta pessoa."
    />
  ),
};

export default function Show(props: ShowProps) {
  const { member, territorySlug, activeTab, tabs } = props;

  // El backend decide qué pestañas existen para este usuario; la página solo las pinta.
  const visibleTabs = ALL_TABS.filter((t) => tabs.includes(t.key));

  const changeTab = (next: TabKey) =>
    router.get(
      route("team.show", { territory: territorySlug, user: member.id }),
      { tab: next },
      { preserveState: true, preserveScroll: true, replace: true },
    );

  return (
    <AdminLayout
      title={member.name}
      crumb="Detalhes do Membro"
      hero={<MemberHero member={member} kpis={props.kpis} />}
    >
      <Head title={member.name} />

      <div className="flex flex-col gap-5">
        <Tabs tabs={visibleTabs} active={activeTab} onChange={changeTab} />
        <div>{CONTENT[activeTab](props)}</div>
      </div>
    </AdminLayout>
  );
}
