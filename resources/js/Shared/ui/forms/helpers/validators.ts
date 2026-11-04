import type { MaskType } from "./masks";

const digits = (v: string) => v.replace(/\D/g, "");
const allEqual = (d: string) => /^(\d)\1+$/.test(d);

function isValidCpf(v: string) {
  const d = digits(v);
  if (d.length !== 11 || allEqual(d)) return false;
  for (let t = 9; t < 11; t++) {
    let s = 0;
    for (let i = 0; i < t; i++) s += +d[i] * (t + 1 - i);
    if (((s * 10) % 11) % 10 !== +d[t]) return false;
  }
  return true;
}

function isValidCnpj(v: string) {
  const d = digits(v);
  if (d.length !== 14 || allEqual(d)) return false;
  const calc = (size: number) => {
    let s = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      s += +d[size - i] * pos--;
      if (pos < 2) pos = 9;
    }
    const r = s % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === +d[12] && calc(13) === +d[13];
}

function isValidDate(v: string) {
  const d = digits(v);
  if (d.length !== 8) return false;
  const day = +d.slice(0, 2),
    month = +d.slice(2, 4),
    year = +d.slice(4, 8);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

// Devuelve el mensaje de error o null si es válido. Vacío = sin error.
export const validators: Partial<
  Record<MaskType, (v: string) => string | null>
> = {
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : "E-mail inválido",
  name: (v) => {
    const t = v.trim();
    if (t.length < 2) return "El nombre debe tener al menos 2 letras";
    if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(t))
      return "El nombre solo puede tener letras";
    return null;
  },
  cpf: (v) => (isValidCpf(v) ? null : "CPF inválido"),
  cnpj: (v) => (isValidCnpj(v) ? null : "CNPJ inválido"),
  cep: (v) => (digits(v).length === 8 ? null : "CEP deve ter 8 dígitos"),
  phone: (v) =>
    [10, 11].includes(digits(v).length) ? null : "Teléfono inválido",
  date: (v) => (isValidDate(v) ? null : "Fecha inválida"),
  plate: (v) => (v.length === 7 ? null : "Placa inválida"),
  renavam: (v) =>
    digits(v).length === 11 ? null : "RENAVAM deve ter 11 dígitos",
  year: (v) => (digits(v).length === 4 ? null : "Año inválido"),
};

export const validate = (mask: MaskType | undefined, value: string) =>
  mask && value ? (validators[mask]?.(value) ?? null) : null;
