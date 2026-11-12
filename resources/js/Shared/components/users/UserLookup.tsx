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
      setMessage("Informe um e-mail válido");
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
        setMessage("Muitas tentativas. Aguarde um momento.");
        return;
      }
      if (!res.ok) {
        setMessage("Não foi possível buscar. Tente novamente.");
        return;
      }

      const body = (await res.json()) as { user: LookupUser | null };

      if (!body.user) {
        setMessage("Não existe usuário com esse e-mail. Ele precisa se cadastrar na plataforma primeiro.");
        return;
      }

      onChange(body.user);
    } catch {
      setMessage("Não foi possível buscar. Tente novamente.");
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
      <div className="flex items-center justify-between gap-3 rounded-lg border border-brand bg-brand-soft p-3">
        <div className="flex items-center gap-3">
          <UserCheck className="h-5 w-5 shrink-0 text-brand-text" />
          <div>
            <p className="text-sm font-semibold text-fg">{value.name}</p>
            <p className="text-xs text-muted">{value.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-xs font-medium text-muted hover:text-brand-text"
        >
          Trocar
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
          label="E-mail do usuário"
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
        className="flex items-center justify-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-surface-2 disabled:opacity-60"
      >
        <Search className="h-4 w-4" />
        {searching ? "Buscando..." : "Buscar usuário"}
      </button>
    </div>
  );
}