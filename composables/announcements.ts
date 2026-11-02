// "Nyt fra CitizenOne": the pure decisions behind the popup and the megaphone list.
// Kept free of Nuxt auto-imports so tests/unit/announcements.test.mjs can run it under
// `node --test`. The backend decides who sees a message and which button they get; this
// only turns that answer into words and a destination.

export type AnnouncementKind = 'feature' | 'news' | 'tip'

export type CtaAction = 'trial' | 'buy' | 'ask' | 'open'

export interface AnnouncementCta {
    action: CtaAction
    url: string
    /** Only for a message without an app: the editor's own button text. */
    label: string | null
    trial_days: number | null
}

export interface UserAnnouncement {
    uuid: string
    kind: AnnouncementKind
    title: string
    body: string
    image_url: string | null
    published_at: string | null
    app_name: string | null
    cta: AnnouncementCta | null
}

/** The i18n key (and its values) for the main button, or null when there is none. */
export function ctaText(cta: AnnouncementCta | null | undefined): { key: string, values?: Record<string, unknown>, literal?: string } | null {
    if (!cta) return null
    switch (cta.action) {
        case 'trial':
            return cta.trial_days ? { key: 'announcements.cta.trialDays', values: { days: cta.trial_days } } : { key: 'announcements.cta.trial' }
        case 'buy':
            return { key: 'announcements.cta.buy' }
        case 'ask':
            return { key: 'announcements.cta.ask' }
        case 'open':
            return cta.label ? { key: '', literal: cta.label } : { key: 'announcements.cta.open' }
        default:
            return null
    }
}

/** The small label above the title. */
export function eyebrowKey(kind: AnnouncementKind): string {
    if (kind === 'tip') return 'announcements.eyebrow.tip'
    if (kind === 'feature') return 'announcements.eyebrow.feature'
    return 'announcements.eyebrow.news'
}

/**
 * Where the button goes. A page in the app opens in place; a secure external link opens
 * in a new tab. Anything else is refused here too, even though the backend never stores it.
 */
export function ctaTarget(url: string | null | undefined): { kind: 'internal' | 'external', url: string } | null {
    if (!url) return null
    if (url.startsWith('/') && !url.startsWith('//')) return { kind: 'internal', url }
    if (url.startsWith('https://')) return { kind: 'external', url }
    return null
}

/** "1 af 3" when more are waiting behind the one shown. */
export function queueLabel(queued: number): { position: number, total: number } | null {
    return queued > 0 ? { position: 1, total: queued + 1 } : null
}

/** A tip is a small card; a feature or news message can carry an image. */
export function showsImage(item: Pick<UserAnnouncement, 'kind' | 'image_url'>): boolean {
    return item.kind !== 'tip' && !!item.image_url
}
