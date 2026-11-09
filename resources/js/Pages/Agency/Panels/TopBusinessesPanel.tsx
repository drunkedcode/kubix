import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowUp, Star, Trophy } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';

export interface TopBusiness {
    id: number;
    name: string;
    segment: string | null;
    rating: number;
    trend: number;
}

interface TopBusinessesPanelProps {
    items: TopBusiness[];
    /** Slug del barrio, para armar la ruta de cada negocio. */
    territory: string;
    className?: string;
}

export default function TopBusinessesPanel({ items, territory, className }: TopBusinessesPanelProps) {
    return (
        <Card
            className={className}
            header={
                <CardTitle
                    icon={Trophy}
                    title="Top Negócios do Bairro"
                    action={
                        <Link
                            href={route('businesses.index', { territory })}
                            className="flex items-center gap-1 text-xs font-semibold text-brand-text hover:underline"
                        >
                            Ver todos <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    }
                />
            }
        >
            {items.length === 0 ? (
                <p className="text-sm text-muted">Ainda não há negócios ativos neste bairro.</p>
            ) : (
                <ul className="space-y-1">
                    {items.map((business, index) => (
                        <li key={business.id}>
                            <Link
                                href={route('businesses.show', { territory, business: business.id })}
                                className="flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-surface-2"
                            >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-muted">
                                    {index + 1}
                                </span>
                                <span className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-lg font-bold text-brand-text">
                                    {business.name.charAt(0)}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-fg">{business.name}</span>
                                    <span className="flex items-center gap-2 text-xs text-muted">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        {business.rating.toFixed(1)}
                                        <span className="flex items-center font-semibold text-green-600 dark:text-green-400">
                                            <ArrowUp className="h-3 w-3" />+{business.trend}%
                                        </span>
                                    </span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </Card>
    );
}
