import type { BusinessData } from "./BusinessDataStep";
import type { LocationData } from "./LocationStep";
import { toCoord } from "./LocationStep";
import type { ResponsibleData } from "./ResponsibleStep";
import type { ReviewData } from "./ReviewStep";

const digits = (s: string) => s.replace(/\D/g, "");
const orNull = (s: string) => s.trim() || null;

/** Convierte lo que juntó el wizard en lo que espera el backend (columnas de `locations` incluidas). */
export function toPayload(data: Record<string, any>) {
    const business = data.business as BusinessData;
    const location = data.location as LocationData;
    const responsible = data.responsible as ResponsibleData;
    const review = data.review as ReviewData;

    return {
        business: {
            name: business.name.trim(),
            slug: business.slug,
            segment: business.segment,
            phone: digits(business.phone),
        },
        location: {
            cep: orNull(location.cep),
            street: location.street.trim(),
            number: orNull(location.number),
            complement: orNull(location.complement),
            neighborhood: orNull(location.neighborhood),
            city: location.city.trim(),
            state: location.state.toUpperCase(),
            latitude: toCoord(location.latitude),
            longitude: toCoord(location.longitude),
        },
        responsible: {
            name: responsible.name.trim(),
            phone: orNull(digits(responsible.phone)),
            email: orNull(responsible.email.toLowerCase()),
        },
        referralCode: orNull(review?.referralCode ?? ""),
    };
}