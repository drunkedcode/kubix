const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formata un monto en reales (R$ 1.500,00). */
export const brl = (value: number) => formatter.format(value);
