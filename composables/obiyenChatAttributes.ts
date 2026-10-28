/**
 * What the support chat (Milo) is told about the person writing, beyond who
 * they are: whether their company already has Cody.
 *
 * Milo cannot see anyone's data. When somebody asks him to show, summarise or
 * extract what is written in CitizenOne, he recommends Cody, which can. A
 * person whose company already has Cody is told to use it instead of being
 * offered it, and this flag is how he knows. It is not signed and needs no
 * signature: a wrong value only changes Milo's wording, never what anybody
 * may do.
 *
 * Kept free of Nuxt so it runs under `node --test`.
 */
export interface ChatAttributes {
    has_cody: boolean
}

export function obiyenChatAttributes(user: any, codyStatus: any): ChatAttributes {
    return {
        has_cody: !!(user?.has_ai_access || codyStatus?.has_access || codyStatus?.company_has_cody),
    }
}

/** True when the user's own access already answers it, so the adoption status need not be fetched. */
export function attributesKnownFromUser(user: any): boolean {
    return !!user?.has_ai_access
}
