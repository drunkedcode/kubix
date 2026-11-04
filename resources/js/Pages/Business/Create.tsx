import { Head, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import BaseWizard from "@/Shared/components/wizards/BaseWizard";
import { businessCreateSteps } from "./Steps/create/wizardStep";
import { toPayload } from "./Steps/create/toPayload";
import type { SegmentOption } from "./Steps/create/BusinessDataStep";

interface CreateProps {
    segments: SegmentOption[];
    territorySlug: string;
}

export default function Create({ segments = [], territorySlug }: CreateProps) {
    const handleFinish = (data: Record<string, any>) => {
        const payload = toPayload(data);
        // TODO: conectar el backend (router.post a businesses.store).
        console.log(" Payload negocio", payload);

        router.post("businesses.strore", payload);
    };

    const handleCancel = () =>
        router.visit(route("businesses.index", { territory: territorySlug }));

    return (
        <AdminLayout
            title="Panel de Administración"
            subtitle="Registro de nuevo negocio"
        >
            <Head title="Nuevo negocio" />
            <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
                <BaseWizard
                    steps={businessCreateSteps}
                    onFinish={handleFinish}
                    onCancel={handleCancel}
                    stepProps={{ segments }}
                />
            </div>
        </AdminLayout>
    );
}