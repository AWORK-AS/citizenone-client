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

    let current = 0

    async function fetchCard() {
        const request = ++current
        pending.value = true
        error.value = null
        try {
            const response = await fMKService.getMedicineCard(citizenUuid)
            if (request === current) card.value = (response?.data ?? response) as FmkMedicineCardResponse
        } catch (cause: any) {
            if (request === current) error.value = cause?.message ?? String(cause)
        } finally {
            if (request === current) pending.value = false
        }
    }

    return { card, pending, error, fetchCard }
}
