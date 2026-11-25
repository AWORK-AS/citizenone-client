import { shallowRef } from 'vue'
import { fMKService } from '@/components/api/user/FMKService'
import type { FmkMedicineCardResponse } from '@/types/fmk'

/**
 * Fetches a citizen's medicine card from FMK on request (FMK GK 1.2: only when
 * staff ask for the current card). Keeps the last good card when a refresh
 * fails, and says so (GK 3.2), instead of showing an empty card.
 */
export function useFmkMedicineCard(citizenUuid: string) {
    const card = shallowRef<FmkMedicineCardResponse | null>(null)
    const pending = shallowRef(false)
    const error = shallowRef<string | null>(null)
    // FMK needs the staff member's own MitID Erhverv login first.
    const loginRequired = shallowRef(false)

    let current = 0

    async function fetchCard() {
        const request = ++current
        pending.value = true
        error.value = null
        loginRequired.value = false
        try {
            const response = await fMKService.getMedicineCard(citizenUuid)
            if (request === current) card.value = (response?.data ?? response) as FmkMedicineCardResponse
        } catch (cause: any) {
            if (request !== current) return
            if (cause?.code === 'fmk_login_required') loginRequired.value = true
            else error.value = cause?.message ?? String(cause)
        } finally {
            if (request === current) pending.value = false
        }
    }

    return { card, pending, error, loginRequired, fetchCard }
}
