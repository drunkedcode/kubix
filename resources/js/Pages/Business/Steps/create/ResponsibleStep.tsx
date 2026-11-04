import { useEffect, useState } from "react";
import TextField from "@/Shared/ui/forms/TextField";
import type { StepProps } from "@/Shared/components/wizards/BaseWizard";
import StepCard from "@/Shared/components/wizards/StepCard";
import { masks, cleaners } from "@/Shared/ui/forms/helpers/masks";

export interface ResponsibleData {
  name: string;
  phone: string;
  email: string;
}

type Errors = Partial<Record<keyof ResponsibleData, string>>;

const EMPTY: ResponsibleData = { name: "", phone: "", email: "" };

export function validateResponsible(v: ResponsibleData): Errors {
  const errors: Errors = {};
  const phone = v.phone.replace(/\D/g, "");
  const email = v.email.trim();

  if (v.name.trim().length < 2)
    errors.name = "Ingresá el nombre del responsable";
  if (phone && (phone.length < 10 || phone.length > 11))
    errors.phone = "Teléfono con DDD (10 u 11 dígitos)";
  if (email && !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Correo inválido";
  if (!phone && !email) {
    errors.phone = "Ingresá teléfono o correo";
    errors.email = "Ingresá teléfono o correo";
  }
  return errors;
}

export default function ResponsibleStep({
  value,
  onChange,
  attempt,
}: StepProps<ResponsibleData>) {
  const [values, setValues] = useState<ResponsibleData>(value ?? EMPTY);

  const errors = validateResponsible(values);
  const show = attempt > 0;
  const err = (field: keyof ResponsibleData) =>
    show ? errors[field] : undefined;

  useEffect(() => {
    onChange(values, Object.keys(validateResponsible(values)).length === 0);
  }, [values, onChange]);

  const set = (patch: Partial<ResponsibleData>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  return (
    <StepCard
      title="Responsable"
      description="Es quien recibirá el código de activación para entrar a la PWA."
    >
      <TextField
        label="Nombre del responsable"
        value={values.name}
        onChange={(name: string) => set({ name })}
        error={err("name")}
      />
      <TextField
        label="Teléfono"
        value={masks.phone(values.phone)}
        onChange={(v: string) => set({ phone: cleaners.phone(v) })}
        placeholder="(41) 99999-9999"
        error={err("phone")}
      />
      <TextField
        label="Correo"
        value={values.email}
        onChange={(email: string) => set({ email })}
        placeholder="responsable@negocio.com"
        error={err("email")}
      />
    </StepCard>
  );
}
