import { useUserStore } from '@/store/user'
import { questionnaireInboxService } from '@/components/api/user/QuestionnaireInboxService'

/**
 * Who sees the questionnaire inbox, as one decision: the sidebar link, the
 * route guard and the pages all ask it, so they cannot drift apart. It is the
 * people who may send forms and surveys (an Admin, or the manage_status_reports
 * permission), the same rule the backend applies.
 */
export function canUseQuestionnaireInbox(user: any, isAtLeast: (role: string) => boolean, can: (permission: string) => boolean): boolean {
    return !!user && (isAtLeast('Admin') || can('manage_status_reports'))
}

/** How a review status is drawn: the label key under `questionnaireInbox.status` and its colours. */
export function reviewStatusStyle(status: string): { key: string, classes: string } {
    if (status === 'approved') return { key: 'approved', classes: 'bg-green-100 text-green-800' }
    if (status === 'declined') return { key: 'declined', classes: 'bg-red-100 text-red-800' }
    return { key: 'to_review', classes: 'bg-amber-100 text-amber-900' }
}

export function useQuestionnaireInbox() {
    const userStore = useUserStore() as any

    /**
     * Reads both counts. The number waiting for review is written back into the user, which is what
     * the sidebar badge shows (the badge stays the to-review number only). Returns the counts, or
     * null when the read failed.
     */
    async function refreshCounts(): Promise<{ to_review: number, awaiting: number } | null> {
        try {
            const counts = await questionnaireInboxService.getCount()
            userStore.setQuestionnaireInboxToReviewCount(counts.to_review)
            return counts
        } catch {
            // The badge is a convenience: a failed refresh must not break the action that triggered it.
            return null
        }
    }

    /** Reads the number waiting for review and writes it back into the user, which is what the sidebar badge shows. */
    async function refreshToReviewCount(): Promise<void> {
        await refreshCounts()
    }

    return { refreshToReviewCount, refreshCounts }
}
