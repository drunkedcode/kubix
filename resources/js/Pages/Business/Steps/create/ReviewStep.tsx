import { useEffect, useState } from "react";
import TextField from "@/Shared/ui/forms/TextField";
import type { StepProps } from "@/Shared/components/wizards/BaseWizard";
import type { BusinessData } from "./BusinessDataStep";
import type { LocationData } from "./LocationStep";
import type { ResponsibleData } from "./ResponsibleStep";
import StepCard from "@/Shared/components/wizards/StepCard";
import { masks, cleaners } from "@/Shared/ui/forms/helpers/masks";

export interface ReviewData {
  referralCode: string;
}

type Errors = Partial<Record<keyof ReviewData, string>>;

export function validateReview(v: ReviewData): Errors {
  const errors: Errors = {};
  if (v.referralCode && !/^[A-Za-z0-9-]{3,20}$/.test(v.referralCode))
    errors.referralCode = "3 a 20 caracteres: letras, números y guiones";
  return errors;
}

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
  value,
  onChange,
  attempt,
  data,
  segments = [],
}: StepProps<ReviewData> & { segments?: { value: string; label: string }[] }) {
  const [values, setValues] = useState<ReviewData>(
    value ?? { referralCode: "" },
  );

  const business = data.business as BusinessData | undefined;
  const location = data.location as LocationData | undefined;
  const responsible = data.responsible as ResponsibleData | undefined;

  const errors = validateReview(values);

  useEffect(() => {
    onChange(values, Object.keys(validateReview(values)).length === 0);
  }, [values, onChange]);

  const segmentLabel = segments.find(
    (s) => s.value === business?.segment,
  )?.label;
  const address = [location?.street, location?.number, location?.complement]
    .filter(Boolean)
    .join(", ");

  return (
    <StepCard
      title="Revisión"
      description="Confirmá los datos antes de registrar el negocio."
    >
      <Section
        title="Negocio"
        rows={[
          ["Nombre", business?.name],
          ["Slug", business?.slug],
          ["Segmento", segmentLabel],
          ["Teléfono", masks.phone(business?.phone ?? "")],
        ]}
      />
      <Section
        title="Ubicación"
        rows={[
          ["Dirección", address],
          ["Barrio", location?.neighborhood],
          [
            "Ciudad / Estado",
            `${location?.city ?? ""} / ${location?.state ?? ""}`,
          ],
          ["CEP", masks.cep(location?.cep ?? "")],
          ["Coordenadas", `${location?.latitude}, ${location?.longitude}`],
        ]}
      />
      <Section
        title="Responsable"
        rows={[
          ["Nombre", responsible?.name],
          ["Teléfono", masks.phone(responsible?.phone ?? "")],
          ["Correo", responsible?.email],
        ]}
      />
      <TextField
        label="Código de promotor (opcional)"
        value={values.referralCode}
        onChange={(referralCode: string) => setValues({ referralCode })}
        error={attempt > 0 ? errors.referralCode : undefined}
      />
    </StepCard>
  );
}
