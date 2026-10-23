// "Suggest to my manager" on app pages (Cody included). Pure, for node --test.
// The backend decides who may send and who can receive; none of this is access control.

export const SUGGESTION_MESSAGE_MAX = 400

export interface SuggestionStatus {
    can_suggest: boolean
    reason: string | null
    remaining: number
    recipients: { uuid: string, name: string }[]
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
