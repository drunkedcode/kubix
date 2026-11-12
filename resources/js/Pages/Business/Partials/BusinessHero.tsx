import { BadgeCheck, MapPin, Star } from 'lucide-react';
import { Eye, Megaphone, MousePointerClick, ShoppingCart } from 'lucide-react';
import StatCard, { type StatCardProps } from '@/Shared/components/metrics/cards/StatCard';
import { STATUS, type BusinessStatus } from '../Components/tables/BusinessesTable';

export interface BusinessProfile {
  id: number;
  name: string;
  slug: string;
  status: BusinessStatus;
  category: string;
  location: { latitude: number; longitude: number } | null;
  rating: { score: number; count: number };
  createdAt: string;
}

const KPI_ICONS = { eye: Eye, pointer: MousePointerClick, cart: ShoppingCart, megaphone: Megaphone } as const;

export type BusinessKpi = Omit<StatCardProps, 'icon'> & { icon: keyof typeof KPI_ICONS };

/**
 * BusinessHero.tsx
 * Qué es:  cabecera del detalle de un negocio: tarjeta del negocio y sus 4 KPIs.
 * Nota:    "Ver no Mapa" abre Google Maps con las coordenadas reales del negocio.
 */
interface BusinessHeroProps {
  business: BusinessProfile;
  territoryName: string;
  kpis: BusinessKpi[];
}

export default function BusinessHero({ business, territoryName, kpis }: BusinessHeroProps) {
  const status = STATUS[business.status];
  const mapUrl = business.location
    ? `https://www.google.com/maps?q=${business.location.latitude},${business.location.longitude}`
    : null;

  return (
    <section className="mb-5 grid gap-4 xl:grid-cols-2">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-5">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-3xl font-bold text-brand-text">
          {business.name.charAt(0)}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-fg">
            <span className="truncate">{business.name}</span>
            {business.status === 'active' && <BadgeCheck className="h-5 w-5 shrink-0 text-green-500" />}
          </h1>
          <p className="text-sm text-muted">{business.category}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted">
            <MapPin className="h-4 w-4 shrink-0" />
            {territoryName}
          </p>
          {business.rating.count > 0 ? (
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-fg">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {business.rating.score.toFixed(1)}
              <span className="font-normal text-muted">({business.rating.count} avaliações)</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">Sem avaliações</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-sm font-semibold ${status.text}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
            >
              Ver no Mapa ↗
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} icon={KPI_ICONS[kpi.icon]} />
        ))}
      </div>
    </section>
  );
}
