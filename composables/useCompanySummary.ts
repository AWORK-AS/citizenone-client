import { companyHistoryService } from '@/components/api/superadmin/CompanyHistoryService'
import type { CompanySummary } from '@/composables/superadminCompany'

/**
 * The company header's data, kept per company in `useState`.
 *
 * Every company page shows the header, and switching tab is a new page. Kept
 * here, the second tab renders the header at once from what the first one
 * fetched, and refreshes it quietly behind - no spinner and no jump. A page
 * that changes what the header shows (edit, billing method, an agreement)
 * calls `refresh()`.
 */
export function useCompanySummary(companyUuid: MaybeRef<string>) {
    const cache = useState<Record<string, CompanySummary>>('superadminCompanySummaries', () => ({}))
    const loading = useState<Record<string, boolean>>('superadminCompanySummariesLoading', () => ({}))
    const failed = useState<Record<string, boolean>>('superadminCompanySummariesFailed', () => ({}))

    const uuid = computed(() => unref(companyUuid))
    const summary = computed<CompanySummary | null>(() => cache.value[uuid.value] ?? null)
    const isLoading = computed(() => !summary.value && !!loading.value[uuid.value])
    const hasFailed = computed(() => !summary.value && !!failed.value[uuid.value])

    async function refresh() {
        const key = uuid.value
        if (!key || loading.value[key]) return

        loading.value = { ...loading.value, [key]: true }
        try {
            const response = await companyHistoryService.getSummary(key)
            if (response?.data) {
                cache.value = { ...cache.value, [key]: response.data }
                failed.value = { ...failed.value, [key]: false }
            }
        } catch (_) {
            failed.value = { ...failed.value, [key]: true }
        } finally {
            loading.value = { ...loading.value, [key]: false }
        }
    }

    /** Fetch once per company per visit; a tab switch shows the cached header. */
    function ensure(maxAgeMs = 60_000) {
        const key = uuid.value
        const fetchedAt = fetchedAtByUuid.get(key) ?? 0
        if (!cache.value[key] || Date.now() - fetchedAt > maxAgeMs) {
            fetchedAtByUuid.set(key, Date.now())
            return refresh()
        }
    }

    return { summary, isLoading, hasFailed, refresh, ensure }
}

// Client-only bookkeeping of when each company was last fetched.
const fetchedAtByUuid = new Map<string, number>()
