import type { ComponentType, ReactNode } from 'react';

/**
 * PageHeader.tsx
 * Qué es:          cabecera de cada página: ícono, título y subtítulo, con los KPIs a la derecha.
 * Para cambiar:    los KPIs llegan como children (normalmente 4 StatCard).
 */
interface PageHeaderProps {
    icon: ComponentType<{ className?: string }>;
    title: string;
    subtitle?: string;
    children?: ReactNode;
}

export default function PageHeader({ icon: Icon, title, subtitle, children }: PageHeaderProps) {
    return (
        <section className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand-text">
                    <Icon className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold text-fg">{title}</h1>
                    {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
                </div>
            </div>

            {children && (
                <div className="grid gap-3 sm:grid-cols-2 xl:w-[64%] xl:grid-cols-4">{children}</div>
            )}
        </section>
    );
}
