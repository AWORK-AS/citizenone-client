/**
 * Something Cody AI proposed - the pure parts, so they can be tested without a
 * browser.
 *
 * Cody AI never writes a record on its own. Text it reads (a journal, a task,
 * a document) can be written to steer it, so a tool that would write only
 * proposes: the answer carries a proposal card (a task, a journal draft), and
 * the record exists only once the user presses the button. That button sends
 * back the token the server issued with the proposal and nothing else, so
 * nothing typed or altered in the browser can become the record.
 *
 * Kept dependency-free, like composables/codyMemory.ts, so
 * tests/unit/*.test.mjs can import it under `node --test`.
 */

/** The card the server returns once the record exists. */
export interface CreatedCard {
    type: string
    ref: string
    title: string
    subtitle?: string | null
    facts?: Array<{ label: string, value: string }>
    badges?: string[]
    link?: string | null
}

export type ProposalState =
    | { kind: 'proposal', busy?: boolean, failed?: boolean }
    | { kind: 'created', card: CreatedCard | null }
    | { kind: 'declined' }
    | { kind: 'expired' }

/**
 * Every proposal card the client draws: the card type the server sends, the
 * card it becomes once written, its copy under assistants.*, and its icon.
 */
export const PROPOSAL_CARDS = {
    task_proposal: { created: 'task', copy: 'taskProposal', icon: 'ph:check-square-offset' },
    journal_note_proposal: { created: 'journal_note', copy: 'journalProposal', icon: 'ph:notebook' },
} as const

export type ProposalCardType = keyof typeof PROPOSAL_CARDS

export const TASK_PROPOSAL_CARD = 'task_proposal'

export const JOURNAL_PROPOSAL_CARD = 'journal_note_proposal'

/** The server's "used, expired or never yours": the same 404 for all of them. */
export const PROPOSAL_EXPIRED_CODES = ['cody_proposal_expired', 'cody_task_proposal_expired']

export function isProposalCard(type: unknown): type is ProposalCardType {
    return typeof type === 'string' && Object.prototype.hasOwnProperty.call(PROPOSAL_CARDS, type)
}

/** What the card shows after the button answered. */
export function stateAfterConfirm(
    outcome: { ok: true, body: any } | { ok: false, error: any },
    proposalType: string = TASK_PROPOSAL_CARD,
): ProposalState {
    if (outcome.ok) {
        const card = outcome.body?.data
        const created = isProposalCard(proposalType) ? PROPOSAL_CARDS[proposalType].created : null

        return {
            kind: 'created',
            card: created && card?.type === created && typeof card.ref === 'string' && card.title ? card as CreatedCard : null,
        }
    }

    const error = outcome.error ?? {}

    if (PROPOSAL_EXPIRED_CODES.includes(error.code) || error.status === 404) return { kind: 'expired' }

    return { kind: 'proposal', failed: true }
}

/** Only a proposal that is not already being sent can be pressed. */
export function canAct(state: ProposalState, answering: boolean): boolean {
    return state.kind === 'proposal' && !state.busy && !answering
}
