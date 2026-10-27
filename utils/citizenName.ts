type CitizenLike = { uuid?: string, firstname?: string | null, lastname?: string | null } | null | undefined

/**
 * The citizen's name for the breadcrumb, or '' while the store still holds a
 * different citizen (it keeps the previous one until the new header has loaded).
 */
export function citizenNameFor(citizen: CitizenLike, routeUuid: string): string {
    if (!citizen?.uuid || citizen.uuid !== routeUuid) return ''
    return `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim()
}
