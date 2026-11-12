import { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import BaseWizard from "@/Shared/components/wizards/BaseWizard";
import { teamCreateSteps } from "./Steps/create/wizardStep";
import { toPayload } from "./Steps/create/toPayload";
import type { RoleOption } from "./Steps/create/MemberStep";

interface CreateProps {
    roles: RoleOption[];
}

interface SharedProps {
    territory?: { slug: string; name: string } | null;
    [key: string]: unknown;
}

export default function Create({ roles = [] }: CreateProps) {
    // El territorio viene del compartido (la URL): no se manda como prop de página
    // para no pisar el "territory" que usa el sidebar.
    const territory = usePage<SharedProps>().props.territory!;
    const [serverError, setServerError] = useState<string | null>(null);

    const handleFinish = (data: Record<string, any>) => {
        setServerError(null);

        router.post(route("team.store", { territory: territory.slug }), toPayload(data), {
            onError: (errors) => setServerError(Object.values(errors)[0] ?? "Não foi possível adicionar."),
        });
    };

    const handleCancel = () =>
        router.visit(route("team.index", { territory: territory.slug }));

    return (
        <AdminLayout
            title="Novo Membro"
            subtitle={`Novo membro da equipe · ${territory.name}`}
        >
            <Head title="Novo Membro" />
            <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
                {serverError && (
                    <div className="mx-auto max-w-lg rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                        {serverError}
                    </div>
                )}

                <BaseWizard
                    steps={teamCreateSteps}
                    onFinish={handleFinish}
                    onCancel={handleCancel}
                    stepProps={{
                        roles,
                        territoryName: territory.name,
                        lookupUrl: route("team.lookup", { territory: territory.slug }),
                    }}
                />
            </div>
        </AdminLayout>
    );
}