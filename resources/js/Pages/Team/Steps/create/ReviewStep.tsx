import { useEffect } from "react";
import type { StepProps } from "@/Shared/components/wizards/BaseWizard";
import StepCard from "@/Shared/components/wizards/StepCard";
import type { MemberData, RoleOption } from "./MemberStep";

// La revisión no pide nada: solo muestra lo elegido (siempre es válida).
export type ReviewData = Record<string, never>;

function Section({
  title,
  rows,
}: {
  title: string;
  rows: [string, string | undefined][];
}) {
  return (
    <div className="rounded-lg border border-line p-4">
      <h3 className="mb-2 text-sm font-semibold text-brand-text">{title}</h3>
      <dl className="grid gap-1 text-sm">
        {rows.map(([label, val]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right text-fg">{val || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function ReviewStep({
  onChange,
  data,
  roles = [],
  territoryName,
}: StepProps<ReviewData> & { roles?: RoleOption[]; territoryName?: string }) {
  const member = data.member as MemberData | undefined;

  useEffect(() => {
    onChange({}, true);
  }, [onChange]);

  const roleLabel = roles.find((r) => r.value === member?.role)?.label;

  return (
    <StepCard
      title="Revisão"
      description="Confirme os dados antes de adicionar a pessoa à equipe."
    >
      <Section
        title="Pessoa"
        rows={[
          ["Nome", member?.user?.name],
          ["E-mail", member?.user?.email],
        ]}
      />
      <Section
        title="Atribuição"
        rows={[
          ["Função", roleLabel],
          ["Território", territoryName],
        ]}
      />
    </StepCard>
  );
}