import { Head, Link, router, usePage } from "@inertiajs/react";
import { UserPlus, Trash2, AlertTriangle } from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";

interface Member {
    id: number;
    name: string;
    email: string;
    role: string;
    roleLabel: string;
    removable: boolean;
}

interface IndexProps {
    members: Member[];
    hasManager: boolean;
    managerLabel: string | null;
    canManage: boolean;
}

interface SharedProps {
    territory?: { slug: string; name: string } | null;
    [key: string]: unknown;
}

export default function Index({ members, hasManager, managerLabel, canManage }: IndexProps) {
    const territory = usePage<SharedProps>().props.territory!;

    const remove = (member: Member) => {
        if (!window.confirm(`¿Quitar a ${member.name} del equipo?`)) return;

        router.delete(route("team.destroy", { territory: territory.slug, user: member.id }), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout title="Equipo" subtitle={`Personas que trabajan en ${territory.name}`}>
            <Head title="Equipo" />

            <div className="mx-auto w-full max-w-4xl space-y-4 p-2 sm:p-6">
                {!hasManager && managerLabel && (
                    <div className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        Este territorio todavía no tiene {managerLabel.toLowerCase()}.
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-100">Miembros</h2>

                    {canManage && (
                        <Link
                            href={route("team.create", { territory: territory.slug })}
                            className="flex items-center gap-2 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-navy-950 transition-colors hover:bg-teal-400"
                        >
                            <UserPlus className="h-4 w-4" />
                            Nuevo miembro
                        </Link>
                    )}
                </div>

                {members.length === 0 ? (
                    <div className="rounded-xl border border-navy-700 bg-navy-800/40 p-8 text-center text-sm text-slate-400">
                        Todavía no hay personas en el equipo de este territorio.
                    </div>
                ) : (
                    <ul className="divide-y divide-navy-800 overflow-hidden rounded-xl border border-navy-700 bg-navy-800/40">
                        {members.map((m) => (
                            <li key={m.id} className="flex items-center justify-between gap-4 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">{m.name}</p>
                                    <p className="text-xs text-slate-400">{m.email}</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-300">
                                        {m.roleLabel}
                                    </span>

                                    {canManage && m.removable && (
                                        <button
                                            type="button"
                                            onClick={() => remove(m)}
                                            aria-label={`Quitar a ${m.name}`}
                                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-navy-800 hover:text-rose-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </AdminLayout>
    );
}