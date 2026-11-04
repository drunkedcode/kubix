import { useEffect, useRef, useState } from "react";
import TextField from "@/Shared/ui/forms/TextField";
import StepCard from "@/Shared/components/wizards/StepCard";
import type { StepProps } from "@/Shared/components/wizards/BaseWizard";
import { masks, cleaners } from "@/Shared/ui/forms/helpers/masks";

export interface LocationData {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    latitude: string;
    longitude: string;
}

type Errors = Partial<Record<keyof LocationData, string>>;
type CepStatus = "idle" | "loading" | "found" | "notfound" | "error";
type GeoStatus = "idle" | "loading" | "found" | "notfound" | "error";

const EMPTY: LocationData = {
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
};

export const toCoord = (s: string) => Number(s.trim().replace(",", "."));

const validCoord = (s: string, limit: number) => {
    if (s.trim() === "") return false;
    const n = toCoord(s);
    return Number.isFinite(n) && Math.abs(n) <= limit;
};

export function validateLocation(v: LocationData): Errors {
    const errors: Errors = {};
    if (v.cep && v.cep.length !== 8) errors.cep = "El CEP tiene 8 dígitos";
    if (!v.street.trim()) errors.street = "Ingresá la calle";
    if (!v.city.trim()) errors.city = "Ingresá la ciudad";
    if (v.state.length !== 2) errors.state = "Sigla de 2 letras (PR)";
    if (!validCoord(v.latitude, 90)) errors.latitude = "Falta la ubicación";
    if (!validCoord(v.longitude, 180)) errors.longitude = "Falta la ubicación";
    return errors;
}

const CEP_HINT: Record<CepStatus, string> = {
    idle: "",
    loading: "Buscando CEP…",
    found: "Dirección completada desde el CEP",
    notfound: "CEP no encontrado: completá la dirección a mano",
    error: "No se pudo consultar el CEP: completá la dirección a mano",
};

const GEO_HINT: Record<GeoStatus, string> = {
    idle: "Completá calle, ciudad y estado para ubicar el negocio.",
    loading: "Ubicando la dirección…",
    found: "Ubicación aproximada encontrada.",
    notfound: "No pudimos ubicar la dirección: ingresá las coordenadas a mano.",
    error: "El servicio de ubicación no responde: ingresá las coordenadas a mano.",
};

// Cambia solo cuando cambia algo que afecta la ubicación.
const addressKey = (v: LocationData) =>
    [v.street, v.number, v.neighborhood, v.city, v.state]
        .map((s) => s.trim())
        .join("|");

/** Dirección → coordenadas aproximadas (Nominatim / OpenStreetMap). Solo Brasil por ahora. */
async function geocode(v: LocationData, signal: AbortSignal) {
    const attempts = [
        [`${v.street} ${v.number}`, v.neighborhood, v.city, v.state, "Brasil"],
        [v.street, v.city, v.state, "Brasil"],
    ];

    for (const parts of attempts) {
        const q = parts.map((p) => p.trim()).filter(Boolean).join(", ");
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error("geocoder");
        const rows = await res.json();
        if (rows[0]) {
            return {
                lat: Number(rows[0].lat).toFixed(7),
                lon: Number(rows[0].lon).toFixed(7),
            };
        }
    }
    return null;
}

