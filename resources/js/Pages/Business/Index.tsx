import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import { CheckCircle2, ClipboardCheck, Clock, LayoutGrid, Star, Store } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import StatCard, { type StatCardProps } from "@/Shared/components/metrics/cards/StatCard";
import FilterPanel from "@/Shared/components/table/FilterPanel";
import Pagination, { type PageMeta } from "@/Shared/components/table/Pagination";
import { alertConfirm, toastError, toastSuccess } from "@/Shared/alerts";
import SelectField from "@/Shared/ui/forms/SelectField";
import TextField from "@/Shared/ui/forms/TextField";
import Tabs, { type TabItem } from "@/Shared/ui/Tabs";
import { TAB_LABELS } from "@/Layouts/partials/sidebarItems";
import BusinessesTable, {
  SEGMENT_PILL,
  formatBRL,
  type BusinessRow,
} from "./Components/tables/BusinessesTable";

type TabKey = "list" | "approvals" | "categories";

const ALL_TABS: TabItem<TabKey>[] = [
  { key: "list", label: TAB_LABELS.business.list, icon: Store },
  { key: "approvals", label: TAB_LABELS.business.approvals, icon: ClipboardCheck },
  { key: "categories", label: TAB_LABELS.business.categories, icon: LayoutGrid },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Ativos" },
  { value: "standby", label: "Em análise" },
  { value: "inactive", label: "Inativos" },
];

const KPI_ICONS = { store: Store, check: CheckCircle2, clock: Clock, star: Star } as const;

interface CategoryRow {
  segment: string;
  label: string;
  total: number;
  active: number;
}

interface IndexProps {
  tab: TabKey; // pestaña activa (el backend ya garantiza que está permitida)
  tabs: TabKey[]; // pestañas que el usuario puede ver (config/access.php)
  territorySlug: string;
  filters: { search: string; segment: string; status: string[] };
  kpis: (Omit<StatCardProps, "icon"> & { icon: keyof typeof KPI_ICONS })[];
  // list y approvals
  businesses?: { rows: BusinessRow[]; page: PageMeta };
  // list
  segments?: { value: string; label: string }[];
  // approvals
  onboardingPrice?: number | null;
  // categories
  categories?: CategoryRow[];
}

export default function Index(props: IndexProps) {
  const [search, setSearch] = useState(props.filters.search);
  const [segment, setSegment] = useState(props.filters.segment);
  const [statuses, setStatuses] = useState<string[]>(props.filters.status);

  const visibleTabs = ALL_TABS.filter((t) => props.tabs.includes(t.key));

  const visit = (params: Record<string, string | number | string[]>) =>
    router.get(route("businesses.index", { territory: props.territorySlug }), params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });

  // Lista: aplicar filtros vuelve a la página 1; solo viajan los filtros con valor.
  const go = (page?: number) => {
    const params: Record<string, string | number | string[]> = { tab: props.tab };
    if (search.trim()) params.search = search.trim();
    if (segment) params.segment = segment;
    if (statuses.length) params.status = statuses;
    if (page && page > 1) params.page = page;
    visit(params);
  };

  const goPage = (page: number) => visit(page > 1 ? { tab: props.tab, page } : { tab: props.tab });

  const toggleStatus = (value: string) =>
    setStatuses((current) =>
      current.includes(value) ? current.filter((s) => s !== value) : [...current, value],
    );

  // Aprovações: confirma, registra el pago en efectivo y el negocio queda activo.
  const activate = async (row: BusinessRow) => {
    const ok = await alertConfirm(
      `Registrar pagamento de ${row.name}?`,
      `Confirma o recebimento do onboarding em dinheiro (${formatBRL(props.onboardingPrice)}). O negócio será ativado.`,
      "Sim, registrar",
      "Cancelar",
    );
    if (!ok) return;

    router.post(
      route("businesses.activate", { territory: props.territorySlug, business: row.id }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => toastSuccess(`${row.name} foi ativado.`),
        onError: (errors) =>
          toastError(Object.values(errors)[0] ?? "Não foi possível registrar o pagamento."),
      },
    );
  };

  return (
    <AdminLayout
      title="Negócios"
      subtitle="Gerencie os comércios e empresas do seu bairro"
      kpis={props.kpis.map((kpi) => (
        <StatCard key={kpi.label} {...kpi} icon={KPI_ICONS[kpi.icon]} />
      ))}
    >
      <Head title="Negócios" />

      <div className="flex flex-col gap-5">
        <Tabs tabs={visibleTabs} active={props.tab} onChange={(tab) => visit({ tab })} />

        {props.tab === "list" && props.businesses && (
          <div className="grid items-start gap-4 xl:grid-cols-[260px_1fr]">
            <FilterPanel onApply={() => go()}>
              <TextField
                label="Buscar"
                value={search}
                onChange={setSearch}
                placeholder="Buscar por nome..."
              />
              <SelectField
                label="Categoria"
                value={segment}
                onChange={setSegment}
                options={props.segments ?? []}
                placeholder="Todas as categorias"
              />
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-fg">Status</legend>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-fg">
                      <input
                        type="checkbox"
                        checked={statuses.includes(option.value)}
                        onChange={() => toggleStatus(option.value)}
                        className="h-4 w-4 accent-brand"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </FilterPanel>

            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <BusinessesTable rows={props.businesses.rows} territory={props.territorySlug} />
              <Pagination page={props.businesses.page} noun="negócios" onChange={go} />
            </div>
          </div>
        )}

        {props.tab === "approvals" && props.businesses && (
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <BusinessesTable
              mode="approvals"
              rows={props.businesses.rows}
              territory={props.territorySlug}
              onboardingPrice={props.onboardingPrice}
              onActivate={activate}
            />
            <Pagination page={props.businesses.page} noun="negócios" onChange={goPage} />
          </div>
        )}

        {props.tab === "categories" && props.categories && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {props.categories.map((category) => (
              <div key={category.segment} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      SEGMENT_PILL[category.segment] ?? SEGMENT_PILL.other
                    }`}
                  >
                    {category.label}
                  </span>
                  <span className="text-2xl font-bold text-fg">{category.total}</span>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {category.active} {category.active === 1 ? "ativo" : "ativos"}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${category.total > 0 ? (category.active / category.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
