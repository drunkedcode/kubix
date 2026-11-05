export interface Issue {
  id: number;
  title: string;
  reporter: string;
  category: string;
  status: "new" | "in_progress" | "resolved";
  age_days: number;
}

const STATUS_LABEL: Record<Issue["status"], string> = {
  new: "Nuevo",
  in_progress: "En curso",
  resolved: "Resuelto",
};

export default function IssuesListTab({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) {
    return <p className="p-6 text-sm text-fg/60">No hay reclamos en esta lista.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {issues.map((issue) => (
        <li
          key={issue.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-fg/10 p-4"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{issue.title}</p>
            <p className="text-xs text-fg/60">
              {issue.category} · {issue.reporter} · hace {issue.age_days} días
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-fg/10 px-3 py-1 text-xs">
            {STATUS_LABEL[issue.status]}
          </span>
        </li>
      ))}
    </ul>
  );
}