export default function LocationStep({
    value,
    onChange,
    attempt,
}: StepProps<LocationData>) {
    const [values, setValues] = useState<LocationData>(value ?? EMPTY);
    const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
    const [geoStatus, setGeoStatus] = useState<GeoStatus>("idle");
    // Los campos manuales de coordenadas aparecen solo si la ubicación automática falla.
    const [manualMode, setManualMode] = useState(false);

    // Evita volver a consultar (y pisar ediciones) al regresar a este paso ya resuelto.
    const lookedUpCep = useRef<string>(value?.cep ?? "");
    const lastGeoKey = useRef<string>(
        value?.latitude && value?.longitude ? addressKey(value) : "",
    );
    // Si el usuario escribió las coordenadas, el automático deja de sobrescribirlas.
    const manualCoords = useRef(false);

    const errors = validateLocation(values);
    const show = attempt > 0;
    const err = (field: keyof LocationData) =>
        show ? errors[field] : undefined;
    const hasCoords =
        validCoord(values.latitude, 90) && validCoord(values.longitude, 180);

    useEffect(() => {
        onChange(values, Object.keys(validateLocation(values)).length === 0);
    }, [values, onChange]);

    // CEP → dirección. Nunca bloquea el avance.
    useEffect(() => {
        if (values.cep.length !== 8) {
            setCepStatus("idle");
            return;
        }
        if (values.cep === lookedUpCep.current) return;

        lookedUpCep.current = values.cep;
        const controller = new AbortController();
        setCepStatus("loading");

        fetch(`https://viacep.com.br/ws/${values.cep}/json/`, {
            signal: controller.signal,
        })
            .then((r) => r.json())
            .then((d) => {
                if (d.erro) {
                    setCepStatus("notfound");
                    return;
                }
                setValues((prev) => ({
                    ...prev,
                    street: d.logradouro || prev.street,
                    neighborhood: d.bairro || prev.neighborhood,
                    city: d.localidade || prev.city,
                    state: d.uf || prev.state,
                }));
                setCepStatus("found");
            })
            .catch((e) => {
                if (e.name !== "AbortError") setCepStatus("error");
            });

        return () => controller.abort();
    }, [values.cep]);

    // Dirección → coordenadas. Espera a que el usuario deje de escribir.
    useEffect(() => {
        const ready =
            values.street.trim() &&
            values.city.trim() &&
            values.state.length === 2;

        if (!ready) {
            setGeoStatus("idle");
            return;
        }
        if (manualCoords.current) return;

        const key = addressKey(values);
        if (key === lastGeoKey.current) return;

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setGeoStatus("loading");
            try {
                const point = await geocode(values, controller.signal);
                lastGeoKey.current = key;
                if (!point) {
                    setGeoStatus("notfound");
                    setManualMode(true);
                    return;
                }
                setValues((prev) => ({
                    ...prev,
                    latitude: point.lat,
                    longitude: point.lon,
                }));
                setGeoStatus("found");
            } catch (e: any) {
                if (e.name === "AbortError") return;
                setGeoStatus("error");
                setManualMode(true);
            }
        }, 800);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values.street, values.number, values.neighborhood, values.city, values.state]);

    const set = (patch: Partial<LocationData>) =>
        setValues((prev) => ({ ...prev, ...patch }));

    const setCoord = (patch: Partial<LocationData>) => {
        manualCoords.current = true;
        set(patch);
    };

    const coordsError = err("latitude") || err("longitude");

    return (
        <div className="grid gap-4">
            <StepCard
                title="Dirección"
                description="Con el CEP completamos el resto automáticamente."
            >
                <div>
                    <TextField
                        label="CEP"
                        value={masks.cep(values.cep)}
                        onChange={(v: string) => set({ cep: cleaners.cep(v) })}
                        placeholder="80000-000"
                        error={err("cep")}
                    />
                    {CEP_HINT[cepStatus] && (
                        <p className="mt-1 text-xs text-slate-400">
                            {CEP_HINT[cepStatus]}
                        </p>
                    )}
                </div>

                <TextField
                    label="Calle"
                    value={values.street}
                    onChange={(street: string) => set({ street })}
                    error={err("street")}
                />
                <div className="grid grid-cols-2 gap-4">
                    <TextField
                        label="Número"
                        value={values.number}
                        onChange={(v: string) => set({ number: v.slice(0, 20) })}
                    />
                    <TextField
                        label="Complemento"
                        value={values.complement}
                        onChange={(complement: string) => set({ complement })}
                    />
                </div>
                <TextField
                    label="Barrio"
                    value={values.neighborhood}
                    onChange={(neighborhood: string) => set({ neighborhood })}
                />
                <div className="grid grid-cols-[1fr_6rem] gap-4">
                    <TextField
                        label="Ciudad"
                        value={values.city}
                        onChange={(city: string) => set({ city })}
                        error={err("city")}
                    />
                    <TextField
                        label="Estado"
                        value={values.state}
                        onChange={(v: string) =>
                            set({ state: v.toUpperCase().slice(0, 2) })
                        }
                        error={err("state")}
                    />
                </div>
            </StepCard>

            <StepCard
                title="Ubicación en el mapa"
                description="La calculamos a partir de la dirección."
            >
                <div className="text-sm">
                    <p className="text-slate-300">{GEO_HINT[geoStatus]}</p>
                    {hasCoords && (
                        <p className="mt-1 text-xs text-slate-400">
                            {values.latitude}, {values.longitude}
                        </p>
                    )}
                    {!hasCoords && coordsError && !manualMode && (
                        <p className="mt-1 text-xs text-red-400">
                            Completá la dirección para ubicar el negocio.
                        </p>
                    )}
                </div>

                {/* Respaldo: solo aparece si la ubicación automática falló. La parte 4 lo reemplaza por el pin. */}
                {manualMode && (
                    <div className="grid grid-cols-2 gap-4">
                        <TextField
                            label="Latitud"
                            value={values.latitude}
                            onChange={(latitude: string) => setCoord({ latitude })}
                            placeholder="-25.4284"
                            error={err("latitude")}
                        />
                        <TextField
                            label="Longitud"
                            value={values.longitude}
                            onChange={(longitude: string) => setCoord({ longitude })}
                            placeholder="-49.2733"
                            error={err("longitude")}
                        />
                    </div>
                )}
            </StepCard>
        </div>
    );
}