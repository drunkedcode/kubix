import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";
import { LayoutDashboard, List, Settings } from "lucide-react";

type TabKey = "general" | "lista" | "config";

interface IndexProps {
  territorySlug: string;
  tab: TabKey;
}

const TABS: TabItem<TabKey>[] = [
  { key: "general", label: "General", icon: LayoutDashboard },
  { key: "lista", label: "Lista", icon: List },
  { key: "config", label: "Configuración", icon: Settings },
];

const CONTENT: Record<TabKey, () => React.ReactNode> = {
  general: () => <div className="p-4 rounded-xl border border-line bg-card text-fg">Vista General de Negocios</div>,
  lista: () => <div className="p-4 rounded-xl border border-line bg-card text-fg">Vista de Lista de Negocios</div>,
  config: () => <div className="p-4 rounded-xl border border-line bg-card text-fg">Configuración de Negocios</div>,
};

export default function Index({ territorySlug, tab }: IndexProps) {
  const activeTab: TabKey = CONTENT[tab] ? tab : "general";

  const changeTab = (newTab: TabKey) =>
    router.get(
      route("businesses.index", { territory: territorySlug }),
      { tab: newTab },
      { preserveState: true, preserveScroll: true, replace: true },
    );

  return (
    <AdminLayout title="Negocios" subtitle={`Territorio: ${territorySlug}`}>
      <Head title="Negocios" />

      <div className="flex flex-col gap-4">
        <Tabs tabs={TABS} active={activeTab} onChange={changeTab} />
        <div>{CONTENT[activeTab]()}</div>
      </div>
    </AdminLayout>
  );
}