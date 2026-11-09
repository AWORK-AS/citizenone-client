import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'

/**
 * Active polls the user has not voted on yet. Shared, so the help menu dot
 * goes away as soon as the user votes on Coming functions or the overview.
 */
export function usePollBadge() {
    const count = useState<number>('unvotedPollCount', () => 0)

    async function refresh() {
        try {
            const response = await dailyOverviewService.getUnvotedPollCount()
            count.value = response?.count ?? 0
        } catch {
            count.value = 0
        }
    }

    return { count, refresh }
}
