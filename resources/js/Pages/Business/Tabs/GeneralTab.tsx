import { useState } from 'react';
// import BaseMap from '@/Shared/components/maps/BaseMap';
// import MarkersLayer, { type MapMarker } from '@/Shared/components/maps/MarkersLayer';
import type { AddressData } from '@/Shared/ui/forms/AddressFields';
import { masks } from '@/Shared/ui/forms/helpers/masks';
import AvatarUpload from '@/Shared/ui/media/user/AvatarUpload';
import GalleryUpload from '@/Shared/ui/media/gallery/GalleryUpload';
import GalleryPreview from '@/Shared/ui/media/gallery/GalleryPreview';
import type { MediaError, MediaItem } from '@/Shared/ui/media/media.types';
import FabWhats from '@/Shared/components/btn/FabWhats'; // ← import

export interface BusinessGeneralData {
    business: {
        id: number;
        name: string;
        category: string;
        payment: MapMarker['payment'];
        phone: string;
        address: AddressData;
        lat: number;
        lng: number;
    };
    owner: { name: string; email: string; phone: string; photoUrl?: string };
    gallery: MediaItem[];
}
interface GeneralTabProps {
    data: BusinessGeneralData;
}
function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-slate-400">{label}</dt>
            <dd className="mt-0.5 text-sm text-white">{value || '—'}</dd>
        </div>
    );
}
export default function GeneralTab({ data }: GeneralTabProps) {
    const { business: b, owner: o } = data;
    const a = b.address;

    const [photo, setPhoto] = useState<string | null>(o.photoUrl ?? null);
    const [gallery, setGallery] = useState<MediaItem[]>(data.gallery);
    const [errors, setErrors] = useState<MediaError[]>([]);

    const marker: MapMarker = {
        id: b.id,
        name: b.name,
        category: b.category,
        lat: b.lat,
        lng: b.lng,
        opportunity: 'medium',
        payment: b.payment,
    };

    // Limpia el teléfono: deja solo dígitos para el enlace de WhatsApp
    const rawPhone = b.phone.replace(/\D/g, '');
    const whatsappPhone = rawPhone.length === 11 ? `55${rawPhone}` : rawPhone;

    return (
        <>
            <div className="grid gap-4 p-2 sm:p-6 lg:grid-cols-2">
                <section className="space-y-4 rounded-xl border border-navy-800 bg-navy-900 p-5">
                    <h3 className="text-lg font-semibold text-white">Responsable</h3>
                    <div className="flex flex-col items-center gap-5 sm:flex-row">
                        <AvatarUpload
                            name={o.name}
                            size="lg"
                            previewUrl={photo}
                            onChange={(_, url) => setPhoto(url)}
                            onError={setErrors}
                        />
                        <dl className="grid flex-1 gap-4 sm:grid-cols-2">
                            <Field label="Nombre" value={o.name} />
                            <Field label="E-mail" value={o.email} />
                            <Field label="Teléfono" value={masks.phone(o.phone)} />
                        </dl>
                    </div>
                </section>

                <section className="space-y-4 rounded-xl border border-navy-800 bg-navy-900 p-5">
                    <h3 className="text-lg font-semibold text-white">Negocio</h3>
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <Field label="Nombre" value={b.name} />
                        <Field label="Rubro" value={b.category} />
                        <Field label="Teléfono" value={masks.phone(b.phone)} />
                        <Field label="CEP" value={masks.cep(a.cep ?? '')} />
                        <div className="sm:col-span-2">
                            <Field
                                label="Dirección"
                                value={`${a.street}, ${a.number} · ${a.neighborhood}, ${a.city} - ${a.state}`}
                            />
                        </div>
                    </dl>
                </section>

                <section className="space-y-4 rounded-xl border border-navy-800 bg-navy-900 p-5 lg:col-span-2">
                    <h3 className="text-lg font-semibold text-white">Fotos del negocio</h3>
                    <GalleryPreview
                        items={gallery}
                        onRemove={(id) => setGallery((prev) => prev.filter((i) => i.id !== id))}
                    />
                    <GalleryUpload
                        onUpload={(items) => {
                            setErrors([]);
                            setGallery((prev) => [...prev, ...items]);
                        }}
                        onError={setErrors}
                    />
                    {errors.map((e) => (
                        <p key={e.fileName} className="text-xs text-rose-400">
                            {e.fileName}: {e.message}
                        </p>
                    ))}
                </section>

                {/* <div className="lg:col-span-2">
                    <BaseMap center={[b.lat, b.lng]} zoom={16} className="h-[280px]">
                        <MarkersLayer markers={[marker]} colorBy="payment" />
                    </BaseMap>
                </div> */}
            </div>

            {/* Botón flotante WhatsApp — usa el teléfono del negocio */}
            <FabWhats
                phone={whatsappPhone}
                message={`Olá! Vi o negócio "${b.name}" no Kubix e gostaria de mais informações.`}
            />
        </>
    );
}