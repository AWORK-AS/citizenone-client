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
    // GK 3.9: withdrawn drug medications only when staff ask for them.
    const includeWithdrawn = shallowRef(false)

    let current = 0

    /** With a reason, privacy-marked medication is included (GK 4.3). */
    async function fetchCard(negativeConsent?: 'consent' | 'emergency') {
        const request = ++current
        pending.value = true
        error.value = null
        loginRequired.value = false
        try {
            const response = negativeConsent
                ? await fMKService.getMedicineCardWithNegativeConsent(citizenUuid, negativeConsent)
                : await fMKService.getMedicineCard(citizenUuid, includeWithdrawn.value)
            if (request === current) card.value = (response?.data ?? response) as FmkMedicineCardResponse
        } catch (cause: any) {
            if (request !== current) return
            if (cause?.code === 'fmk_login_required') loginRequired.value = true
            else error.value = cause?.message ?? String(cause)
        } finally {
            if (request === current) pending.value = false
        }
    }

    async function toggleWithdrawn() {
        includeWithdrawn.value = !includeWithdrawn.value
        await fetchCard()
    }

    return { card, pending, error, loginRequired, includeWithdrawn, fetchCard, toggleWithdrawn }
}
