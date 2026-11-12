import { Head, router } from "@inertiajs/react";
import { CheckCheck, LayoutDashboard, MessageSquareWarning } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import type { ScopeOption } from "@/Layouts/partials/Header";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";
import GeneralTab, { type IssuesSummary } from "./Tabs/GeneralTab";
import IssuesListTab, { type Issue } from "./Tabs/IssuesListTab";

type TabKey = "general" | "open" | "resolved";

interface IndexProps {
  tab: TabKey; // pestaña activa (el backend ya garantiza que está permitida)
  tabs: TabKey[]; // pestañas que el usuario puede ver (config/access.php)
  scope: ScopeOption;
  canManage: boolean; // puede iniciar y resolver reclamos (manage-issues)
  summary: IssuesSummary;
  recent: Issue[];
  open: Issue[];
  resolved: Issue[];
}

const ALL_TABS: TabItem<TabKey>[] = [
  { key: "general", label: "Geral", icon: LayoutDashboard },
  { key: "open", label: "Abertos", icon: MessageSquareWarning },
  { key: "resolved", label: "Resolvidos", icon: CheckCheck },
];

const CONTENT: Record<TabKey, (p: IndexProps) => React.ReactNode> = {
  general: (p) => <GeneralTab summary={p.summary} recent={p.recent} territory={p.scope.value} canManage={p.canManage} />,
  open: (p) => <IssuesListTab issues={p.open} title="Reclamações Abertas" territory={p.scope.value} canManage={p.canManage} />,
  resolved: (p) => <IssuesListTab issues={p.resolved} title="Reclamações Resolvidas" territory={p.scope.value} canManage={p.canManage} />,
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
    <AdminLayout title="Issues" subtitle={`Reclamações de ${props.scope.label}`}>
      <Head title="Issues" />

      <div className="flex flex-col gap-5">
        <Tabs tabs={visibleTabs} active={props.tab} onChange={changeTab} />
        <div>{CONTENT[props.tab](props)}</div>
      </div>
    </AdminLayout>
  );
}
