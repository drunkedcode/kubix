import { Activity, Boxes, Building2, Store, Users } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';

const ICONS = { building: Building2, store: Store, users: Users, box: Boxes } as const;

const TONES = {
    amber: { icon: 'text-amber-500', bar: 'bg-amber-400' },
    blue: { icon: 'text-blue-500', bar: 'bg-blue-500' },
    purple: { icon: 'text-purple-500', bar: 'bg-purple-500' },
    green: { icon: 'text-green-500', bar: 'bg-green-500' },
} as const;

export interface ModuleStatusItem {
    label: string;
    value: number;
    icon: keyof typeof ICONS;
    tone: keyof typeof TONES;
}

interface ModuleStatusPanelProps {
    items: ModuleStatusItem[];
    className?: string;
}

export default function ModuleStatusPanel({ items, className }: ModuleStatusPanelProps) {
    return (
        <Card className={className} header={<CardTitle icon={Activity} title="Status dos Módulos" />}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map((item) => {
                    const Icon = ICONS[item.icon];
                    const tone = TONES[item.tone];
                    return (
                        <div key={item.label} className="rounded-lg border border-line p-3 text-center">
                            <Icon className={`mx-auto h-6 w-6 ${tone.icon}`} />
                            <p className="mt-1 text-sm font-semibold text-fg">{item.label}</p>
                            <p className="text-sm text-muted">{item.value}%</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                                <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${item.value}%` }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
