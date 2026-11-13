import { CheckCheck, CheckCircle2, Megaphone, MessageSquareWarning, Pause, Play, Store, UserMinus, UserPlus, Wallet, Zap } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';

export interface ActivityItem {
    type:
        | 'business_created'
        | 'business_activated'
        | 'member_added'
        | 'member_removed'
        | 'issue_started'
        | 'issue_resolved'
        | 'payment_received'
        | 'promotion_activated'
        | 'promotion_paused'
        | 'promotion_resumed';
    title: string;
    subtitle: string;
    time: string;
}

interface RecentActivityPanelProps {
    items: ActivityItem[];
    className?: string;
    title?: string;
    /** Texto cuando no hay eventos. */
    empty?: string;
}

const KIND = {
    business_created: { icon: Store, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300' },
    business_activated: { icon: CheckCircle2, tone: 'bg-green-500/10 text-green-600 dark:text-green-300' },
    member_added: { icon: UserPlus, tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-300' },
    member_removed: { icon: UserMinus, tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-300' },
    issue_started: { icon: MessageSquareWarning, tone: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' },
    issue_resolved: { icon: CheckCheck, tone: 'bg-green-500/10 text-green-600 dark:text-green-300' },
    payment_received: { icon: Wallet, tone: 'bg-green-500/10 text-green-600 dark:text-green-300' },
    promotion_activated: { icon: Megaphone, tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-300' },
    promotion_paused: { icon: Pause, tone: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' },
    promotion_resumed: { icon: Play, tone: 'bg-purple-500/10 text-purple-600 dark:text-purple-300' },
} as const;

export default function RecentActivityPanel({
    items,
    className,
    title = 'Atividades Recentes',
    empty = 'Ainda não há atividades neste bairro.',
}: RecentActivityPanelProps) {
    return (
        <Card className={className} header={<CardTitle icon={Zap} title={title} />}>
            {items.length === 0 ? (
                <p className="text-sm text-muted">{empty}</p>
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
