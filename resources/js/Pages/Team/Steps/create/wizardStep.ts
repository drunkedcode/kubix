import type { StepItem } from "@/Shared/components/wizards/BaseWizard";
import MemberStep from "./MemberStep";
import ReviewStep from "./ReviewStep";

export const teamCreateSteps: StepItem[] = [
    { key: "member", label: "Pessoa e função", component: MemberStep as StepItem["component"] },
    {
        key: "review",
        label: "Revisão",
        component: ReviewStep,
        finishLabel: "Adicionar à equipe",
    },
];