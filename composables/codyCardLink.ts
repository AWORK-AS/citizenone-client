/**
 * Where a Cody AI answer card leads when it is pressed.
 *
 * The server builds the link. For a journal note it is the citizen's journal
 * list (`/citizens/{uuid}/journals`), not the note itself, and someone who is
 * already on that list (the usual case when Cody AI has just saved a draft
 * there) pressed the card and nothing happened (AW-2026-10792). The journal
 * page already opens one note from `?open_journal=` (journals.vue), so the
 * card adds it here, with the note's own ref.
 *
 * Added in the client, not on the server: the app reads the citizen out of the
 * same link with an anchored pattern (mobile apis/codyResponse.ts), so a query
 * on the server's link would make the app drop every draft card.
 *
 * Kept dependency-free so tests/unit/*.test.mjs can import it under
 * `node --test`.
 */

const JOURNAL_LIST = /^\/citizens\/[^/?#]+\/journals$/

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function codyCardLink(card: { type?: unknown, ref?: unknown, link?: unknown }): string | undefined {
    const link = typeof card.link === 'string' && card.link !== '' ? card.link : undefined

    if (link && card.type === 'journal_note' && JOURNAL_LIST.test(link)
        && typeof card.ref === 'string' && UUID.test(card.ref)) {
        return `${link}?open_journal=${card.ref}`
    }

    return link
}
