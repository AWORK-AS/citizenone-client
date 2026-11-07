// A chat message Cody AI drafted, on its way to the normal chat. Pure, for node --test.
//
// The draft travels in memory only (store/chat-draft.ts), never in a URL: it can
// name a citizen, and URLs end up in history, logs and referrer headers. The
// path to the chat carries what the chat already puts in its own paths - a
// conversation uuid - and nothing else.
//
// Nothing here sends anything. The chat page puts the text in its field; the
// user reads it and presses send.

export type ChatDraftTarget = { type: 'chat' | 'employee', uuid: string }

export interface ChatDraftPrefill {
    target: ChatDraftTarget
    text: string
    createdAt: number
}

/** A prefill older than this is dropped rather than turning up in a chat opened much later. */
export const PREFILL_MAX_AGE_MS = 10 * 60 * 1000

/** The prefill a `chat_message` card hands to the chat, or null for anything that is not one. */
export function prefillFromCard(card: any, now: number = Date.now()): ChatDraftPrefill | null {
    if (card?.type !== 'chat_message') return null

    const type = card?.target?.type
    const uuid = card?.target?.uuid
    const text = typeof card?.draft === 'string' ? card.draft.trim() : ''

    if ((type !== 'chat' && type !== 'employee') || typeof uuid !== 'string' || !uuid || !text) return null

    return { target: { type, uuid }, text, createdAt: now }
}

/** Where "Åbn i chat" goes: the conversation, or the chat page to start a new one. Never the text. */
export function chatPathFor(target: ChatDraftTarget): string {
    return target.type === 'chat' ? `/messages/${encodeURIComponent(target.uuid)}` : '/messages'
}

/**
 * The text for this target, if the pending prefill is for it and still fresh.
 * Anything else - another conversation, an old draft - is not handed out.
 */
export function prefillTextFor(
    pending: ChatDraftPrefill | null,
    target: ChatDraftTarget,
    now: number = Date.now(),
): string | null {
    if (!pending) return null
    if (now - pending.createdAt > PREFILL_MAX_AGE_MS) return null
    if (pending.target.type !== target.type || pending.target.uuid !== target.uuid) return null

    return pending.text
}

/**
 * What the chat field holds after the draft lands. Something already typed
 * there is kept, with the draft below it, rather than overwritten.
 */
export function mergeIntoField(current: string, draft: string): string {
    return current && current.trim() ? `${current}\n${draft}` : draft
}
