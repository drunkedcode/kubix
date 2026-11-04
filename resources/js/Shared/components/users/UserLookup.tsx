import { useState } from "react";
import { Search, UserCheck } from "lucide-react";
import TextField from "@/Shared/ui/forms/TextField";

/** Lo que devuelve la búsqueda: el correo viene enmascarado desde el backend. */
export interface LookupUser {
  id: number;
  name: string;
  email: string;
}

interface UserLookupProps {
  /** Endpoint GET que recibe ?email= y responde { user: LookupUser | null }. */
  lookupUrl: string;
  value: LookupUser | null;
  onChange: (user: LookupUser | null) => void;
  /** Error de validación del paso (ej: "Elegí un usuario"). */
  error?: string;
}

/**
 * Busca un usuario ya registrado por su correo exacto.
 * No lista ni sugiere: el backend solo responde si el correo coincide completo.
 */
export default function UserLookup({ lookupUrl, value, onChange, error }: UserLookupProps) {
  const [email, setEmail] = useState("");
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | undefined>();

  const search = async () => {
    const term = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(term)) {
      setMessage("Ingresá un correo válido");
      return;
    }

    setSearching(true);
    setMessage(undefined);

    try {
      const res = await fetch(`${lookupUrl}?email=${encodeURIComponent(term)}`, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });

      if (res.status === 429) {
        setMessage("Demasiados intentos. Esperá un momento.");
        return;
      }
      if (!res.ok) {
        setMessage("No se pudo buscar. Probá de nuevo.");
        return;
      }

      const body = (await res.json()) as { user: LookupUser | null };

      if (!body.user) {
        setMessage("No existe un usuario con ese correo. Primero debe registrarse en la plataforma.");
        return;
      }

      onChange(body.user);
    } catch {
      setMessage("No se pudo buscar. Probá de nuevo.");
    } finally {
      setSearching(false);
    }
  };

  const reset = () => {
    setEmail("");
    setMessage(undefined);
    onChange(null);
  };

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-teal-500/40 bg-teal-500/5 p-3">
        <div className="flex items-center gap-3">
          <UserCheck className="h-5 w-5 shrink-0 text-teal-400" />
          <div>
            <p className="text-sm font-semibold text-slate-100">{value.name}</p>
            <p className="text-xs text-slate-400">{value.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-xs font-medium text-slate-300 hover:text-teal-300"
        >
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <div
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            search();
          }
        }}
      >
        <TextField
          label="Correo del usuario"
          value={email}
          onChange={(v: string) => setEmail(v)}
          placeholder="persona@correo.com"
          error={error ?? message}
        />
      </div>
      <button
        type="button"
        onClick={search}
        disabled={searching}
        className="flex items-center justify-center gap-2 rounded-lg border border-navy-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-navy-800 disabled:opacity-60"
      >
        <Search className="h-4 w-4" />
        {searching ? "Buscando..." : "Buscar usuario"}
      </button>
    </div>
  );
}