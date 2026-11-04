import { useCallback, useState, type ReactElement } from "react";
import { Check } from "lucide-react";

/** Lo que recibe cada paso. El paso es dueño de su dato, su validación y sus errores. */
export interface StepProps<T = any> {
    /** Lo que este paso guardó antes (al volver atrás). */
    value: T | undefined;
    /** El paso avisa su dato y si es válido. */
    onChange: (value: T, valid: boolean) => void;
    /** Sube cada vez que el usuario intenta avanzar con el paso inválido: mostrar todos los errores. */
    attempt: number;
    /** Todos los bloques (lo usa la revisión). */
    data: Record<string, any>;
    /** Props extra del wizard (stepProps). */
    [extra: string]: any;
}

export interface StepItem {
    key: string;
    label: string;
    component: (props: StepProps) => ReactElement | null;
    finishLabel?: string;
    hideFooterNav?: boolean;
}

interface BaseWizardProps {
    steps: StepItem[];
    onFinish: (data: Record<string, any>) => void;
    onCancel: () => void;
    stepProps?: Record<string, any>;
}

export default function BaseWizard({
    steps = [],
    onFinish,
    onCancel,
    stepProps = {},
}: BaseWizardProps) {
    const [index, setIndex] = useState(0);
    const [data, setData] = useState<Record<string, any>>({});
    const [validity, setValidity] = useState<Record<string, boolean>>({});
    const [attempt, setAttempt] = useState(0);

    const step = steps[index];
    const key = step?.key ?? "";
    const isLast = index === steps.length - 1;

    // Estable mientras estés en el mismo paso, así el paso puede ponerlo en sus deps sin loops.
    const handleStepChange = useCallback(
        (value: any, valid: boolean) => {
            setData((prev) => ({ ...prev, [key]: value }));
            setValidity((prev) => ({ ...prev, [key]: valid }));
        },
        [key],
    );

    const handleNext = () => {
        if (!validity[key]) {
            setAttempt((a) => a + 1); // el paso pinta sus errores
            return;
        }
        if (isLast) {
            onFinish(data);
            return;
        }
        setAttempt(0);
        setIndex((i) => i + 1);
    };

    const handleBack = () => {
        if (index === 0) {
            onCancel();
            return;
        }
        setAttempt(0);
        setIndex((i) => i - 1);
    };

    if (!step) return null;
    const CurrentStep = step.component;

    return (
        <div className="w-full flex flex-col items-center gap-8">
            {/* BARRA DE PASOS */}
            <div className="w-full max-w-2xl">
                <div className="flex items-start justify-between">
                    {steps.map((s, idx) => {
                        const stepNumber = idx + 1;
                        const isCompleted = index + 1 > stepNumber;
                        const isCurrent = index + 1 === stepNumber;

                        return (
                            <div
                                key={s.key}
                                className="flex flex-col items-center gap-2 flex-1 relative"
                            >
                                <div
                                    className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold transition-all z-10 ${
                                        isCompleted || isCurrent
                                            ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                                            : "bg-navy-800 text-slate-400 border border-navy-700"
                                    }`}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        stepNumber
                                    )}
                                </div>

                                <span
                                    className={`text-xs font-medium text-center px-1 leading-tight ${
                                        isCurrent
                                            ? "text-teal-400 font-semibold"
                                            : isCompleted
                                              ? "text-slate-400"
                                              : "text-slate-500"
                                    }`}
                                >
                                    {s.label}
                                </span>

                                {idx < steps.length - 1 && (
                                    <div
                                        className={`absolute top-4 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                                            isCompleted
                                                ? "bg-teal-500"
                                                : "bg-navy-800"
                                        }`}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CONTENIDO DEL PASO */}
            <div className="w-full">
                <CurrentStep
                    key={step.key}
                    value={data[key]}
                    onChange={handleStepChange}
                    attempt={attempt}
                    data={data}
                    {...stepProps}
                />
            </div>

            {/* NAVEGACIÓN: el botón no se apaga; si falta algo, el paso se marca en rojo */}
            {!step.hideFooterNav && (
                <div className="flex w-full max-w-lg justify-between">
                    <button
                        onClick={handleBack}
                        className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-navy-800 transition-colors"
                    >
                        {index === 0 ? "Cancelar" : "Atrás"}
                    </button>
                    <button
                        onClick={handleNext}
                        className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-navy-950 hover:bg-teal-400 transition-colors"
                    >
                        {isLast ? (step.finishLabel ?? "Finalizar") : "Siguiente"}
                    </button>
                </div>
            )}
        </div>
    );
}