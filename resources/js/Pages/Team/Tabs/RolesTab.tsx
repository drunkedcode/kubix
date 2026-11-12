import { Check, ShieldCheck, Users } from 'lucide-react';
import Card from '@/Shared/components/card/Card';
import CardTitle from '@/Shared/components/card/CardTitle';

export interface RoleRow {
    key: string;
    label: string;
    description: string | null;
    /** Tipo de território que gerencia (solo las funciones de gerente). */
    level: string | null;
    /** Tipos de território donde se puede asignar (funciones de equipo). */
    levels: string[];
    members: number;
    permissions: string[];
}

export interface PermissionRow {
    name: string;
    module: string;
    page: string | null;
    tab: string | null;
    kind: 'tab' | 'action';
}

interface RolesTabProps {
    roles: RoleRow[];
    catalog: PermissionRow[];
}

const LEVELS: Record<string, string> = { country: 'País', state: 'Estado', city: 'Cidade', neighborhood: 'Bairro' };

const MODULES: Record<string, string> = {
    overview: 'Visão Geral',
    agency: 'Agência',
    business: 'Negócios',
    team: 'Equipes',
    territories: 'Territórios',
    advertising: 'Tráfego pago',
    issues: 'Issues',
};

const PAGES: Record<string, string> = { show: 'Detalhe', issues: 'Issues' };

const TABS: Record<string, string> = {
    general: 'Geral',
    evolution: 'Evolução',
    settings: 'Configurações',
    issues: 'Issues',
    list: 'Lista',
    approvals: 'Aprovações',
    categories: 'Categorias',
    profile: 'Visão Geral',
    finance: 'Financeiro',
    traffic: 'Tráfego',
    ads: 'Campanhas',
    members: 'Membros',
    roles: 'Funções e Permissões',
    businesses: 'Negócios',
    activities: 'Atividades',
    history: 'Histórico',
};

const ACTIONS: Record<string, string> = {
    'manage-business': 'Gerenciar negócios',
    'manage-advertising': 'Gerenciar tráfego pago',
    'manage-issues': 'Resolver issues',
    'manage-team': 'Adicionar e remover pessoas da equipe',
};

const humanize = (key: string) => {
    const text = key.replace(/[-_]/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const labelOf = (p: PermissionRow) => {
    if (p.kind === 'action') return ACTIONS[p.name] ?? humanize(p.name);

    const page = p.page && p.page !== 'index' ? (PAGES[p.page] ?? humanize(p.page)) : null;
    const tab = TABS[p.tab ?? ''] ?? humanize(p.tab ?? p.name);

    return [page, tab].filter(Boolean).join(' › ');
};

/**
 * RolesTab.tsx
 * Qué es:  pestaña Funções e Permissões de Equipes (solo lectura): cada función de equipo, cuántas
 *          personas la tienen y una matriz con lo que puede hacer. Sale del catálogo, así que un
 *          módulo o pestaña nuevo aparece solo.
 */
export default function RolesTab({ roles, catalog }: RolesTabProps) {
    const groups = catalog.reduce<Record<string, PermissionRow[]>>((acc, p) => {
        (acc[p.module] ??= []).push(p);
        return acc;
    }, {});

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => (
                    <Card
                        key={role.key}
                        header={
                            <CardTitle
                                icon={ShieldCheck}
                                title={role.label}
                                action={
                                    <span className="flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-fg">
                                        <Users className="h-3.5 w-3.5" />
                                        {role.members}
                                    </span>
                                }
                            />
                        }
                    >
                        <p className="text-xs text-muted">
                            {role.level
                                ? `Gerencia o nível: ${LEVELS[role.level] ?? role.level}`
                                : `Atua em: ${role.levels.map((l) => LEVELS[l] ?? l).join(', ')}`}
                        </p>
                        {role.description && <p className="mt-2 text-sm text-muted">{role.description}</p>}
                        <p className="mt-3 text-xs text-muted">
                            {role.permissions.length === 0
                                ? 'Sem permissões no painel (usa o app).'
                                : `${role.permissions.length} permissões`}
                        </p>
                    </Card>
                ))}
            </div>

            <Card header={<CardTitle icon={ShieldCheck} title="Permissões por função" />}>
                <p className="mb-3 text-xs text-muted">Somente leitura: as permissões de cada função vêm do catálogo do sistema.</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-line text-left text-xs uppercase text-muted">
                                <th className="py-2 pr-4 font-medium">Permissão</th>
                                {roles.map((role) => (
                                    <th key={role.key} className="px-2 py-2 text-center font-medium">
                                        {role.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(groups).map(([module, rows]) => (
                                <GroupRows key={module} module={module} rows={rows} roles={roles} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function GroupRows({ module, rows, roles }: { module: string; rows: PermissionRow[]; roles: RoleRow[] }) {
    return (
        <>
            <tr>
                <td colSpan={roles.length + 1} className="bg-surface-2 px-2 py-1.5 text-xs font-semibold uppercase text-muted">
                    {MODULES[module] ?? humanize(module)}
                </td>
            </tr>
            {rows.map((p) => (
                <tr key={p.name} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-4 text-fg">{labelOf(p)}</td>
                    {roles.map((role) => (
                        <td key={role.key} className="px-2 py-2.5 text-center">
                            {role.permissions.includes(p.name) && <Check className="mx-auto h-4 w-4 text-green-500" />}
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
