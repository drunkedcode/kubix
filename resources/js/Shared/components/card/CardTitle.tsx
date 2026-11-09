import type { ComponentType, ReactNode } from 'react';

/** Título de una Card: ícono de marca, texto y una acción opcional a la derecha. */
interface CardTitleProps {
    icon: ComponentType<{ className?: string }>;
    title: string;
    action?: ReactNode;
}

export default function CardTitle({ icon: Icon, title, action }: CardTitleProps) {
    return (
        <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-base font-semibold text-fg">
                <Icon className="h-5 w-5 text-brand-text" />
                {title}
            </h3>
            {action}
        </div>
    );
}
