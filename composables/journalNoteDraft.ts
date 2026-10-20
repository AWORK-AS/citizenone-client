// An unsaved new journal note, kept while the user writes it, so it survives an accidental close,
// a reload or a session that ran out mid-note (the login redirect keeps the tab).
//
// sessionStorage on purpose, not localStorage: a note is health data, and care-home computers are
// shared. The draft lives in this tab only, is keyed to the signed-in user and the citizen, expires
// after DRAFT_TTL_MS, and is removed on save and on log out. Pure apart from the storage passed in,
// for node --test.

export interface JournalNoteDraft {
    title: string
    content: string
    note: string
    savedAt: number
}

export const DRAFT_TTL_MS = 12 * 60 * 60 * 1000
const PREFIX = 'journal-note-draft:'

type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>

export function draftKey(userUuid: string | null | undefined, citizenUuid: string | null | undefined): string | null {
    return userUuid && citizenUuid ? `${PREFIX}${userUuid}:${citizenUuid}` : null
}

/** Text with the editor's empty markup ("<p></p>", "&nbsp;") taken away. */
export function plainText(html: string | null | undefined): string {
    return String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim()
}

export function hasWriting(fields: { title?: string | null, content?: string | null, note?: string | null }): boolean {
    return plainText(fields.title) !== '' || plainText(fields.content) !== '' || plainText(fields.note) !== ''
}

export function saveDraft(storage: Storage, key: string | null, fields: { title?: string | null, content?: string | null, note?: string | null }, now = Date.now()): void {
    if (!key) return
    try {
        if (!hasWriting(fields)) {
            storage.removeItem(key)
            return
        }
        const draft: JournalNoteDraft = {
            title: String(fields.title ?? ''),
            content: String(fields.content ?? ''),
            note: String(fields.note ?? ''),
            savedAt: now,
        }
        storage.setItem(key, JSON.stringify(draft))
    } catch { /* storage full or blocked: the note itself is still in the form */ }
}

export function loadDraft(storage: Storage, key: string | null, now = Date.now()): JournalNoteDraft | null {
    if (!key) return null
    try {
        const raw = storage.getItem(key)
        if (!raw) return null
        const draft = JSON.parse(raw) as JournalNoteDraft
        if (!draft?.savedAt || now - draft.savedAt > DRAFT_TTL_MS || !hasWriting(draft)) {
            storage.removeItem(key)
            return null
        }
        return draft
    } catch {
        return null
    }
}

export function clearDraft(storage: Storage, key: string | null): void {
    if (!key) return
    try { storage.removeItem(key) } catch { /* nothing to clear */ }
}

/** On log out: every draft in this tab goes, whoever wrote it. */
export function clearAllDrafts(storage: Storage): void {
    try {
        const keys: string[] = []
        for (let i = 0; i < storage.length; i++) {
            const k = storage.key(i)
            if (k?.startsWith(PREFIX)) keys.push(k)
        }
        keys.forEach(k => storage.removeItem(k))
    } catch { /* nothing to clear */ }
}
