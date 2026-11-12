import type { FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import TextField from "@/Shared/ui/forms/TextField";

/** Precios del barrio, en centavos de real (null = sin definir). */
export interface SettingsData {
  onboarding_price: number | null;
  daily_price: number | null;
  promotion_price: number | null;
}

/** En pantalla se escriben en R$; al enviar se convierten a centavos. */
type FormState = {
  onboarding_price: string;
  daily_price: string;
  promotion_price: string;
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
    promotion_price: toReais(data.promotion_price),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    transform((d) => ({
      onboarding_price: toCents(d.onboarding_price),
      daily_price: toCents(d.daily_price),
      promotion_price: toCents(d.promotion_price),
    }));
    post(route("agencies.settings.update", { territory }), { preserveScroll: true });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pb-6">
      <div className="rounded-xl border border-line bg-surface p-4">
        <p className="text-sm font-semibold text-fg">Preços do bairro</p>
        <p className="mt-1 text-xs text-muted">
          O que cada negócio deste bairro paga. Os preços por porte do negócio chegarão mais adiante.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <TextField
              label="Onboarding (R$)"
              value={form.onboarding_price}
              onChange={(v) => setData("onboarding_price", onlyMoney(v))}
              placeholder="0,00"
              error={errors.onboarding_price}
            />
            <p className="mt-1 text-xs text-muted">Cobrado uma vez, quando o negócio entra no bairro.</p>
          </div>
          <div>
            <TextField
              label="Diária (R$)"
              value={form.daily_price}
              onChange={(v) => setData("daily_price", onlyMoney(v))}
              placeholder="0,00"
              error={errors.daily_price}
            />
            <p className="mt-1 text-xs text-muted">Preço por dia do mural.</p>
          </div>
          <div>
            <TextField
              label="Promoção (R$)"
              value={form.promotion_price}
              onChange={(v) => setData("promotion_price", onlyMoney(v))}
              placeholder="0,00"
              error={errors.promotion_price}
            />
            <p className="mt-1 text-xs text-muted">Cobrado a cada promoção publicada por um negócio.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={processing}
          className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brand-fg transition hover:bg-brand-hover disabled:opacity-50"
        >
          {processing ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
