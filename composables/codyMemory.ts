/**
 * What Cody AI remembers about the person using it - the pure parts, so they
 * can be tested without a browser.
 *
 * Cody AI never remembers on its own. It proposes one sentence under an
 * answer and asks; only "Ja" stores it, by sending back the token the server
 * issued with the proposal. The text itself never travels from here to the
 * server, so nothing typed or altered in the browser can become a memory.
 */

export interface CodyMemoryProposal {
    token: string
    content: string
}

/** The `cody_memory` block of an answer payload. Null when the answer touched no memory. */
export interface CodyMemoryPayload {
    proposal: CodyMemoryProposal | null
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
    | { kind: 'proposal', token: string, content: string, busy?: boolean, failed?: boolean }
    | { kind: 'saved', content: string, firstSaved: boolean }
    | { kind: 'already_known', content: string }
    | { kind: 'refused' }
    | { kind: 'expired' }
    | { kind: 'storage_full', message: string | null, upgradeUrl: string | null }

/** Where the notes send people: the section on their own profile page. */
export const CODY_MEMORY_PAGE = '/settings/profile#cody-memory'

/** Anchor id of that section, kept next to the link so the two cannot drift. */
export const CODY_MEMORY_ANCHOR = 'cody-memory'

/**
 * The note to show under one answer, if any.
 *
 * A proposal is a question for the user. Storage full is said once per panel
 * session: an answer every few minutes saying the storage is full turns into
 * noise the user learns to scroll past.
 */
export function memoryNoteFor(
    payload: CodyMemoryPayload | null | undefined,
    seen: { storageFullShown: boolean },
): CodyMemoryNote | null {
    if (!payload || typeof payload !== 'object') return null

    const proposal = payload.proposal
    if (proposal && typeof proposal.token === 'string' && proposal.token !== ''
        && typeof proposal.content === 'string' && proposal.content.trim() !== '') {
        return { kind: 'proposal', token: proposal.token, content: proposal.content }
    }

    if (payload.storage_full && !seen.storageFullShown) {
        return {
            kind: 'storage_full',
            message: payload.storage_message ?? null,
            upgradeUrl: safeUpgradeUrl(payload.upgrade_url),
        }
    }

    return null
}

/**
 * What the note becomes after "Ja", from the confirm endpoint's answer or the
 * error it threw. A failure nobody explained (offline, 5xx) keeps the question
 * so the user can try again; everything else replaces it.
 */
export function noteAfterConfirm(
    proposal: { token: string, content: string },
    outcome: { ok: true, body: any } | { ok: false, error: any },
): CodyMemoryNote {
    if (outcome.ok) {
        const body = outcome.body ?? {}
        if (body.already_known) return { kind: 'already_known', content: proposal.content }

        return {
            kind: 'saved',
            content: body.data?.content ?? proposal.content,
            firstSaved: body.first_saved === true,
        }
    }

    const error = outcome.error ?? {}

    if (error.code === 'storage_quota_exceeded') {
        return { kind: 'storage_full', message: error.message ?? null, upgradeUrl: safeUpgradeUrl(error.upgrade_url) }
    }
    if (error.code === 'cody_memory_refused') return { kind: 'refused' }
    if (error.code === 'cody_memory_proposal_expired' || error.status === 404) return { kind: 'expired' }

    return { kind: 'proposal', token: proposal.token, content: proposal.content, failed: true }
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
