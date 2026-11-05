import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import type { ScopeOption } from "@/Layouts/partials/Header";
import GeneralTab, { type IssuesSummary } from "./Tabs/GeneralTab";
import IssuesListTab, { type Issue } from "./Tabs/IssuesListTab";
import { CheckCheck, LayoutDashboard, MessageSquareWarning } from "lucide-react";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";

type TabKey = "general" | "open" | "resolved";

interface IndexProps {
  tab: TabKey; // pestaña activa (el backend ya garantiza que está permitida)
  tabs: TabKey[]; // pestañas que el usuario puede ver (config/access.php)
  scope: ScopeOption;
  summary: IssuesSummary;
  open: Issue[];
  resolved: Issue[];
}

const ALL_TABS: TabItem<TabKey>[] = [
  { key: "general", label: "General", icon: LayoutDashboard },
  { key: "open", label: "Abiertos", icon: MessageSquareWarning },
  { key: "resolved", label: "Resueltos", icon: CheckCheck },
];

const CONTENT: Record<TabKey, (p: IndexProps) => React.ReactNode> = {
  general: (p) => <GeneralTab summary={p.summary} />,
  open: (p) => <IssuesListTab issues={p.open} />,
  resolved: (p) => <IssuesListTab issues={p.resolved} />,
};

export default function Index(props: IndexProps) {
  const visibleTabs = ALL_TABS.filter((t) => props.tabs.includes(t.key));

  const changeTab = (tab: TabKey) =>
    router.get(
      route("issues.index", { territory: props.scope.value }),
      { tab },
      { preserveState: true, preserveScroll: true, replace: true },
    );

  return (
    <AdminLayout title="Issues" subtitle={`Reclamos de ${props.scope.label}`}>
      <Head title="Issues" />

      <div className="flex flex-col gap-2">
        <Tabs tabs={visibleTabs} active={props.tab} onChange={changeTab} />
        <div>{CONTENT[props.tab](props)}</div>
      </div>
    </AdminLayout>
  );
}
