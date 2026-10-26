// "Suggest to my manager" on app pages (Cody included). Pure, for node --test.
// The backend decides who may send and who can receive; none of this is access control.

export const SUGGESTION_MESSAGE_MAX = 400

export interface SuggestionStatus {
    can_suggest: boolean
    reason: string | null
    remaining: number
    recipients: { uuid: string, name: string }[]
    /** ISO time of this user's latest suggestion of the app; absent on an older backend. */
    last_suggested_at?: string | null
    /** Purchasers only: who asked recently. Absent or empty on an older backend. */
    recent_suggesters?: { firstname: string, suggested_at: string }[]
}

export type SuggestionOutcome = 'sent' | 'already' | 'limit' | 'none'

// A personal identity number in free text goes out by email, so it is caught before sending.
// The backend applies the same rule and is the one that refuses.
export function looksLikePersonalNumber(text: string): boolean {
    return /\b\d{6}[- ]?\d{4}\b/.test(text)
}

export type MessageProblem = 'too_long' | 'personal_number' | null

export function messageProblem(text: string): MessageProblem {
    if (text.length > SUGGESTION_MESSAGE_MAX) return 'too_long'
    if (looksLikePersonalNumber(text)) return 'personal_number'
    return null
}

/**
 * Whether to offer the button at all. The backend's answer is what counts; the app's own
 * state (already bought) and a missing answer only keep the page quiet.
 */
export function shouldOfferSuggestion(opts: {
    isBuyer: boolean
    appActivated: boolean
    status: SuggestionStatus | null
}): boolean {
    if (opts.isBuyer || opts.appActivated) return false
    return !!opts.status?.can_suggest && opts.status.recipients.length > 0
}

// One obvious choice is made for the person; with several, they pick.
export function initialSelection(recipients: { uuid: string }[]): string[] {
    return recipients.length === 1 ? [recipients[0]!.uuid] : []
}

export function toggleRecipient(selected: string[], uuid: string): string[] {
    return selected.includes(uuid) ? selected.filter(id => id !== uuid) : [...selected, uuid]
}

export function suggestionOutcome(result: { sent?: boolean, reason?: string } | null | undefined): SuggestionOutcome {
    if (result?.sent) return 'sent'
    if (result?.reason === 'already_suggested') return 'already'
    if (result?.reason === 'limit_reached') return 'limit'
    return 'none'
}

export type StaffAskState = 'send' | 'already' | 'no_recipient' | 'company_has' | 'none'

/**
 * What the Cody preview tells staff who cannot buy, from the backend's own answer.
 * The reasons are the ones ManagerSuggestionService returns; anything else (a missing
 * answer, a limit, no company) keeps the preview quiet rather than guessing.
 */
export function staffAskState(status: SuggestionStatus | null): StaffAskState {
    if (!status) return 'none'
    if (status.can_suggest && status.recipients.length > 0) return 'send'
    if (status.reason === 'already_suggested') return 'already'
    if (status.reason === 'no_recipient') return 'no_recipient'
    if (status.reason === 'already_bought') return 'company_has'
    return 'none'
}

/** The trial length to print: the backend's number, else the app's, else 14. */
export function trialDays(...candidates: Array<number | string | null | undefined>): number {
    for (const c of candidates) {
        const n = Number(c)
        if (c !== null && c !== undefined && c !== '' && Number.isFinite(n) && n > 0) return n
    }
    return 14
}

/** First names for the "asked for by" line: distinct, at most `max`, and how many are left. */
export function suggesterSummary(
    list: Array<{ firstname?: string | null }> | null | undefined,
    max = 3,
): { names: string[], more: number } {
    const names: string[] = []
    for (const s of list ?? []) {
        const name = String(s?.firstname ?? '').trim()
        if (name && !names.includes(name)) names.push(name)
    }
    return { names: names.slice(0, max), more: Math.max(0, names.length - max) }
}
