import { router } from "@inertiajs/react";
import { MessageSquareWarning } from "lucide-react";
import Card from "@/Shared/components/card/Card";
import CardTitle from "@/Shared/components/card/CardTitle";
import DataTable, { type Column } from "@/Shared/components/table/DataTable";
import { alertConfirm, toastError } from "@/Shared/alerts";

export interface Issue {
  id: number;
  title: string;
  reporter: string;
  category: string;
  status: "new" | "in_progress" | "resolved";
  age_days: number;
}

const STATUS: Record<Issue["status"], { label: string; pill: string }> = {
  new: { label: "Novo", pill: "bg-blue-500/10 text-blue-600 dark:text-blue-300" },
  in_progress: { label: "Em andamento", pill: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  resolved: { label: "Resolvido", pill: "bg-green-500/10 text-green-600 dark:text-green-300" },
};

const ACTION =
  "cursor-pointer rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-2";

interface IssuesListTabProps {
  issues: Issue[];
  title: string;
  /** Slug del barrio (para la ruta de las acciones). */
  territory: string;
  /** Si la persona puede iniciar y resolver reclamos (permiso manage-issues). */
  canManage: boolean;
}

/**
 * IssuesListTab.tsx
 * Qué es:  tarjeta con la tabla de reclamos que recibe (abiertos, resueltos o los recientes),
 *          con las acciones Iniciar y Resolver para quien puede gestionarlos.
 */
export default function IssuesListTab({ issues, title, territory, canManage }: IssuesListTabProps) {
  const change = (issue: Issue, status: "in_progress" | "resolved") =>
    router.post(
      route("issues.status", { territory, issue: issue.id }),
      { status },
      {
        preserveScroll: true,
        onError: (errors) => toastError(Object.values(errors)[0] ?? "Não foi possível atualizar a reclamação."),
      },
    );

  const resolve = async (issue: Issue) => {
    const ok = await alertConfirm("Resolver reclamação?", issue.title, "Sim, resolver", "Cancelar");
    if (ok) change(issue, "resolved");
  };

  const columns: Column<Issue>[] = [
    {
      key: "title",
      header: "Reclamação",
      cell: (issue) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">{issue.title}</p>
          <p className="text-xs text-muted">{issue.category}</p>
        </div>
      ),
    },
    { key: "reporter", header: "Reportado por", cell: (issue) => <span className="text-fg">{issue.reporter}</span> },
    {
      key: "age",
      header: "Idade",
      cell: (issue) => <span className="text-muted">{issue.age_days === 0 ? "hoje" : `há ${issue.age_days} dias`}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (issue) => (
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS[issue.status].pill}`}>
          {STATUS[issue.status].label}
        </span>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: "",
      className: "text-right",
      cell: (issue) =>
        issue.status === "resolved" ? null : (
          <div className="flex justify-end gap-2">
            {issue.status === "new" && (
              <button type="button" onClick={() => change(issue, "in_progress")} className={ACTION}>
                Iniciar
              </button>
            )}
            <button type="button" onClick={() => resolve(issue)} className={ACTION}>
              Resolver
            </button>
          </div>
        ),
    });
  }

  return (
    <Card header={<CardTitle icon={MessageSquareWarning} title={title} />}>
      <DataTable
        columns={columns}
        rows={issues}
        rowKey={(issue) => issue.id}
        emptyLabel="Nenhuma reclamação nesta lista."
      />
    </Card>
  );
}
