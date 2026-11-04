// resources/js/Shared/alerts/useFlashToast.ts
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toastSuccess, toastError } from './alerts';

interface FlashProps {
  success?: string;
  error?: string;
  [key: string]: unknown;
}

// No usa usePage() — escucha los eventos del router directamente, así
// funciona sin importar en qué parte del árbol de componentes se llame
// (ver el error de "usePage must be used within the Inertia component"
// si esto se cambia a usePage() de nuevo).
export function useFlashToast() {
  useEffect(() => {
    // Visitas exitosas: muestra flash.success / flash.error del servidor.
    // OJO: Inertia NO dispara 'success' cuando la respuesta trae errores
    // de validación, por eso hace falta el listener de 'error' de abajo.
    const removeSuccess = router.on('success', (event) => {
      const flash = (event.detail.page.props as { flash?: FlashProps }).flash;
      if (!flash) return;

      if (flash.success) toastSuccess(flash.success);
      if (flash.error) toastError(flash.error);
    });

    // Errores de validación (CPF/e-mail duplicado, campos inválidos, etc.):
    // genérico, sirve para cualquier formulario sin configurar campo por campo.
    const removeError = router.on('error', (event) => {
      const errors = event.detail.errors as Record<string, string>;
      const first = Object.values(errors)[0];
      if (first) toastError(first);
    });

    return () => {
      removeSuccess();
      removeError();
    };
  }, []);
}