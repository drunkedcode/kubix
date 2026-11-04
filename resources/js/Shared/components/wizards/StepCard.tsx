import type { ReactNode } from "react";

interface StepCardProps {
    title: string;
    description?: string;
    children: ReactNode;
}

/** Contenedor estándar de los formularios de un wizard. */
export default function StepCard({ title, description, children }: StepCardProps) {
    return (
        <section className="mx-auto w-full max-w-lg rounded-xl border border-navy-700 bg-navy-800/40 p-6 shadow-sm">
            <header className="mb-5">
                <h2 className="text-base font-semibold text-slate-100">
                    {title}
                </h2>
                {description && (
                    <p className="mt-1 text-sm text-slate-400">{description}</p>
                )}
            </header>
            <div className="grid gap-4">{children}</div>
        </section>
    );
}