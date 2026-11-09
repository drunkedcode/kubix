import { useId } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectFieldProps {
  label?: string;
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  required?: boolean;
  placeholder?: string;
  name?: string;
  id?: string;
  className?: string;
  /** 'bar' = píldora para fondos oscuros (barra superior). */
  tone?: "default" | "bar";
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  required,
  placeholder = "Seleccionar...",
  name,
  id,
  className = "",
  tone = "default",
}: SelectFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-fg">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}
      <select
        id={inputId}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={`${label ? "mt-1 " : ""}w-full border transition-colors focus:outline-none focus:ring-2 ${
          tone === "bar"
            ? "rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-white [&>option]:bg-surface [&>option]:text-fg"
            : "rounded-lg bg-surface-2 px-4 py-2.5 text-sm text-fg"
        } ${
          error
            ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20"
            : `${tone === "bar" ? "border-sidebar-line" : "border-line"} focus:border-brand/50 focus:ring-brand/50`
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}