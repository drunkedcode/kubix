import { useId, useState } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { masks, cleaners, type MaskType } from "./helpers/masks";
import { validate } from "./helpers/validators";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  mask?: MaskType;
  name?: string;
  id?: string;
  className?: string;
}

export default function TextField({
  label,
  value,
  onChange,
  onBlur,
  error,
  type,
  placeholder,
  required,
  mask,
  name,
  id,
  className = "",
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [touched, setTouched] = useState(false);

  const displayValue = mask ? masks[mask](value) : value;
  const inputType = type ?? (mask === "email" ? "email" : "text");
  const internalError = touched ? validate(mask, value) : null;
  const shownError = error ?? internalError ?? undefined;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    const outputVal = mask ? cleaners[mask](inputVal) : inputVal;
    if (outputVal !== value) onChange(outputVal);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    onBlur?.(e);
  };

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-fg">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      <input
        id={inputId}
        name={name}
        type={inputType}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!shownError}
        aria-describedby={shownError ? `${inputId}-error` : undefined}
        className={`mt-1 w-full rounded-lg border bg-surface-2 px-4 py-2.5 text-sm text-fg placeholder:text-muted transition-colors focus:outline-none focus:ring-2 ${
          shownError
            ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-line focus:border-brand/50 focus:ring-brand/50"
        }`}
      />
      {shownError && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-rose-400">
          {shownError}
        </p>
      )}
    </div>
  );
}