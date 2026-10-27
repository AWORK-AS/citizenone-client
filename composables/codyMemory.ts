/**
 * What Cody AI remembers about the person using it - the pure parts, so they
 * can be tested without a browser.
 *
 * The backend decides everything that matters (what may be stored, whose it
 * is, the storage quota). This file only decides what the panel and the
 * settings page show about it.
 */

/** The `cody_memory` block of an answer payload. Null when the answer touched no memory. */
export interface CodyMemoryPayload {
    saved: number
    first_saved: boolean
    storage_full: boolean
    storage_message: string | null
    upgrade_url: string | null
}

export interface CodyMemory {
    uuid: string
    content: string
    learned_at: string | null
    last_used_at: string | null
}

export type CodyMemoryNote =
    | { kind: 'first_saved' }
    | { kind: 'storage_full', message: string | null, upgradeUrl: string | null }

/** Where the one-time note sends people: the section on their own profile page. */
export const CODY_MEMORY_PAGE = '/settings/profile#cody-memory'

/** Anchor id of that section, kept next to the link so the two cannot drift. */
export const CODY_MEMORY_ANCHOR = 'cody-memory'

/**
 * The note to show under one answer, if any.
 *
 * Storage full wins over the first-time note: if the memory was not stored
 * there is nothing to go and look at. It is shown once per panel session -
 * an answer every few minutes saying the storage is full turns into noise
 * the user learns to scroll past, and the upgrade prompt elsewhere stays.
 */
export function memoryNoteFor(
    payload: CodyMemoryPayload | null | undefined,
    seen: { storageFullShown: boolean },
): CodyMemoryNote | null {
    if (!payload || typeof payload !== 'object') return null

    if (payload.storage_full) {
        if (seen.storageFullShown) return null

        return {
            kind: 'storage_full',
            message: payload.storage_message ?? null,
            upgradeUrl: safeUpgradeUrl(payload.upgrade_url),
        }
    }

    if (payload.first_saved) return { kind: 'first_saved' }

    return null
}

/**
 * Only an in-app path is followed. The server sends '/storage/upgrade' or
 * nothing; anything else - an absolute URL, a protocol-relative '//host' - is
 * dropped rather than navigated to.
 */
export function safeUpgradeUrl(url: unknown): string | null {
    if (typeof url !== 'string') return null
    if (!url.startsWith('/') || url.startsWith('//') || url.includes('\\')) return null

    return url
}

/** Newest learned first, the order the settings page lists them in. */
export function sortMemories(memories: CodyMemory[]): CodyMemory[] {
    return [...memories].sort((a, b) => stamp(b.learned_at) - stamp(a.learned_at))
}

export function withoutMemory(memories: CodyMemory[], uuid: string): CodyMemory[] {
    return memories.filter((memory) => memory.uuid !== uuid)
}

function stamp(value: string | null): number {
    const time = value ? Date.parse(value) : NaN

    return Number.isNaN(time) ? 0 : time
}
