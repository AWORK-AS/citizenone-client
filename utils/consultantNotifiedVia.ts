export type NotifiedVia = { mail?: boolean, app?: boolean, sms?: string } | null | undefined

/**
 * How an invited consultant was told, as keys under inquiryInvitations.channels:
 * mail, app, and sms only when the SMS actually went out. Empty means nobody
 * reached them, so the coordinator has to.
 */
export function notifiedChannels(told: NotifiedVia): string[] {
    if (!told) return []

    return [told.mail && 'mail', told.app && 'app', told.sms === 'sent' && 'sms'].filter(Boolean) as string[]
}
