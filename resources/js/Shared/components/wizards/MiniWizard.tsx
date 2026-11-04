import { useState, ReactElement } from "react";
import { Check } from "lucide-react";

// ✅ Reutilizamos los mismos tipos del Wizard grande
export interface StepComponentProps<T = Record<string, any>> {
  state: Partial<T>;
  onChange: (patch: Partial<T>) => void;
  [key: string]: any;
}

export interface MiniStepItem {
  label: string;
  component: (props: StepComponentProps) => ReactElement | null;
  isValid?: (state: Record<string, any>) => boolean;
  finishLabel?: string;
  hideFooterNav?: boolean;
}

interface MiniWizardProps {
  steps: MiniStepItem[];
  sharedState: Record<string, any>; // ✅ Estado COMPARTIDO con el padre
  onUpdate: (patch: Record<string, any>) => void; // ✅ Guarda en el estado del padre
}

export default function MiniWizard({
  steps = [],
  sharedState,
  onUpdate,
}: MiniWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentStep = steps[currentStepIndex];
  const CurrentComponent = currentStep?.component;
  const isLastStep = currentStepIndex === steps.length - 1;
  const canProceed = currentStep?.isValid ? currentStep.isValid(sharedState) : true;

  // ✅ Actualiza SOLO el subpaso actual sin perder el estado completo
  const handleChange = (patch: Record<string, any>) => {
    onUpdate(patch); // ✅ Propaga al estado del padre
  };

  const handleNext = () => {
    if (!canProceed) return;
    if (!isLastStep) {
      setCurrentStepIndex((i) => i + 1);
    }
    // ✅ En el último paso → el botón dice "Finalizar" y no hace nada extra
    // El padre se encarga de todo cuando el Step principal termine
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  };

  if (!CurrentComponent) return null;

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* 📍 BARRA DE SUB-PASOS — Más compacta que el Wizard grande */}
      <div className="w-full max-w-xl">
        <div className="flex items-start justify-between">
          {steps.map((s, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = currentStepIndex + 1 > stepNumber;
            const isCurrent = currentStepIndex + 1 === stepNumber;
            return (
              <div key={stepNumber} className="flex flex-col items-center gap-2 flex-1 relative">
                {/* Círculo más pequeño */}
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                    isCompleted || isCurrent
                      ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                      : "bg-navy-800 text-slate-400 border border-navy-700"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
                </div>
                {/* Etiqueta debajo */}
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
                {/* Línea conectora */}
                {idx < steps.length - 1 && (
                  <div
                    className={`absolute top-3.5 left-1/2 w-full h-0.5 -translate-y-1/2 ${
                      isCompleted ? "bg-teal-500" : "bg-navy-800"
                    }`}
                    style={{ transform: "translateY(-50%)" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 📍 CONTENIDO DEL SUB-PASO — Usa el estado COMPARTIDO */}
      <div className="w-full">
        <CurrentComponent state={sharedState} onChange={handleChange} />
      </div>

      {/* 📍 BOTONES DE NAVEGACIÓN */}
      {!currentStep?.hideFooterNav && (
        <div className="flex w-full max-w-md justify-between">
          <button
            onClick={handleBack}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-navy-800 transition-colors"
          >
            {currentStepIndex === 0 ? "Atrás" : "Anterior"}
          </button>
          <button
            disabled={!canProceed}
            onClick={handleNext}
            className="rounded-lg bg-teal-500 px-5 py-2 text-sm font-semibold text-navy-950 disabled:opacity-40 hover:bg-teal-400 transition-colors"
          >
            {isLastStep ? currentStep.finishLabel ?? "Listo" : "Siguiente"}
          </button>
        </div>
      )}
    </div>
  );
}