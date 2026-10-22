/**
 * What a thumbs press does to an answer's rating, apart from saving it.
 *
 * Kept out of useCodyChat so it can be tested without a panel, a store or a
 * server: the rules are small, but a wrong one either loses a rating someone
 * gave or sends a reason the backend drops.
 *
 *   - Pressing the rating that is already set takes it back.
 *   - Picking a reason after a thumbs down keeps the thumbs down; it is not a
 *     second press of the same button.
 *   - A reason only ever travels with a thumbs down.
 */
export type AnswerRating = 'up' | 'down' | null

export const ANSWER_FEEDBACK_REASONS = ['wrong', 'incomplete', 'not_helpful', 'other'] as const

export type AnswerFeedbackReason = typeof ANSWER_FEEDBACK_REASONS[number]

export interface AnswerFeedbackState {
    feedback: AnswerRating
    feedbackReason: AnswerFeedbackReason | null
    feedbackGiven: boolean
}

export function nextFeedback(
    previous: AnswerRating | undefined,
    rating: AnswerRating,
    reason: AnswerFeedbackReason | null = null,
): AnswerFeedbackState {
    const feedback = rating !== null && rating === (previous ?? null) && reason === null ? null : rating

    return {
        feedback,
        feedbackReason: feedback === 'down' ? reason : null,
        feedbackGiven: feedback !== null,
    }
}
