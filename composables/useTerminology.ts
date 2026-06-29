import { useUserStore } from '@/store/user'

type TermKey = 'journals' | 'journal' | 'journalNoteTag' | 'journalNotes'

/**
 * Per-company terminology overrides for the journal word list.
 * Returns the company's custom term when set, otherwise the given default
 * (usually the i18n translation): term('journals', $t('...')).
 */
export function useTerminology() {
    const userStore = useUserStore() as any

    function term(key: TermKey, fallback: string): string {
        const company = userStore.getUser?.company
        const map: Record<TermKey, string | null | undefined> = {
            journals: company?.term_journals,
            journal: company?.term_journal,
            journalNoteTag: company?.term_journal_note_tag,
            journalNotes: company?.term_journal_notes,
        }
        const custom = map[key]
        return custom && String(custom).trim() ? String(custom) : fallback
    }

    return { term }
}
