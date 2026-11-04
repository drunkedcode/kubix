import SelectField from '@/Shared/ui/forms/SelectField';

export interface Option {
  value: string;
  label: string;
  active?: boolean;
}

export interface TerritorySelection {
  country?: string | null;
  state?: string | null;
  city?: string | null;
  neighborhood?: string | null;
}

interface TerritoryFilterBarProps {
  selection: TerritorySelection;
  onSelectionChange: (nextSelection: TerritorySelection) => void;
  countries?: Option[];
  states?: Option[];
  cities?: Option[];
  neighborhoods?: Option[];
  className?: string;
  /** 'card' = barra con labels (páginas) · 'inline' = compacta, sin labels (header). */
  variant?: 'card' | 'inline';
  /** Si el primer nivel visible ofrece "Todos". En 'inline', el gerente de un solo barrio no lo necesita. */
  allowAll?: boolean;
}

const LEVELS = ['country', 'state', 'city', 'neighborhood'] as const;
type Level = (typeof LEVELS)[number];

const toOptions = (list?: Option[]) =>
  (list ?? []).map((o) => ({
    value: o.value,
    label: `${o.active ? '● ' : ''}${o.label}`,
  }));

export default function TerritoryFilterBar({
  selection = {},
  onSelectionChange,
  countries = [],
  states = [],
  cities = [],
  neighborhoods = [],
  className = '',
  variant = 'card',
  allowAll = true,
}: TerritoryFilterBarProps) {
  const inline = variant === 'inline';

  const handleSelect = (level: Level, value: string) => {
    const next: Record<string, string | undefined | null> = {};
    const idx = LEVELS.indexOf(level);

    // Copiar niveles superiores
    for (let i = 0; i < idx; i++) {
      const l = LEVELS[i];
      if (selection[l]) next[l] = selection[l];
    }

    // Establecer valor actual
    next[level] = value || undefined;

    // Limpiar niveles inferiores
    for (let i = idx + 1; i < LEVELS.length; i++) {
      next[LEVELS[i]] = undefined;
    }

    // Emitir al padre — él decide cómo navegar
    onSelectionChange(next);
  };

  const lists: Record<Level, Option[]> = {
    country: countries,
    state: states,
    city: cities,
    neighborhood: neighborhoods,
  };

  // En 'card' País siempre se muestra; en 'inline' solo los niveles con opciones.
  const visible = (level: Level) => (level === 'country' && !inline) || lists[level].length > 0;
  const firstVisible = LEVELS.find(visible);

  const config: Record<Level, { label: string; width: string; placeholder: string; inlinePlaceholder: string }> = {
    country: { label: 'País', width: 'w-40', placeholder: 'Todos los países', inlinePlaceholder: 'Todos' },
    state: { label: 'Estado', width: 'w-48', placeholder: 'Seleccionar estado', inlinePlaceholder: 'Todos' },
    city: { label: 'Ciudad', width: 'w-56', placeholder: 'Seleccionar ciudad', inlinePlaceholder: 'Todos' },
    neighborhood: { label: 'Barrio', width: 'w-56', placeholder: 'Seleccionar barrio', inlinePlaceholder: 'Todos' },
  };

  const wrapper = inline
    ? `flex items-center gap-2 ${className}`
    : `flex flex-wrap items-end gap-3 rounded-xl border border-line bg-surface p-4 ${className}`;

  return (
    <div className={wrapper}>
      {LEVELS.filter(visible).map((level) => {
        const c = config[level];
        // El primer nivel visible sin "Todos" (un solo nodo) no lleva placeholder.
        const noAll = inline && level === firstVisible && !allowAll;

        return (
          <SelectField
            key={level}
            className={inline ? 'w-40' : c.width}
            label={inline ? undefined : c.label}
            value={selection[level] ?? ''}
            onChange={(v) => handleSelect(level, v)}
            options={toOptions(lists[level])}
            placeholder={noAll ? undefined : inline ? c.inlinePlaceholder : c.placeholder}
          />
        );
      })}

      {!inline && <p className="ml-auto text-xs text-muted">● = ya operado</p>}
    </div>
  );
}