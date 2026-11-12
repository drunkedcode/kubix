import { useMemo, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { AlertTriangle, Trash2, UserPlus, Users } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';
import DataTable, { type Column } from '@/Shared/components/table/DataTable';

export interface Member {
    id: number;
    name: string;
    email: string;
    role: string;
    roleLabel: string;
    removable: boolean;
}

interface MembersTabProps {
    members: Member[];
    hasManager: boolean;
    managerLabel: string | null;
    canManage: boolean;
    /** Slug del barrio, para armar las rutas. */
    territory: string;
}

const field =
    'rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-brand focus:outline-none';

/**
 * MembersTab.tsx
 * Qué es:  pestaña Membros de Equipes: buscador, filtro por função y la tabla de personas.
 */
export default function MembersTab({ members, hasManager, managerLabel, canManage, territory }: MembersTabProps) {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');

    const roles = useMemo(() => {
        const unique = new Map(members.map((m) => [m.role, m.roleLabel]));
        return [...unique.entries()].map(([value, label]) => ({ value, label }));
    }, [members]);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        return members.filter(
            (m) =>
                (!role || m.role === role) &&
                (!term || m.name.toLowerCase().includes(term) || m.email.toLowerCase().includes(term)),
        );
    }, [members, search, role]);

    const remove = (member: Member) => {
        if (!window.confirm(`Remover ${member.name} da equipe?`)) return;

        router.delete(route('team.destroy', { territory, user: member.id }), { preserveScroll: true });
    };

    const columns: Column<Member>[] = [
        {
            key: 'member',
            header: 'Membro',
            cell: (m) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-text">
                        {m.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                        <Link
                            href={route('team.show', { territory, user: m.id })}
                            className="block truncate font-semibold text-fg transition-colors hover:text-brand-text"
                        >
                            {m.name}
                        </Link>
                        <p className="truncate text-xs text-muted">{m.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Função',
            cell: (m) => (
                <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-fg">{m.roleLabel}</span>
            ),
        },
        {
            key: 'actions',
            header: '',
            className: 'text-right',
            cell: (m) =>
                canManage && m.removable ? (
                    <button
                        type="button"
                        onClick={() => remove(m)}
                        aria-label={`Remover ${m.name}`}
                        className="cursor-pointer rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-rose-500"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                ) : null,
        },
    ];

    return (
        <div className="space-y-4">
            {!hasManager && managerLabel && (
                <div className="flex items-center gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Este território ainda não tem {managerLabel.toLowerCase()}.
                </div>
            )}

            <Card
                header={
                    <CardTitle
                        icon={Users}
                        title="Membros"
                        action={
                            canManage ? (
                                <Link
                                    href={route('team.create', { territory })}
                                    className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Novo Membro
                                </Link>
                            ) : undefined
                        }
                    />
                }
            >
                <div className="mb-4 flex flex-wrap gap-3">
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nome ou e-mail"
                        className={`${field} min-w-[220px] flex-1`}
                    />
                    <select value={role} onChange={(e) => setRole(e.target.value)} className={field}>
                        <option value="">Todas as funções</option>
                        {roles.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>

                <DataTable
                    columns={columns}
                    rows={visible}
                    rowKey={(m) => m.id}
                    emptyLabel={
                        members.length === 0
                            ? 'Ainda não há pessoas na equipe deste território.'
                            : 'Nenhum membro encontrado com esses filtros.'
                    }
                />
            </Card>
        </div>
    );
}
