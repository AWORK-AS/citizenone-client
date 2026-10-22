import { computed, ref } from 'vue'
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { useUserStore } from '@/store/user'
import { isCareHourTypesOn, type CareHourType } from '@/composables/careHourTypes'

// One request per company and session: the list only changes in Settings.
// Module-level on purpose: the app runs client-side only (ssr: false).
const requests = new Map<number | string, Promise<CareHourType[]>>()

/**
 * The hour types a hand-made registration (Indsatstimer) can take. Empty, and
 * never fetched, unless the company switched them on; the server answers an
 * empty list then too.
 */
export function useCareHourTypes() {
    const userStore = useUserStore() as any
    const types = ref<CareHourType[]>([])
    const isEnabled = computed(() => isCareHourTypesOn(userStore.getUser?.company))

    async function loadHourTypes() {
        if (!isEnabled.value) {
            types.value = []
            return
        }

        const companyKey = userStore.getUser?.company?.id ?? 'current'
        if (!requests.has(companyKey)) {
            requests.set(companyKey, interventionHoursService.getHourTypes()
                .then((response: any) => (Array.isArray(response?.data) ? response.data : []))
                .catch(() => {
                    // Asked again next time; meanwhile the form has no picker.
                    requests.delete(companyKey)
                    return []
                }))
        }

        types.value = await requests.get(companyKey)!
    }

    return { types, isEnabled, loadHourTypes }
}
