import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { copyResultMessage, type CopyScope, type CopyTotals } from '@/utils/scheduleCopyResult'

/**
 * Shows what a paste of shifts did, as a toast that is seen wherever the
 * page is scrolled (the Alert at the top of the vagtplan is not).
 * See utils/scheduleCopyResult.ts.
 */
export function useScheduleCopyAnnounce() {
    const language = useI18n()
    const { errorAlert, successAlert, warningAlert } = useAlert()

    function announceCopyResult(totals: CopyTotals, scope: CopyScope, many = false) {
        if (totals.failed > 0) {
            const error = totals.firstError
            errorAlert(language.t('alert.error'), error?.data?.message || error?.message || '')
        }

        const message = copyResultMessage(totals, scope, many)
        if (message.type === 'none') return

        const text = message.lines
            .map(line => line.count === undefined
                ? language.t(line.key)
                : language.t(line.key, { count: line.count }, line.count))
            .join('. ')

        if (message.type === 'success') {
            successAlert(language.t(message.titleKey), text)
        } else {
            warningAlert(language.t(message.titleKey), text)
        }
    }

    return { announceCopyResult }
}
