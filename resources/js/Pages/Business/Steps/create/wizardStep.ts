import type { StepItem } from "@/Shared/components/wizards/BaseWizard";
import BusinessDataStep from "./BusinessDataStep";
import LocationStep from "./LocationStep";
import ResponsibleStep from "./ResponsibleStep";
import ReviewStep from "./ReviewStep";

export const businessCreateSteps: StepItem[] = [
    { key: "business", label: "Negocio", component: BusinessDataStep },
    { key: "location", label: "Ubicación", component: LocationStep },
    { key: "responsible", label: "Responsable", component: ResponsibleStep },
    {
        key: "review",
        label: "Revisión",
        component: ReviewStep,
        finishLabel: "Registrar negocio",
    },
];