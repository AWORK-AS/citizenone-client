// Roadmap #375: pinned messages in a chat. The pins are shared by every member
// and come with the open chat (GET .../chats/{uuid} → data.pinned_messages);
// staff pin and unpin, the portals only see them. Plain helpers, no Vue, so
// the staff page and the four portal pages share them and they can be tested
// with node --test (tests/unit/pinnedMessages.test.mjs).

export const PINNED_PREVIEW_LENGTH = 140

// Pages loaded at most while looking for an old pinned message, so a broken
// paging response can never loop forever.
export const MAX_PAGES_TO_FIND_PIN = 50

/**
 * The chat's pins, newest first as the server sends them. A missing or
 * malformed field (an older backend, a failed fetch) means no pins, so the
 * banner simply isn't shown.
 */
export function pinnedMessagesOf(chat: any): any[] {
    const pins = chat?.data?.pinned_messages ?? chat?.pinned_messages
    return Array.isArray(pins) ? pins.filter((pin: any) => pin?.uuid) : []
}

/** One line of plain text for the banner: tags stripped, whitespace collapsed, shortened. */
export function pinnedPreviewText(pin: any, maxLength = PINNED_PREVIEW_LENGTH): string {
    const text = String(pin?.message ?? '')
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/\s+/g, ' ')
        .trim()

    return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text
}

/** The next pin when the banner is clicked, wrapping round. */
export function nextPinIndex(current: number, count: number): number {
    if (count <= 0) return 0
    return (current + 1) % count
}

/** Keeps the banner's position valid when the list shrinks (an unpin) or empties. */
export function clampPinIndex(current: number, count: number): number {
    if (count <= 0) return 0
    return Math.min(Math.max(current, 0), count - 1)
}

/**
 * Brings the loaded messages' pinned_at in line with the chat's pin list, after
 * a pin, an unpin or a live "chat-message-pinned" event. Only messages whose
 * state differs are touched. Returns how many changed.
 */
export function syncPinnedAt(messages: any[], pins: any[]): number {
    const pinnedAt = new Map(pins.map((pin: any) => [pin.uuid, pin.pinned_at ?? null]))
    let changed = 0

    for (const message of messages ?? []) {
        if (!message?.uuid) continue
        const next = pinnedAt.get(message.uuid) ?? null
        if ((message.pinned_at ?? null) !== next) {
            message.pinned_at = next
            changed++
        }
    }

    return changed
}

export interface PinnedJumpOptions {
    container: () => { querySelector: (selector: string) => any } | null | undefined
    hasMessage: (uuid: string) => boolean
    isLastPage: () => boolean
    // Loads the next older page with the page's own paging (currentPage++ and fetch).
    // Resolving to false means the page failed: the search stops there.
    loadOlder: () => Promise<unknown>
    // Waits for the DOM to show what was just loaded (Vue's nextTick).
    settle: () => Promise<unknown>
}

/**
 * Scrolls to a pinned message, loading older pages until it is in the list or
 * there are none left. Returns false when it can't be found (deleted, or from
 * before the viewer cleared the chat).
 */
export async function jumpToPinnedMessage(uuid: string, options: PinnedJumpOptions): Promise<boolean> {
    if (!uuid) return false

    let pages = 0
    while (!options.hasMessage(uuid) && !options.isLastPage() && pages < MAX_PAGES_TO_FIND_PIN) {
        if ((await options.loadOlder()) === false) break
        pages++
    }

    await options.settle()

    const element = options.container()?.querySelector(`[data-uuid="${uuid.replace(/"/g, '')}"]`)
    if (!element) return false

    element.scrollIntoView?.({ block: 'center', behavior: 'smooth' })

    return true
}
