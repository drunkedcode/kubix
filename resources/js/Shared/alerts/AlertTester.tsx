// resources/js/Shared/Alerts/AlertTester.tsx
// ⚠️ Componente TEMPORAL — SOLO para probar visualmente las alertas
// Borrar cuando ya lo hayas visto/ajustado — NO es para producción
import {
  alertSuccess,
  alertError,
  alertWarning,
  alertConfirm,
  alertConfirmDanger,
  toastSuccess,
  toastError,
} from './index';

export function AlertTester() {
  return (
    <div className="fixed bottom-4 left-4 z-[90] flex flex-col gap-2">
      <button
        onClick={() => alertSuccess('¡Operación completada!', 'Todo salió bien ✅')}
        className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-lg"
      >
        ✅ Éxito
      </button>

      <button
        onClick={() => alertError('Algo salió mal', 'Verifica los datos e intenta nuevamente')}
        className="px-3 py-2 rounded-lg bg-red-600 text-white text-xs font-bold shadow-lg"
      >
        ❌ Error
      </button>

      <button
        onClick={() => alertWarning('Atención', 'Revisa este aviso antes de continuar')}
        className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-lg"
      >
        ⚠️ Advertencia
      </button>

      <button
        onClick={async () => {
          const ok = await alertConfirm('¿Seguro quieres continuar?', 'Esta acción no se puede deshacer');
          alertSuccess(ok ? '¡Confirmado!' : 'Cancelado');
        }}
        className="px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold shadow-lg"
      >
        ❓ Confirmar
      </button>

      <button
        onClick={async () => {
          const ok = await alertConfirmDanger('¿Eliminar registro?', 'Esta acción es permanente');
          alertSuccess(ok ? 'Eliminado ✅' : 'Cancelado');
        }}
        className="px-3 py-2 rounded-lg bg-red-700 text-white text-xs font-bold shadow-lg"
      >
        ⛔ Peligro
      </button>

      <button
        onClick={() => toastSuccess('¡Guardado con éxito!')}
        className="px-3 py-2 rounded-lg bg-sky-600 text-white text-xs font-bold shadow-lg"
      >
        🔔 Toast Éxito
      </button>

      <button
        onClick={() => toastError('No se pudo guardar')}
        className="px-3 py-2 rounded-lg bg-slate-700 text-white text-xs font-bold shadow-lg"
      >
        🔔 Toast Error
      </button>
    </div>
  );
}