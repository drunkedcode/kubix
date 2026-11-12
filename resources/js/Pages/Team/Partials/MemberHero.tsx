import { CheckCheck, CheckCircle2, Store, Zap } from 'lucide-react';
import StatCard, { type StatCardProps } from '@/Shared/components/metrics/cards/StatCard';

export interface MemberProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  roleLabel: string;
  since: string;
  referralCode: string | null;
}

const KPI_ICONS = { store: Store, check: CheckCircle2, issues: CheckCheck, zap: Zap } as const;

export type MemberKpi = Omit<StatCardProps, 'icon'> & { icon: keyof typeof KPI_ICONS };

const formatPhone = (digits: string) =>
  digits.length === 11 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` : digits;

/**
 * MemberHero.tsx
 * Qué es:  cabecera del detalle de una persona del equipo: su tarjeta y sus 4 números.
 */
export default function MemberHero({ member, kpis }: { member: MemberProfile; kpis: MemberKpi[] }) {
  return (
    <section className="mb-5 grid gap-4 xl:grid-cols-2">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface p-5">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand-soft text-3xl font-bold text-brand-text">
          {member.name.charAt(0).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-bold text-fg">{member.name}</h1>
          <span className="mt-1 inline-block rounded-full bg-surface-2 px-3 py-0.5 text-xs font-medium text-fg">
            {member.roleLabel}
          </span>
          <p className="mt-2 truncate text-sm text-muted">{member.email}</p>
          {member.phone && <p className="text-sm text-muted">{formatPhone(member.phone)}</p>}
          <p className="mt-1 text-xs text-muted">Na equipe desde {member.since}</p>
          {member.referralCode && (
            <p className="text-xs text-muted">
              Código de indicação: <span className="font-mono text-fg">{member.referralCode}</span>
            </p>
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
