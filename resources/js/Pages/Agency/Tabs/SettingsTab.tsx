import { useState, type FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import { RotateCcw } from "lucide-react";
import TextField from "@/Shared/ui/forms/TextField";
import { AddressFields, type AddressData } from "@/Shared/ui/forms/AddressFields";
import AvatarUpload from "@/Shared/ui/media/user/AvatarUpload";
import GalleryUpload from "@/Shared/ui/media/gallery/GalleryUpload";
import type { MediaError } from "@/Shared/ui/media/media.types";

export interface SettingsData {
  name: string;
  public_name: string | null;
  tagline: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: Record<string, string | null>;
  logo_url: string | null;
  cover_url: string | null;
}

type FormState = {
  public_name: string;
  tagline: string;
  primary_color: string; // "" = color por defecto
  secondary_color: string;
  contact_email: string;
  contact_phone: string;
  address: Record<string, string>;
  logo: File | null;
  cover: File | null;
};

// Provisorios: colores por defecto de Kubix cuando el barrio no definió los suyos.
const DEFAULT_PRIMARY = "#14b8a6";
const DEFAULT_SECONDARY = "#0f172a";

const cleanAddress = (a: Record<string, string | null | undefined>): Record<string, string> =>
  Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v ?? ""]));

function ColorField({
  label,
  value,
  fallback,
  onChange,
  error,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div>
      <span className="block text-sm font-medium text-white">{label}</span>
      <div className="mt-1 flex items-center gap-3">
        <input
          type="color"
          aria-label={label}
          value={value || fallback}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded-lg border border-navy-700 bg-navy-950 p-1"
        />
        <span className="text-xs text-slate-400">{value || "Por defecto"}</span>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white"
          >
            <RotateCcw className="h-3 w-3" />
            Restablecer
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export default function SettingsTab({ data, territory }: { data: SettingsData; territory: string }) {
  const { data: form, setData, post, processing, errors } = useForm<FormState>({
    public_name: data.public_name ?? "",
    tagline: data.tagline ?? "",
    primary_color: data.primary_color ?? "",
    secondary_color: data.secondary_color ?? "",
    contact_email: data.contact_email ?? "",
    contact_phone: data.contact_phone ?? "",
    address: cleanAddress(data.address),
    logo: null,
    cover: null,
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string>();

  const showMediaError = (errs: MediaError[]) =>
    setMediaError(errs.map((e) => `${e.fileName}: ${e.message}`).join(" · "));

  const addressErrors = Object.fromEntries(
    Object.entries(errors)
      .filter(([k]) => k.startsWith("address."))
      .map(([k, v]) => [k.slice("address.".length), v as string]),
  );

  const logoSrc = logoPreview ?? data.logo_url;
  const coverSrc = coverPreview ?? data.cover_url;
  const primary = form.primary_color || DEFAULT_PRIMARY;
  const secondary = form.secondary_color || DEFAULT_SECONDARY;
  const shownName = form.public_name || data.name;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    post(route("agencies.settings.update", { territory }), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        setData("logo", null);
        setData("cover", null);
        setLogoPreview(null);
        setCoverPreview(null);
        setMediaError(undefined);
      },
    });
  };

  const card = "rounded-xl border border-navy-800 bg-navy-900 p-4";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 pb-6">
      {/* Vista previa en vivo */}
      <div className={card}>
        <p className="mb-2 text-sm font-semibold text-white">Vista previa</p>
        <div className="relative h-36 overflow-hidden rounded-xl" style={{ backgroundColor: secondary }}>
          {coverSrc && <img src={coverSrc} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-black/50 px-4 py-3">
            {logoSrc && <img src={logoSrc} alt="" className="h-12 w-12 rounded-xl border border-white/20 object-cover" />}
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-white">{shownName}</p>
              {form.tagline && <p className="truncate text-xs text-slate-300">{form.tagline}</p>}
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1" style={{ backgroundColor: primary }} />
        </div>
      </div>

      {/* Identidad */}
      <div className={`${card} grid gap-4 sm:grid-cols-2`}>
        <p className="text-sm font-semibold text-white sm:col-span-2">Identidad</p>
        <TextField
          label="Nombre público"
          value={form.public_name}
          onChange={(v) => setData("public_name", v)}
          placeholder={data.name}
          error={errors.public_name}
        />
        <TextField
          label="Descripción corta"
          value={form.tagline}
          onChange={(v) => setData("tagline", v)}
          error={errors.tagline}
        />
        <ColorField
          label="Color principal"
          value={form.primary_color}
          fallback={DEFAULT_PRIMARY}
          onChange={(v) => setData("primary_color", v)}
          error={errors.primary_color}
        />
        <ColorField
          label="Color secundario"
          value={form.secondary_color}
          fallback={DEFAULT_SECONDARY}
          onChange={(v) => setData("secondary_color", v)}
          error={errors.secondary_color}
        />
      </div>

      {/* Imágenes */}
      <div className={`${card} grid gap-4 sm:grid-cols-2`}>
        <p className="text-sm font-semibold text-white sm:col-span-2">Imágenes</p>
        <div>
          <span className="mb-2 block text-sm font-medium text-white">Logo</span>
          <AvatarUpload
            name={shownName}
            previewUrl={logoSrc}
            roundedCorners
            maxSizeMB={5}
            onChange={(file, url) => {
              setData("logo", file);
              setLogoPreview(url);
              setMediaError(undefined);
            }}
            onError={showMediaError}
          />
          {errors.logo && <p className="mt-1 text-xs text-rose-400">{errors.logo}</p>}
        </div>
        <div>
          <span className="mb-2 block text-sm font-medium text-white">Portada</span>
          <GalleryUpload
            multiple={false}
            title="Cambiar portada"
            hint="PNG, JPG o WEBP · máx. 5 MB"
            onUpload={(items) => {
              const item = items[0];
              if (!item?.rawFile) return;
              if (coverPreview) URL.revokeObjectURL(coverPreview);
              setData("cover", item.rawFile);
              setCoverPreview(item.url);
              setMediaError(undefined);
            }}
            onError={showMediaError}
          />
          {errors.cover && <p className="mt-1 text-xs text-rose-400">{errors.cover}</p>}
        </div>
        {mediaError && <p className="text-xs text-rose-400 sm:col-span-2">{mediaError}</p>}
      </div>

      {/* Contacto y dirección */}
      <div className={`${card} flex flex-col gap-4`}>
        <p className="text-sm font-semibold text-white">Contacto</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Correo"
            type="email"
            value={form.contact_email}
            onChange={(v) => setData("contact_email", v)}
            error={errors.contact_email}
          />
          <TextField
            label="Teléfono"
            value={form.contact_phone}
            onChange={(v) => setData("contact_phone", v)}
            error={errors.contact_phone}
          />
        </div>
        <p className="text-sm font-semibold text-white">Dirección (opcional, solo si hay sede presencial)</p>
        <AddressFields
          value={form.address as AddressData}
          onChange={(patch) =>
            setData((prev) => ({ ...prev, address: { ...prev.address, ...(patch as Record<string, string>) } }))
          }
          errors={addressErrors}
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={processing}
          className="rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-teal-400 disabled:opacity-50"
        >
          {processing ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
