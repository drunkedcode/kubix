import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';

const cn = (...classes: (string | undefined | false | null)[]) =>
    classes.filter(Boolean).join(' ');

/**
 * Card.tsx
 * Qué es:          marco de tarjeta con header, cuerpo y pie opcional.
 * Responsabilidad: dibujar el marco; el contenido llega por props (header, children, footer).
 * Qué NO hace:     no sabe de territorios, negocios ni agencias.
 * Para cambiar:    con href toda la tarjeta es un enlace (Inertia).
 */
export interface CardProps {
    header: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    href?: string;
    className?: string;
}

export default function Card({ header, children, footer, href, className }: CardProps) {
    const frame = cn(
        'flex flex-col overflow-hidden rounded-xl border border-navy-800 bg-navy-900',
        className,
    );

    const content = (
        <>
            <div className="border-b border-navy-800 p-4">{header}</div>
            {children && <div className="flex-1 p-4">{children}</div>}
            {footer && <div className="border-t border-navy-800 px-4 py-3">{footer}</div>}
        </>
    );

    if (href) {
        return (
            <Link href={href} className={cn(frame, 'transition-colors hover:border-teal-500/40')}>
                {content}
            </Link>
        );
    }

    return <div className={frame}>{content}</div>;
}
