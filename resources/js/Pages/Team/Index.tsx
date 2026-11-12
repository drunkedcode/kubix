import { Head, router, usePage } from '@inertiajs/react';
import { Megaphone, ShieldCheck, Target, TrendingUp, Users } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';
import StatCard from '@/Shared/components/metrics/cards/StatCard';
import Tabs, { type TabItem } from '@/Shared/ui/Tabs';
import MembersTab, { type Member } from './Tabs/MembersTab';
import GoalsTab, { type GoalsData } from './Tabs/GoalsTab';
import ProductivityTab, { type ProductivityRow } from './Tabs/ProductivityTab';
import RolesTab, { type PermissionRow, type RoleRow } from './Tabs/RolesTab';

type TabKey = 'members' | 'roles' | 'productivity' | 'goals';

interface IndexProps {
    tab: TabKey;
    tabs: TabKey[];
    canManage: boolean;
    members?: Member[];
    hasManager?: boolean;
    managerLabel?: string | null;
    roles?: RoleRow[];
    catalog?: PermissionRow[];
    productivity?: ProductivityRow[];
    goals?: GoalsData;
}

interface SharedProps {
    territory?: { slug: string; name: string } | null;
    [key: string]: unknown;
}

const ALL_TABS: TabItem<TabKey>[] = [
    { key: 'members', label: 'Membros', icon: Users },
    { key: 'roles', label: 'Funções e Permissões', icon: ShieldCheck },
    { key: 'productivity', label: 'Produtividade', icon: TrendingUp },
    { key: 'goals', label: 'Metas', icon: Target },
];

const isManager = (member: Member) => member.role.endsWith('_admin');

export default function Index({ tab, tabs, canManage, members = [], hasManager = true, managerLabel = null, roles = [], catalog = [], productivity = [], goals }: IndexProps) {
    const territory = usePage<SharedProps>().props.territory!;

    // El backend decide qué pestañas existen para esta persona; la página solo las dibuja.
    const visibleTabs = ALL_TABS.filter((t) => tabs.includes(t.key));

    const changeTab = (next: TabKey) =>
        router.get(route('team.index', { territory: territory.slug }), { tab: next }, { preserveState: true, preserveScroll: true, replace: true });

    const kpis =
        tab === 'members' ? (
            <>
                <StatCard label="Total de Membros" value={members.length} icon={Users} tone="teal" />
                <StatCard label="Gerentes" value={members.filter(isManager).length} icon={ShieldCheck} tone="blue" />
                <StatCard
                    label="Promotores"
                    value={members.filter((m) => m.role === 'promoter').length}
                    icon={Megaphone}
                    tone="purple"
                />
            </>
        ) : undefined;

    return (
        <AdminLayout title="Equipes" subtitle={`Pessoas que trabalham em ${territory.name}`} kpis={kpis}>
            <Head title="Equipes" />

            <div className="space-y-4">
                <Tabs tabs={visibleTabs} active={tab} onChange={changeTab} />

                {tab === 'members' && (
                    <MembersTab
                        members={members}
                        hasManager={hasManager}
                        managerLabel={managerLabel}
                        canManage={canManage}
                        territory={territory.slug}
                    />
                )}
                {tab === 'roles' && <RolesTab roles={roles} catalog={catalog} />}
                {tab === 'productivity' && <ProductivityTab rows={productivity} territory={territory.slug} />}
                {tab === 'goals' && goals && <GoalsTab data={goals} canManage={canManage} territory={territory.slug} />}
            </div>
        </AdminLayout>
    );
}
