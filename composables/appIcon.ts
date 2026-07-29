// Shared icon treatment for the app store.
//
// CitizenONE-owned apps (platform features + CitizenONE marketing/visual
// services) get a distinct on-brand glyph rendered on a branded gradient tile
// (see the `.brand-tile` style), so they read as one premium CitizenONE product
// family. Genuine third-party vendor apps (Meta, Google, e-conomic, Zenegy,
// OneDrive, Power BI, ...) are NOT in this map and keep their own vendor logo.
const APP_ICONS: Record<string, string> = {
    // Platform features
    'booking': 'ph:calendar-check',
    'citizenone-ai': 'ph:sparkle',
    'custom-gpt': 'ph:robot',
    'leads': 'ph:target',
    'sms-notification': 'ph:chat-teardrop-text',
    'citizen-access': 'ph:user-circle',
    'relative-access': 'ph:users-three',
    'third-party-access': 'ph:handshake',
    'caseworker-access': 'ph:briefcase',
    'send-invoices': 'ph:receipt',
    'secure-mail': 'ph:envelope-simple',
    'regular-mail': 'ph:envelope',
    'consent-plus': 'ph:seal-check',
    'clip-card': 'ph:ticket',
    'hosting': 'ph:hard-drives',
    // CitizenONE marketing / visual services
    'seo': 'ph:chart-line-up',
    'brand-package': 'ph:package',
    'website': 'ph:browser',
    'photo-video': 'ph:camera',
}

/**
 * Decide how to render an app's icon.
 * @returns { icon, useTile } - when useTile is true render <Icon :name="icon"/>
 *          inside a `.brand-tile`; otherwise fall back to the app's vendor logo.
 */
export function appIconFor(app: any): { icon: string | null; useTile: boolean } {
    const icon = APP_ICONS[app?.generic_name as string] || null

    return { icon, useTile: !!icon }
}
