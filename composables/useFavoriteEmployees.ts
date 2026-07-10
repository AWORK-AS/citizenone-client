// Tracks the current viewer's favorite duty-schedule employees, server-persisted
// via DutyScheduleFavoriteEmployeeService and shared reactively across schedule views.
import { dutyScheduleFavoriteEmployeeService } from '@/components/api/user/DutyScheduleFavoriteEmployeeService'

export function useFavoriteEmployees() {
    const favoriteUuids = useState<Set<string>>('favoriteEmployeeUuids', () => new Set())
    const isLoaded = useState<boolean>('favoriteEmployeeUuidsLoaded', () => false)

    async function ensureLoaded() {
        if (isLoaded.value) return
        const response = await dutyScheduleFavoriteEmployeeService.getFavoriteEmployees()
        favoriteUuids.value = new Set(response?.data ?? [])
        isLoaded.value = true
    }

    function isFavorited(uuid: string) {
        return favoriteUuids.value.has(uuid)
    }

    function add(uuid: string) {
        favoriteUuids.value = new Set(favoriteUuids.value).add(uuid)
    }

    function remove(uuid: string) {
        const next = new Set(favoriteUuids.value)
        next.delete(uuid)
        favoriteUuids.value = next
    }

    return { favoriteUuids, isFavorited, add, remove, ensureLoaded }
}
