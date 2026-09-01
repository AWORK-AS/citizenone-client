import { useUserStore } from '@/store/user'

/**
 * Which industries a feature exists for.
 *
 * Every one of these was written as `system_name === 'dental'` where it was
 * needed, which was fine while dentistry was the only industry with anything of
 * its own. It stops being fine the moment a second industry wants one of them:
 * a physiotherapist recalls patients for a check-up and quotes a price before
 * treatment, but has no tooth chart, so the answer differs per feature and not
 * per industry. Turning a feature on for another industry is a word in this
 * list rather than a hunt through the pages.
 *
 * `system_name` is the key, and `en_name` still counts as a fallback: the
 * system names were only backfilled recently, and the server's own guard
 * accepts both while installs migrate.
 */
const FEATURE_INDUSTRIES: Record<string, string[]> = {
    /** The tooth chart, and the dental fields on the patient's record. */
    toothChart: ['dental'],
    /** Calling patients back in when a check-up falls due. */
    recalls: ['dental'],
    /** Quoting a price before treatment starts. */
    priceEstimates: ['dental'],
    /** The clinic's own overview of the day. */
    clinicOverview: ['dental'],
}

const LEGACY_NAMES: Record<string, string> = {
    dental: 'Dentists and dental hygienists',
}

export type IndustryFeature = keyof typeof FEATURE_INDUSTRIES

export function useIndustryFeatures() {
    const userStore = useUserStore() as any

    function industryHasFeature(feature: string): boolean {
        const industry = userStore.getUser?.company?.industry
        if (!industry) return false

        return (FEATURE_INDUSTRIES[feature] || []).some((name) =>
            industry.system_name === name || industry.en_name === LEGACY_NAMES[name])
    }

    return { industryHasFeature }
}
