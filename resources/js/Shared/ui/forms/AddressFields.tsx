import { useState } from "react";
import TextField from "./TextField";
import { findCep } from "./helpers/findCep";

export interface AddressData {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}

interface AddressFieldsProps {
  value: AddressData;
  onChange: (patch: Partial<AddressData>) => void;
  errors?: Record<string, string>;
  className?: string;
}

export function AddressFields({
  value,
  onChange,
  errors = {},
  className = "",
}: AddressFieldsProps) {
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string>();

  const handleCepChange = async (cleanValue: string) => {
    const cep = cleanValue.replace(/\D/g, "").slice(0, 8);
    onChange({ cep });
    setCepError(undefined);
    if (cep.length !== 8) return;

    setLoadingCep(true);
    try {
      const found = await findCep(cep);
      if (!found) return setCepError("CEP não encontrado");
      onChange({
        street: found.street,
        neighborhood: found.neighborhood,
        city: found.city,
        state: found.state,
      });
    } catch {
      setCepError("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <TextField
        label="CEP"
        value={value.cep ?? ""}
        onChange={handleCepChange}
        mask="cep"
        placeholder="00000-000"
        error={errors.cep ?? cepError}
      />

      {loadingCep && (
        <p className="animate-pulse text-center text-xs text-teal-400">Buscando CEP...</p>
      )}

      <TextField
        label="Logradouro"
        value={value.street ?? ""}
        onChange={(val) => onChange({ street: val })}
        placeholder="Rua das Flores"
        error={errors.street}
      />

      <div className="grid grid-cols-3 gap-3">
        <TextField
          className="col-span-1"
          label="Número"
          value={value.number ?? ""}
          onChange={(val) => onChange({ number: val })}
          placeholder="123"
          error={errors.number}
        />
        <TextField
          className="col-span-2"
          label="Complemento"
          value={value.complement ?? ""}
          onChange={(val) => onChange({ complement: val })}
          placeholder="Apto 42"
        />
      </div>

      <TextField
        label="Bairro"
        value={value.neighborhood ?? ""}
        onChange={(val) => onChange({ neighborhood: val })}
        placeholder="Centro"
        error={errors.neighborhood}
      />

      <div className="grid grid-cols-3 gap-3">
        <TextField
          className="col-span-2"
          label="Cidade"
          value={value.city ?? ""}
          onChange={(val) => onChange({ city: val })}
          placeholder="São Paulo"
          error={errors.city}
        />
        <TextField
          className="col-span-1"
          label="UF"
          value={value.state ?? ""}
          onChange={(val) => onChange({ state: val.toUpperCase().slice(0, 2) })}
          placeholder="SP"
          error={errors.state}
        />
      </div>
    </div>
  );
}

export default AddressFields;