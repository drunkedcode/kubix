import Swal, { SweetAlertIcon } from 'sweetalert2';

// Colores alineados con Kubix
const BRAND_COLOR = '#5B6CFF';
const DANGER_COLOR = '#dc2626';

const baseConfig = {
  confirmButtonColor: BRAND_COLOR,
  cancelButtonColor: '#64748b',
  buttonsStyling: true,
  customClass: {
    popup: 'rounded-xl',
    confirmButton: 'rounded-lg',
    cancelButton: 'rounded-lg',
  },
};

export function alertSuccess(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,
    icon: 'success',
    title,
    text,
    timer: 2500,
    timerProgressBar: true,
  });
}

export function alertError(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,
    icon: 'error',
    title,
    text,
    confirmButtonColor: DANGER_COLOR,
  });
}

export function alertWarning(title: string, text?: string) {
  return Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title,
    text,
  });
}

export async function alertConfirm(
  title: string,
  text?: string,
  confirmText = 'Sí, continuar',
  cancelText = 'Cancelar'
): Promise<boolean> {
  const result = await Swal.fire({
    ...baseConfig,
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
  });
  return result.isConfirmed;
}

export async function alertConfirmDanger(
  title: string,
  text?: string,
  confirmText = 'Sí, eliminar',
  cancelText = 'Cancelar'
): Promise<boolean> {
  const result = await Swal.fire({
    ...baseConfig,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: DANGER_COLOR,
    confirmButtonText,
    cancelButtonText,
  });
  return result.isConfirmed;
}

export function alert(icon: SweetAlertIcon, title: string, text?: string) {
  return Swal.fire({ ...baseConfig, icon, title, text });
}

const toastConfig = {
  toast: true,
  position: 'top-end' as const,
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'rounded-xl',
  },
};

export function toastSuccess(title: string) {
  return Swal.fire({
    ...toastConfig,
    icon: 'success',
    title,
  });
}

export function toastError(title: string) {
  return Swal.fire({
    ...toastConfig,
    icon: 'error',
    title,
  });
}