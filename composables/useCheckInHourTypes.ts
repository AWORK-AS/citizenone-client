import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
import { checkInHourTypeChoices, hourTypePayload, isCareHourTypesOn, type CareHourType } from '@/composables/careHourTypes'
import { useUserStore } from '@/store/user'

/**
 * The hour types (Kontakttimer (ATA), other time, supervision...) a person
 * picks from when checking in on a citizen. Empty unless the company uses
 * check-in and hour types, so the check-in stays as before.
 */
export function useCheckInHourTypes() {
    const userStore = useUserStore() as any
    const hourTypes = ref<CareHourType[]>([])

    const transportHasOwnButton = computed(() => userStore.getUser?.can_register_transport === true)
    const checkInHourTypes = computed(() => checkInHourTypeChoices(hourTypes.value, transportHasOwnButton.value))

    async function fetchHourTypes() {
        const company = userStore.getUser?.company
        if (company?.intervention_checkin_enabled !== true || !isCareHourTypesOn(company)) {
            hourTypes.value = []
            return
        }
        try {
            const response = await interventionHoursService.getHourTypes()
            hourTypes.value = response?.data ?? []
        } catch {
            hourTypes.value = []
        }
    }

    /** What a check-in sends for the chosen type; nothing when no picker showed. */
    function checkInPayload(hourTypeUuid?: string) {
        return hourTypePayload(checkInHourTypes.value.length > 0, hourTypeUuid)
    }

    return { checkInHourTypes, fetchHourTypes, checkInPayload }
}
