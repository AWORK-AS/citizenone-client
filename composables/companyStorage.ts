import { licenseService } from '@/components/api/superadmin/LicenseService'
import { formatStorage } from '@/composables/storageFormat'

/**
 * Storage usage for one company, shared between the stat card and the
 * breakdown panel so opening a company measures it once, not twice.
 * The endpoint recalculates on every call and caches the result on the
 * company, so treat load() as "measure now".
 */
export function useCompanyStorage(companyUuid: string) {
    const storage = useState<any>(`company-storage-${companyUuid}`, () => null)
    const isLoading = useState<boolean>(`company-storage-loading-${companyUuid}`, () => false)

    const usedGb = computed(() => Number(storage.value?.storage_used_gb ?? 0))
    const quotaGb = computed(() => Number(storage.value?.storage_quota_gb ?? 0))
    const usedBytes = computed(() => storage.value?.storage_used_bytes ?? null)
    const hasData = computed(() => storage.value !== null)

    const percent = computed(() => {
        if (!quotaGb.value) return 0
        return Math.min(100, Math.round((usedGb.value / quotaGb.value) * 100))
    })

    // Same thresholds as the customer-facing quota warnings (80% / 100%).
    const textClass = computed(() => {
        if (percent.value >= 100) return 'text-[#CC3B2D]'
        if (percent.value >= 80) return 'text-[#D4900A]'
        return 'text-[#1F2533]'
    })

    const barClass = computed(() => {
        if (percent.value >= 100) return 'bg-[#CC3B2D]'
        if (percent.value >= 80) return 'bg-[#D4900A]'
        return 'bg-[#42AED9]'
    })

    // Categories that actually hold data, largest first (the API sorts them).
    const breakdown = computed(() =>
        (storage.value?.breakdown ?? []).filter((item: any) => Number(item?.bytes) > 0)
    )

    async function load(force = false) {
        if (isLoading.value) return
        if (storage.value && !force) return

        isLoading.value = true
        try {
            const response = await licenseService.getCompanyStorage(companyUuid)
            if (response) storage.value = response
        } catch (_) {
            // Usage is informational - the rest of the company page still renders.
        }
        isLoading.value = false
    }

    return { storage, isLoading, hasData, usedGb, usedBytes, quotaGb, percent, textClass, barClass, breakdown, load }
}

export function formatStorageGb(value: any, locale = 'da-DK') {
    return Number(value ?? 0).toLocaleString(locale, { maximumFractionDigits: 2 })
}

export function formatStorageSize(bytes: any, locale = 'da-DK') {
    return formatStorage(bytes, locale)
}
