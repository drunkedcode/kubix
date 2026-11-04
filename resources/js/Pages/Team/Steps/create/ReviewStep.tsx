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
    <div className="rounded-lg border border-navy-700 p-4">
      <h3 className="mb-2 text-sm font-semibold text-teal-400">{title}</h3>
      <dl className="grid gap-1 text-sm">
        {rows.map(([label, val]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-slate-400">{label}</dt>
            <dd className="text-right text-slate-200">{val || "—"}</dd>
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
      title="Revisión"
      description="Confirmá los datos antes de agregar a la persona al equipo."
    >
      <Section
        title="Persona"
        rows={[
          ["Nombre", member?.user?.name],
          ["Correo", member?.user?.email],
        ]}
      />
      <Section
        title="Asignación"
        rows={[
          ["Rol", roleLabel],
          ["Territorio", territoryName],
        ]}
      />
    </StepCard>
  );
}