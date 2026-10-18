import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { appService } from '@/components/api/user/AppService'
import { googledriveService } from '@/components/api/user/GoogleDriveService'
import OneDriveService from '@/components/api/oneDrive/OneDriveService'
import { useUserStore } from '@/store/user'

declare const Dibs: any

/**
 * Buying an app, from both places it can be bought.
 *
 * The store list and the app page offer the same purchase, and it is not a
 * simple one: three integrations redirect to a provider's own consent screen,
 * a free app is activated outright, and everything else opens a Nexi checkout
 * that has to be torn down again afterwards. Keeping one copy means the app
 * page cannot drift into a second, subtly different way of selling the same
 * thing.
 */
export function useAppActivation(options: { checkoutContainerId: string, onTrialStarted?: () => void | Promise<void> }) {
    const { t } = useI18n()
    const userStore = useUserStore() as any
    const onedriveService = new OneDriveService()

    const activation = reactive({
        error: {} as any,
        isBusy: false,
        isCheckoutOpen: false,
        isTermsOpen: false,
        // Set when the price at start differs from the one shown: nothing opens until it is confirmed.
        priceChange: null as null | { paymentId: string, amount: number | string },
        selectedApp: {} as any,
    })

    let checkout: any = null

    /**
     * Any company can buy any app. There used to be a gate here sending a
     * company without a Deal subscription to /subscription/subscribe, but the
     * backend never enforced it, so it only stopped customers who were willing
     * to pay (996f11e9 on dev).
     */
    function requestActivation(app: any) {
        // An app tied to a plan the company is not on (Microsoft SSO and
        // Talentech need Pro) is refused by the backend; send them to upgrade.
        if (app?.plan_eligible === false && !app?.user_activated) {
            navigateTo('/subscription')

            return
        }

        activation.selectedApp = app
        activation.isTermsOpen = true
    }

    async function activate(form: any) {
        activation.error = {}
        activation.isBusy = true

        try {
            const app = activation.selectedApp

            if (app?.generic_name === 'google-drive') {
                const response = await googledriveService.getGoogleDriveAuthUrl()
                const authUrl = response?.authUrl || response?.auth_url
                if (authUrl) {
                    window.open(authUrl, 'Google Drive Authentication', 'width=500,height=600')
                }
            } else if (app?.generic_name === 'onedrive') {
                if (app?.uuid) {
                    localStorage.setItem('onedrive_app_uuid', app.uuid)
                }
                try {
                    await onedriveService.connectOneDrive(userStore.getUser?.id, '/apps?onedrive_connected=1')
                } catch (e) {
                    activation.error = { message: t('apps.couldNotStartConnection') }
                }
            } else if (app?.is_free) {
                const response = await appService.activateFreeApp({ app_uuid: app?.uuid })
                if (response) {
                    // Installing FST only makes its setup screen reachable; it does
                    // not switch anything on by itself, so go straight there.
                    if (app?.generic_name === 'fst') {
                        navigateTo('/settings/fst')
                        activation.isBusy = false

                        return
                    }

                    navigateTo(`/apps/activated-successfully?category=${app?.category?.slug ?? ''}&exclude=${app?.uuid ?? ''}`)
                }
            } else {
                await openCheckout(app, form)
            }
        } catch (error: any) {
            activation.error = error
        }

        activation.isBusy = false
    }

    async function openCheckout(app: any, form: any) {
        const params: any = {}

        if (!app?.is_one_time_fee) {
            params.terms = form?.frequency?.value === 'monthly' ? 'monthly' : 'yearly'
        }

        params.quantity = form?.quantity

        const response = await appService.activateApp(app?.uuid, params)

        if (!response?.paymentId) {
            activation.error = { message: t('apps.couldNotStartPayment') }

            return
        }

        mountCheckout(response?.paymentId, (result: any) => {
            navigateTo(`/apps/purchased-successfully?paymentId=${result?.paymentId}&category=${app?.category?.slug ?? ''}&exclude=${app?.uuid ?? ''}`)
        })
    }

    // The one place the Nexi embedded checkout is created and torn down, shared
    // by a purchase and by saving a card for a free trial.
    function mountCheckout(paymentId: string, onCompleted: (result: any) => void | Promise<void>) {
        const runtimeConfig = useRuntimeConfig()

        checkout = new Dibs.Checkout({
            checkoutKey: runtimeConfig?.public?.checkoutKey,
            paymentId,
            containerId: options.checkoutContainerId,
            language: 'da-DK',
            theme: { buttonRadius: '5px' },
        })

        checkout.on('payment-completed', (result: any) => {
            checkout.cleanup()
            onCompleted({ ...result, paymentId: result?.paymentId ?? paymentId })
        })

        activation.isCheckoutOpen = true
    }

    /**
     * Start a free trial: the backend returns a payment id for saving a card
     * (nothing is charged), the same checkout collects it, and verifying the
     * payment is what actually starts the trial.
     */
    async function startTrial(app: any, params: { frequency: 'monthly' | 'yearly', seats?: number }, displayedAmount?: number | string | null) {
        activation.error = {}
        activation.priceChange = null
        activation.isBusy = true

        try {
            const response = await appService.startTrial(app?.uuid, params)

            if (!response?.paymentId) {
                activation.error = { message: t('apps.couldNotStartPayment') }
            } else if (response?.amount_gross != null && displayedAmount != null
                && Math.round(Number(response.amount_gross) * 100) !== Math.round(Number(displayedAmount) * 100)) {
                // The price moved between quote and start. Show it and wait for a second click.
                activation.priceChange = { paymentId: response.paymentId, amount: response.amount_gross }
            } else {
                mountTrialCheckout(response.paymentId)
            }
        } catch (error: any) {
            activation.error = error
        }

        activation.isBusy = false
    }

    function confirmTrialPrice() {
        const pending = activation.priceChange
        activation.priceChange = null
        if (pending) mountTrialCheckout(pending.paymentId)
    }

    function mountTrialCheckout(paymentId: string) {
        mountCheckout(paymentId, async (result: any) => {
            activation.isBusy = true
            try {
                await appService.verifyTrial(result.paymentId)
            } catch (error: any) {
                activation.error = error
            }
            activation.isCheckoutOpen = false
            activation.isBusy = false
            await options.onTrialStarted?.()
        })
    }

    return { activation, requestActivation, activate, startTrial, confirmTrialPrice }
}
