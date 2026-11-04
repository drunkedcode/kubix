import type { StepItem } from "@/Shared/components/wizards/BaseWizard";
import MemberStep from "./MemberStep";
import ReviewStep from "./ReviewStep";

export const teamCreateSteps: StepItem[] = [
    { key: "member", label: "Persona y rol", component: MemberStep },
    {
        key: "review",
        label: "Revisión",
        component: ReviewStep,
        finishLabel: "Agregar al equipo",
    },
];