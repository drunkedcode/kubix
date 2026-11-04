import type { MemberData } from "./MemberStep";

/** Convierte lo que juntó el wizard en lo que espera el backend. El territorio viene de la URL. */
export function toPayload(data: Record<string, any>) {
    const member = data.member as MemberData;

    return {
        user_id: member.user!.id,
        role: member.role,
    };
}