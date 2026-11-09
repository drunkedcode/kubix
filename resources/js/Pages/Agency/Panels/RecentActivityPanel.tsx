import { CheckCircle2, Store, Zap } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';

export interface ActivityItem {
    type: 'business_created' | 'business_activated';
    title: string;
    subtitle: string;
    time: string;
}

interface RecentActivityPanelProps {
    items: ActivityItem[];
    className?: string;
}

const KIND = {
    business_created: { icon: Store, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300' },
    business_activated: { icon: CheckCircle2, tone: 'bg-green-500/10 text-green-600 dark:text-green-300' },
} as const;

export default function RecentActivityPanel({ items, className }: RecentActivityPanelProps) {
    return (
        <Card className={className} header={<CardTitle icon={Zap} title="Atividades Recentes" />}>
            {items.length === 0 ? (
                <p className="text-sm text-muted">Ainda não há atividades neste bairro.</p>
            ) : (
                <ul className="divide-y divide-line">
                    {items.map((item, index) => {
                        const { icon: Icon, tone } = KIND[item.type];
                        return (
                            <li key={`${item.type}-${item.subtitle}-${index}`} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-fg">{item.title}</span>
                                    <span className="block truncate text-xs text-muted">{item.subtitle}</span>
                                </span>
                                <span className="shrink-0 text-[11px] text-muted">{item.time}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </Card>
    );
}
