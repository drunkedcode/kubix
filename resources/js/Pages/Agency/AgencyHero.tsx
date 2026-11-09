import { Clock } from 'lucide-react';
import { BRAND } from '@/Shared/brand';

/**
 * AgencyHero.tsx
 * Qué es:  banner de la agencia del barrio (nombre, lema, estado y última actualización).
 * Nota:    sin foto del barrio por ahora; la franja diagonal es de la marca.
 */
interface AgencyHeroProps {
    name: string;
    active: boolean;
    updatedAt: string;
}

export default function AgencyHero({ name, active, updatedAt }: AgencyHeroProps) {
    const updated = new Date(updatedAt).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
    });

    return (
        <section className="relative mb-5 flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-sidebar via-sidebar to-brand/20 px-8 py-7 text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-[38%] w-3 skew-x-[-20deg] bg-brand"
            />

            <div className="relative min-w-0">
                <h1 className="truncate text-3xl font-extrabold tracking-tight">
                    Agência <span className="text-brand">{name}</span>
                </h1>
                <p className="mt-1 text-base font-medium text-slate-200">{BRAND.tagline}</p>
            </div>

            <div className="relative flex flex-col items-end gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
                    <span className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-green-400' : 'bg-rose-400'}`} />
                    {active ? 'Agência Ativa' : 'Agência Inativa'}
                </span>
                <p className="flex items-center gap-1.5 text-xs text-slate-300">
                    Última atualização:
                    <Clock className="h-3.5 w-3.5 text-brand" />
                    <span className="font-medium text-white">{updated}</span>
                </p>
            </div>
        </section>
    );
}
