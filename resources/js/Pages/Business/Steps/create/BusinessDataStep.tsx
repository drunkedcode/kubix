import { useEffect, useState } from "react";
import TextField from "@/Shared/ui/forms/TextField";
import SelectField from "@/Shared/ui/forms/SelectField";
import type { StepProps } from "@/Shared/components/wizards/BaseWizard";
import StepCard from "@/Shared/components/wizards/StepCard";
import { masks, cleaners } from "@/Shared/ui/forms/helpers/masks";

export interface BusinessData {
  name: string;
  slug: string;
  segment: string;
  phone: string;
}

/** Opción del catálogo de segmentos que manda el backend. */
export interface SegmentOption {
  value: string;
  label: string;
}

type Errors = Partial<Record<keyof BusinessData, string>>;

const EMPTY: BusinessData = { name: "", slug: "", segment: "", phone: "" };

export const slugify = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function validateBusinessData(v: BusinessData): Errors {
  const errors: Errors = {};
  if (v.name.trim().length < 2) errors.name = "Ingresá el nombre del negocio";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.slug))
    errors.slug = "Solo minúsculas, números y guiones";
  if (!v.segment) errors.segment = "Elegí un segmento";
  const phone = v.phone.replace(/\D/g, "");
  if (phone.length < 10 || phone.length > 11)
    errors.phone = "Teléfono con DDD (10 u 11 dígitos)";
  return errors;
}

export default function BusinessDataStep({
  value,
  onChange,
  attempt,
  segments = [],
}: StepProps<BusinessData> & { segments?: SegmentOption[] }) {
  const [values, setValues] = useState<BusinessData>(value ?? EMPTY);
  // Si el slug ya no coincide con el nombre, lo editó a mano: dejamos de generarlo.
  const [slugEdited, setSlugEdited] = useState(
    () => !!value && value.slug !== slugify(value.name),
  );

  const errors = validateBusinessData(values);
  const show = attempt > 0;
  const err = (field: keyof BusinessData) => (show ? errors[field] : undefined);

  useEffect(() => {
    onChange(values, Object.keys(validateBusinessData(values)).length === 0);
  }, [values, onChange]);

  const set = (patch: Partial<BusinessData>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  return (
    <StepCard
      title="Datos del negocio"
      description="Lo básico para dar de alta al cliente. El branding lo configura el responsable desde la PWA."
    >
      <TextField
        label="Nombre del negocio"
        value={values.name}
        onChange={(name: string) =>
          set({ name, ...(slugEdited ? {} : { slug: slugify(name) }) })
        }
        error={err("name")}
      />
      <TextField
        label="Slug (dirección en la PWA)"
        value={values.slug}
        onChange={(v: string) => {
          setSlugEdited(true);
          set({ slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") });
        }}
        error={err("slug")}
      />
      <SelectField
        label="Segmento"
        value={values.segment}
        onChange={(segment: string) => set({ segment })}
        options={segments}
        placeholder="Seleccionar segmento"
        error={err("segment")}
      />
      <TextField
        label="Teléfono del negocio"
        value={masks.phone(values.phone)}
        onChange={(v: string) => set({ phone: cleaners.phone(v) })}
        placeholder="(41) 99999-9999"
        error={err("phone")}
      />
    </StepCard>
  );
}
