import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store/user'

/**
 * The words these locales already used, so switching the mechanism on does not
 * quietly reword an app that had no override: no says bruker, sv says klient.
 */
const CITIZEN_DEFAULTS: Record<string, Record<string, string>> = {
    dk: { citizen: 'borger', theCitizen: 'borgeren', citizens: 'borgere', theCitizens: 'borgerne' },
    en: { citizen: 'citizen', theCitizen: 'the citizen', citizens: 'citizens', theCitizens: 'the citizens' },
    no: { citizen: 'bruker', theCitizen: 'brukeren', citizens: 'brukere', theCitizens: 'brukerne' },
    sv: { citizen: 'klient', theCitizen: 'klienten', citizens: 'klienter', theCitizens: 'klienterna' },
}

/**
 * The four citizen words as i18n messages, so every Danish string that mentions
 * a citizen can reach them as a link rather than spelling the word out.
 *
 * This exists because term() only ever reached the call sites that asked for it,
 * and none of the citizen ones did: 401 Danish strings said borger outright, so
 * a dental company that had already set term_citizen to patient still read
 * Borgere in the sidebar. Rewriting those strings as links moves the
 * substitution into vue-i18n itself, which needs the words to exist as messages
 * under terms.*.
 *
 * Every locale gets its own words, since the locales whose strings have not been
 * rewritten keep their own defaults: no says bruker, sv says klient.
 */
/**
 * Characters vue-i18n's message compiler treats as syntax.
 *
 * Measured against 9.13.1 with the rewritten strings: a term of '@:terms.citizen' raises Maximum
 * call stack size exceeded and takes the whole app down, '{count}' makes the word vanish, and
 * 'a|b' is truncated to 'a' because the pipe separates plural forms.
 */
const COMPILER_SYNTAX = /[@{}|%<>$]/g

export function terminologyMessages(company: any): Record<string, { terms: Record<string, string> }> {
    /**
     * The backend refuses these characters (App\Rules\TerminologyWord), and this strips them
     * again. Not duplicated work: rows already in the database were written before that rule
     * existed, and a stored '@:terms.citizen' would otherwise crash the app on load, which is
     * exactly the situation where a validation error is no longer available to us.
     */
    const clean = (word: string) => word.replace(COMPILER_SYNTAX, '').trim()

    const pick = (custom: unknown, fallback: string) => {
        const word = custom ? clean(String(custom)) : ''

        return word !== '' ? word : fallback
    }

    const messages: Record<string, { terms: Record<string, string> }> = {}

    for (const [locale, defaults] of Object.entries(CITIZEN_DEFAULTS)) {
        messages[locale] = {
            terms: {
                citizen: pick(company?.term_citizen, defaults.citizen),
                citizenDefinite: pick(company?.term_citizen_definite, defaults.theCitizen),
                citizens: pick(company?.term_citizens, defaults.citizens),
                citizensDefinite: pick(company?.term_citizens_definite, defaults.theCitizens),
            },
        }
    }

    return messages
}

function upperFirst(value: string) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value
}

type TermKey = 'journals' | 'journal' | 'journalNoteTag' | 'journalNotes' | 'caseworker' | 'case' | 'agreement' | 'jobcenter'
    | 'citizen' | 'citizenDefinite' | 'citizens' | 'citizensDefinite'

/**
 * Per-company terminology overrides for the journal word list.
 * Returns the company's custom term when set, otherwise the given default
 * (usually the i18n translation): term('journals', $t('...')).
 */
export function useTerminology() {
    const userStore = useUserStore() as any
    // useI18n() may only be called while a component is setting up. Calling it
    // inside tt() meant every use from an event handler or a callback - a toast
    // after saving, a confirm before deleting - threw instead of returning a
    // sentence, and took the page down with it.
    const { t: translate, locale } = useI18n()

    function term(key: TermKey, fallback: string): string {
        const company = userStore.getUser?.company
        const map: Record<TermKey, string | null | undefined> = {
            journals: company?.term_journals,
            journal: company?.term_journal,
            journalNoteTag: company?.term_journal_note_tag,
            journalNotes: company?.term_journal_notes,
            caseworker: company?.term_caseworker,
            case: company?.term_case,
            agreement: company?.term_agreement,
            jobcenter: company?.term_jobcenter,
            citizen: company?.term_citizen,
            citizenDefinite: company?.term_citizen_definite,
            citizens: company?.term_citizens,
            citizensDefinite: company?.term_citizens_definite,
        }
        const custom = map[key]
        return custom && String(custom).trim() ? String(custom) : fallback
    }

    /**
     * Translates a key and fills in the renameable words, so a string that
     * mentions a citizen follows the company's own term. Both the lower-case and
     * the capitalised form are offered, since the word can start a sentence or
     * sit inside one. With no override set, the standard word is used and
     * nothing changes.
     *
     * The inflected forms are stored rather than derived: Danish cannot be
     * inflected from the singular (indsats / indsatsen / indsatser /
     * indsatserne), and a wrong guess would land in the customer's own UI.
     */
    function tt(key: string, params: Record<string, any> = {}): string {
        const defaults = CITIZEN_DEFAULTS[String(locale.value)] ?? CITIZEN_DEFAULTS.dk

        const citizen = term('citizen', defaults.citizen)
        const theCitizen = term('citizenDefinite', defaults.theCitizen)
        const citizens = term('citizens', defaults.citizens)
        const theCitizens = term('citizensDefinite', defaults.theCitizens)

        return translate(key, {
            citizen,
            theCitizen,
            citizens,
            theCitizens,
            Citizen: upperFirst(citizen),
            TheCitizen: upperFirst(theCitizen),
            Citizens: upperFirst(citizens),
            TheCitizens: upperFirst(theCitizens),
            ...params,
        })
    }

    /**
     * The company's word with a capital first letter, for places that name a
     * thing rather than talk about it - a menu entry, a page heading, a tab.
     * The terms are stored lower-case ("patienter"), so a raw term() there
     * would read "patienter" in a list of otherwise capitalised labels.
     */
    function termTitle(key: TermKey, fallback: string): string {
        const value = term(key, fallback)
        return value === fallback ? value : upperFirst(value)
    }

    /**
     * What to call the person, given whatever the company's custom page name
     * holds. Every company is seeded that name with the standard word, so
     * taking it whenever it is set would mean the seed always beats the term a
     * company or its industry actually chose. A name equal to the standard word
     * is the seed, not a rename.
     *
     * Resolved once where the store is filled, so the seventy places that read
     * the store get the right word without each having to know this rule.
     */
    function citizensLabel(customName: string | null | undefined, standard: string): string {
        const renamed = (customName || '').trim()
        return renamed && renamed !== standard ? renamed : termTitle('citizens', standard)
    }

    return { term, termTitle, citizensLabel, tt }
}
