// ⚠️ Componente TEMPORAL solo para probar visualmente el GlobalLoadingOverlay.
// Borrar cuando ya lo hayas visto/ajustado — no es para producción.

import { showLoading, hideLoading } from '@/Shared/loaders';

export function LoadingTestButton() {
  const handleTest = () => {
    showLoading();
    // Lo deja visible 3 segundos para que puedas mirarlo bien
    setTimeout(() => {
      hideLoading();
    }, 3000);
  };

  return (
    <button
      onClick={handleTest}
      className="fixed bottom-24 right-4 z-[90] px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-lg"
    >
      Testar Loading
    </button>
  );
}