// The "provided by CitizenOne" line in the portals and on the secure-mail page.
// Mirrors App\Support\CitizenOneAttribution on the backend: same tracking, so a
// signup from either side lands in the superadmin "product" channel.

export const ATTRIBUTION_UTM_SOURCE = 'citizenone_product'

/** @param medium where the link sits: 'portal' here, 'pdf'/'email' on the backend */
export function citizenoneAttributionUrl(medium: string): string {
    const query = new URLSearchParams({
        utm_source: ATTRIBUTION_UTM_SOURCE,
        utm_medium: medium,
        utm_campaign: 'attribution',
    })
    return `https://citizenone.dk/?${query.toString()}`
}

/** On unless the company has switched it off. An older payload without the field shows it. */
export function citizenoneAttributionShown(company: any): boolean {
    return company?.hide_citizenone_attribution !== true
}
