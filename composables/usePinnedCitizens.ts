// Tracks the current viewer's pinned citizens, server-persisted via CitizenService
// and shared reactively across the citizen list. Pins are per-user.
import { citizenService } from '@/components/api/user/CitizenService'

export function usePinnedCitizens() {
    const pinnedUuids = useState<Set<string>>('pinnedCitizenUuids', () => new Set())
    const isLoaded = useState<boolean>('pinnedCitizenUuidsLoaded', () => false)

    async function ensureLoaded() {
        if (isLoaded.value) return
        const response = await citizenService.getPinnedCitizens()
        pinnedUuids.value = new Set(response?.data ?? [])
        isLoaded.value = true
    }

    function isPinned(uuid: string) {
        return pinnedUuids.value.has(uuid)
    }

    function add(uuid: string) {
        pinnedUuids.value = new Set(pinnedUuids.value).add(uuid)
    }

    function remove(uuid: string) {
        const next = new Set(pinnedUuids.value)
        next.delete(uuid)
        pinnedUuids.value = next
    }

    return { pinnedUuids, isPinned, add, remove, ensureLoaded }
}
