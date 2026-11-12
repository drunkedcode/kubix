import { Radio } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';

export interface OnlineData {
    total: number;
    team: number;
    app: number;
    people: { id: number; name: string }[];
}

interface OnlinePanelProps {
    data: OnlineData;
    className?: string;
}

/**
 * OnlinePanel.tsx
 * Qué es:  quién está online ahora en el barrio (actividad en los últimos 5 minutos):
 *          el equipo (admin) y los usuarios de la app.
 */
export default function OnlinePanel({ data, className }: OnlinePanelProps) {
    return (
        <Card className={className} header={<CardTitle icon={Radio} title="Online agora" />}>
            <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                    <span className={`absolute inline-flex h-full w-full rounded-full bg-green-500 ${data.total > 0 ? 'animate-ping opacity-60' : 'hidden'}`} />
                    <span className={`relative inline-flex h-3 w-3 rounded-full ${data.total > 0 ? 'bg-green-500' : 'bg-muted'}`} />
                </span>
                <p className="text-3xl font-bold text-fg">{data.total}</p>
                <p className="text-sm text-muted">{data.total === 1 ? 'pessoa online' : 'pessoas online'}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-line p-3 text-center">
                    <p className="text-xl font-semibold text-fg">{data.team}</p>
                    <p className="text-xs text-muted">Equipe</p>
                </div>
                <div className="rounded-lg border border-line p-3 text-center">
                    <p className="text-xl font-semibold text-fg">{data.app}</p>
                    <p className="text-xs text-muted">Usuários do app</p>
                </div>
            </div>

            {data.people.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                    {data.people.map((person) => (
                        <li key={person.id} className="flex items-center gap-2 text-sm text-fg">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            {person.name}
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
