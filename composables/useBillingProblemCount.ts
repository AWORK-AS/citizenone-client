import { billingService } from '@/components/api/superadmin/BillingService'

/**
 * The number beside "Betalingsproblemer" in the superadmin sidebar.
 *
 * Shared through `useState` so the worklist can refresh it after an action
 * without a second request from the layout. A failed or forbidden request
 * leaves the badge empty: the count is a convenience, never a gate.
 */
export function useBillingProblemCount() {
    const count = useState<number>('billingProblemCount', () => 0)
    const { can } = usePermissions()

    async function refresh() {
        if (!can('view_financials')) {
            count.value = 0
            return
        }

        try {
            count.value = await billingService.getProblemCount()
        } catch (_) {
            count.value = 0
        }
    }

    return { count, refresh }
}
