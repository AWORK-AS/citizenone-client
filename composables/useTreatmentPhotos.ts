import { computed } from 'vue'
import { useUserStore } from '@/store/user'

/**
 * Treatment photos are a company setting, off unless a clinic admin turned them
 * on in Settings. A company without the field (an older payload) counts as off.
 * Takes the company object from either the staff user or the patient profile.
 */
export function isTreatmentPhotosOn(company: any): boolean {
    return company?.treatment_photos_enabled === true
}

/** For staff: the signed-in user's company. */
export function useTreatmentPhotos() {
    const userStore = useUserStore() as any

    const isEnabled = computed(() => isTreatmentPhotosOn(userStore.getUser?.company))

    return { isEnabled }
}
