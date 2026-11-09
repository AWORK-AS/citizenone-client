/**
 * A task Cody AI proposed - the pure parts, so they can be tested without a
 * browser.
 *
 * Cody AI never creates a task on its own. Text it reads (a journal, a task, a
 * document) can be written to steer it, so create_task only proposes: the
 * answer carries a `task_proposal` card, and the task exists only once the
 * user presses "Opret opgave". That button sends back the token the server
 * issued with the proposal and nothing else, so nothing typed or altered in
 * the browser can become the task.
 *
 * Kept dependency-free, like composables/codyMemory.ts, so
 * tests/unit/*.test.mjs can import it under `node --test`.
 */

/** The `task` card the server returns once the task exists. */
export interface CreatedTaskCard {
    type: 'task'
    ref: string
    title: string
    subtitle?: string | null
    facts?: Array<{ label: string, value: string }>
    badges?: string[]
    link?: string | null
}

export type TaskProposalState =
    | { kind: 'proposal', busy?: boolean, failed?: boolean }
    | { kind: 'created', card: CreatedTaskCard | null }
    | { kind: 'declined' }
    | { kind: 'expired' }

/** The card type the server sends for a proposal. */
export const TASK_PROPOSAL_CARD = 'task_proposal'

export const TASK_PROPOSAL_EXPIRED = 'cody_task_proposal_expired'

/** What the card shows after "Opret opgave" answered. */
export function stateAfterConfirm(
    outcome: { ok: true, body: any } | { ok: false, error: any },
): TaskProposalState {
    if (outcome.ok) {
        const card = outcome.body?.data

        return {
            kind: 'created',
            card: card?.type === 'task' && typeof card.ref === 'string' && card.title ? card as CreatedTaskCard : null,
        }
    }

    const error = outcome.error ?? {}

    // Used, expired, or never this user's: the same answer from the server.
    if (error.code === TASK_PROPOSAL_EXPIRED || error.status === 404) return { kind: 'expired' }

    return { kind: 'proposal', failed: true }
}

/** Only a proposal that is not already being sent can be pressed. */
export function canAct(state: TaskProposalState, answering: boolean): boolean {
    return state.kind === 'proposal' && !state.busy && !answering
}
