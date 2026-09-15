import { useI18n } from 'vue-i18n'

/**
 * Distance provenance labels, resolved against the locale the user is actually
 * looking at.
 *
 * The API also returns pre-rendered `distance_source_label` /
 * `review_reason_label`, but those are translated server-side against
 * `user->language->code` from the database -- and no request carries the UI
 * locale (BaseAPIService sends no Accept-Language header), so a user whose
 * account says Danish sees "Manuelt rettet" inside an English UI, and vice
 * versa. The raw `distance_source` / `review_reason` keys are stable machine
 * values that the resource deliberately keeps exposed for exactly this reason,
 * so translate from those instead.
 *
 * The server labels stay as the fallback, not the preference: if the backend
 * ever emits a provenance key this frontend doesn't know yet, a label in the
 * wrong language still beats no label at all.
 */
export function useMileageLabels() {
    const { t, te } = useI18n()

    function distanceSourceLabel(log: any): string {
        const key = log?.distance_source

        // Null on every row created before the provenance deploy -- render that
        // as unknown provenance, never blank and never as "GPS".
        if (!key) return t('mileageLog.table.distanceSourceUnknown')

        const path = `mileageLog.distanceSource.${key}`
        if (te(path)) return t(path)

        return log?.distance_source_label || t('mileageLog.table.distanceSourceUnknown')
    }

    function reviewReasonLabel(log: any): string {
        const raw = log?.review_reason
        if (!raw) return log?.review_reason_label || ''

        // Comma-joined when a trip has more than one bad leg, matching how the
        // backend stores and renders it.
        const translated = String(raw)
            .split(',')
            .map((key: string) => key.trim())
            .filter(Boolean)
            .map((key: string) => {
                const path = `mileageLog.reviewReason.${key}`
                return te(path) ? t(path) : ''
            })
            .filter(Boolean)

        return translated.length > 0
            ? translated.join(' ')
            : (log?.review_reason_label || '')
    }

    return { distanceSourceLabel, reviewReasonLabel }
}
