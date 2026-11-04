import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

type Status = 'active' | 'expiring' | 'overdue' | 'trial';

interface BusinessHeaderProps {
    name: string;
    category: string;
    location: string;
    status: Status;
    avatarColor?: string;
    backHref: string;
    backLabel?: string;
}

const STATUS = {
    active: { label: 'Activo', cls: 'bg-teal-400/15 text-teal-300', dot: 'bg-teal-400' },
    expiring: { label: 'Por vencer', cls: 'bg-yellow-400/15 text-yellow-300', dot: 'bg-yellow-400' },
    overdue: { label: 'Vencido', cls: 'bg-rose-400/15 text-rose-300', dot: 'bg-rose-400' },
    trial: { label: 'En prueba', cls: 'bg-sky-400/15 text-sky-300', dot: 'bg-sky-400' },
} as const;

export default function BusinessHeader({
    name,
    category,
    location,
    status,
    avatarColor,
    backHref,
    backLabel = 'Volver a Negocios',
}: BusinessHeaderProps) {
    const st = STATUS[status];

    return (
        <section className="rounded-xl border border-navy-800 bg-navy-900 p-5">
            <Link
                href={backHref}
                className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 transition-colors hover:text-teal-300"
            >
                <ArrowLeft className="h-3.5 w-3.5" /> {backLabel}
            </Link>

            <div className="flex items-center gap-4">
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white ${avatarColor ?? 'bg-navy-700'}`}
                >
                    {name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="truncate text-xl font-bold text-white">{name}</h2>
                    <p className="truncate text-sm text-slate-400">
                        {category} · {location}
                    </p>
                </div>
                <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${st.cls}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                    {st.label}
                </span>
            </div>
        </section>
    );
}