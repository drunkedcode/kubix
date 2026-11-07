import type { FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import TextField from "@/Shared/ui/forms/TextField";

/** Precios del barrio, en centavos de real (null = sin definir). */
export interface SettingsData {
  onboarding_price: number | null;
  daily_price: number | null;
}

/** En pantalla se escriben en R$; al enviar se convierten a centavos. */
type FormState = {
  onboarding_price: string;
  daily_price: string;
};

const toReais = (cents: number | null): string =>
  cents === null ? "" : (cents / 100).toFixed(2).replace(".", ",");

const toCents = (reais: string): number | null => {
  const normalized = reais.includes(",") ? reais.replace(/\./g, "").replace(",", ".") : reais;
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? null : Math.round(value * 100);
};

// Solo dígitos y separador decimal.
const onlyMoney = (value: string) => value.replace(/[^\d.,]/g, "");

export default function SettingsTab({ data, territory }: { data: SettingsData; territory: string }) {
  const { data: form, setData, post, processing, errors, transform } = useForm<FormState>({
    onboarding_price: toReais(data.onboarding_price),
    daily_price: toReais(data.daily_price),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    transform((d) => ({
      onboarding_price: toCents(d.onboarding_price),
      daily_price: toCents(d.daily_price),
    }));
    post(route("agencies.settings.update", { territory }), { preserveScroll: true });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pb-6">
      <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
        <p className="text-sm font-semibold text-white">Precios del barrio</p>
        <p className="mt-1 text-xs text-slate-400">
          Lo que paga cada negocio de este barrio. Los precios por tamaño de negocio llegarán más adelante.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <TextField
              label="Onboarding (R$)"
              value={form.onboarding_price}
              onChange={(v) => setData("onboarding_price", onlyMoney(v))}
              placeholder="0,00"
              error={errors.onboarding_price}
            />
            <p className="mt-1 text-xs text-slate-500">Se cobra una vez, cuando el negocio entra al barrio.</p>
          </div>
          <div>
            <TextField
              label="Diaria (R$)"
              value={form.daily_price}
              onChange={(v) => setData("daily_price", onlyMoney(v))}
              placeholder="0,00"
              error={errors.daily_price}
            />
            <p className="mt-1 text-xs text-slate-500">Precio por día del mural.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={processing}
          className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-teal-400 disabled:opacity-50"
        >
          {processing ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
