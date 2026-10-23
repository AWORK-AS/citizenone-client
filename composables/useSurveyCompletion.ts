import { useI18n } from 'vue-i18n'
import { surveyService } from '@/components/api/user/SurveyService'
import { useAlert } from '@/composables/alert'
import { completeSurveyEntries, type PendingSurveyAnswer } from '@/composables/surveyCompletion'

/**
 * Completes the surveys answered in a journal note and, when some fail,
 * warns with a "Try again" action that re-sends only the failed ones.
 */
export function useSurveyCompletion() {
    const { t } = useI18n()
    const { successAlert, warningAlertWithAction } = useAlert()

    async function attempt(journalUuid: string, entries: PendingSurveyAnswer[] | null | undefined, isRetry: boolean) {
        const failed = await completeSurveyEntries(entries, (entry) =>
            surveyService.completeAssignment(entry.assignment_uuid, {
                answers: entry.answers,
                citizen_journal_uuid: journalUuid,
            }),
        )

        if (failed.length === 0) {
            if (isRetry) successAlert(`${t('alert.success')}!`, t('citizens.citizenJournals.alert.surveysRetried'))
            return
        }

        // The note itself is saved; only the failed surveys are offered again.
        warningAlertWithAction(
            t('alert.error'),
            t('citizens.citizenJournals.alert.surveysNotCompleted', { n: failed.length }),
            {
                label: t('citizens.citizenJournals.alert.surveysRetry'),
                run: () => attempt(journalUuid, failed, true),
            },
        )
    }

    function completeAnsweredSurveys(journalUuid: string, pending: PendingSurveyAnswer[] | null | undefined) {
        return attempt(journalUuid, pending, false)
    }

    return { completeAnsweredSurveys }
}
