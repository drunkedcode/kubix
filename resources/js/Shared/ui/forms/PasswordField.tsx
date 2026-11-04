import { useId, useState } from "react";
import type { FocusEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  className?: string;
}

export default function PasswordField({
  label = "Contraseña",
  value,
  onChange,
  onBlur,
  error,
  placeholder = "Mín. 6 caracteres",
  required,
  name,
  id,
  autoComplete = "new-password",
  className = "",
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-white">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`mt-1 w-full rounded-lg border bg-navy-950 px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 transition-colors focus:outline-none focus:ring-2 ${
            error
              ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-navy-700 focus:border-teal-500/50 focus:ring-teal-500/50"
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={show}
          tabIndex={-1}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition-colors hover:text-slate-300"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}