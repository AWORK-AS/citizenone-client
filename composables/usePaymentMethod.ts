import { billingService } from '@/components/api/user/BillingService'
import { normalizeCompanyBilling, type CompanyBilling } from '@/composables/billingMethod'

/**
 * The signed-in company's payment method, loaded once and shared by the
 * subscription page, the security-card banner and the card dialog.
 *
 * A failed load leaves `billing` as null and every consumer renders nothing
 * extra: how a company pays is never what stops a page rendering.
 */
export function usePaymentMethod() {
    const billing = useState<CompanyBilling | null>('paymentMethod', () => null)
    const isLoaded = useState<boolean>('paymentMethodLoaded', () => false)

    async function load(force = false) {
        if (isLoaded.value && !force) return

        try {
            billing.value = await billingService.getPaymentMethod()
        } catch (_) {
            billing.value = null
        }
        isLoaded.value = true
    }

    const isInvoice = computed(() => billing.value?.billing_method === 'invoice' && !billing.value?.under_agreement)

    return { billing, isInvoice, load, empty: () => normalizeCompanyBilling({}) }
}
