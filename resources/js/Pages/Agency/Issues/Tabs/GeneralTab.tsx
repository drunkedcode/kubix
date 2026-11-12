import { CheckCheck, Clock, MessageSquareWarning } from "lucide-react";
import StatCard from "@/Shared/components/metrics/cards/StatCard";
import IssuesListTab, { type Issue } from "./IssuesListTab";

export interface IssuesSummary {
  open: number;
  resolved: number;
  oldest_days: number;
}

/**
 * GeneralTab.tsx (Issues)
 * Qué es:  resumen de reclamos del barrio y los últimos recibidos.
 */
interface GeneralTabProps {
  summary: IssuesSummary;
  recent: Issue[];
  territory: string;
  canManage: boolean;
}

export default function GeneralTab({ summary, recent, territory, canManage }: GeneralTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Abertos" value={summary.open} icon={MessageSquareWarning} tone="amber" />
        <StatCard label="Resolvidos" value={summary.resolved} icon={CheckCheck} tone="green" />
        <StatCard label="Mais antigo sem resolver" value={`${summary.oldest_days} dias`} icon={Clock} tone="rose" />
      </div>

      <IssuesListTab issues={recent} title="Reclamações Recentes" territory={territory} canManage={canManage} />
    </div>
  );
}
