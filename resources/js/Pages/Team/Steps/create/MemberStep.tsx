import { useEffect, useState } from "react";
import SelectField from "@/Shared/ui/forms/SelectField";
import type { StepProps } from "@/Shared/components/wizards/BaseWizard";
import StepCard from "@/Shared/components/wizards/StepCard";
import UserLookup, { type LookupUser } from "@/Shared/components/users/UserLookup";

export interface RoleOption {
  value: string;
  label: string;
  description?: string | null;
}

export interface MemberData {
  user: LookupUser | null;
  role: string;
}

type Errors = Partial<Record<keyof MemberData, string>>;

export function validateMember(v: MemberData): Errors {
  const errors: Errors = {};
  if (!v.user) errors.user = "Buscá y elegí un usuario";
  if (!v.role) errors.role = "Elegí el rol";
  return errors;
}

export default function MemberStep({
  value,
  onChange,
  attempt,
  roles = [],
  lookupUrl,
}: StepProps<MemberData> & { roles?: RoleOption[]; lookupUrl: string }) {
  // Si el backend ofrece un solo rol, queda elegido de entrada.
  const [values, setValues] = useState<MemberData>(
    value ?? { user: null, role: roles.length === 1 ? roles[0].value : "" },
  );

  const errors = validateMember(values);
  const show = attempt > 0;

  useEffect(() => {
    onChange(values, Object.keys(validateMember(values)).length === 0);
  }, [values, onChange]);

  const set = (patch: Partial<MemberData>) => setValues((prev) => ({ ...prev, ...patch }));

  const selectedRole = roles.find((r) => r.value === values.role);

  return (
    <StepCard
      title="Persona y rol"
      description="Buscá a la persona por su correo y asignale su rol en este territorio."
    >
      <UserLookup
        lookupUrl={lookupUrl}
        value={values.user}
        onChange={(user) => set({ user })}
        error={show ? errors.user : undefined}
      />

      <div className="grid gap-1">
        <SelectField
          label="Rol"
          value={values.role}
          onChange={(role: string) => set({ role })}
          options={roles.map((r) => ({ value: r.value, label: r.label }))}
          placeholder="Seleccionar rol"
        />
        {selectedRole?.description && (
          <p className="text-xs text-slate-400">{selectedRole.description}</p>
        )}
        {show && errors.role && <p className="text-xs text-rose-400">{errors.role}</p>}
      </div>
    </StepCard>
  );
}