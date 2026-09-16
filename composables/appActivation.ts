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
export function useAppActivation(options: { checkoutContainerId: string }) {
    const { t } = useI18n()
    const userStore = useUserStore() as any
    const onedriveService = new OneDriveService()

    const activation = reactive({
        error: {} as any,
        isBusy: false,
        isCheckoutOpen: false,
        isTermsOpen: false,
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
                const response = await onedriveService.getOneDriveAuthUrl()
                const authUrl = response?.authUrl || response?.auth_url
                if (authUrl) {
                    if (userStore.getUser?.id) {
                        localStorage.setItem('user_id', userStore.getUser.id)
                    }
                    if (app?.uuid) {
                        localStorage.setItem('onedrive_app_uuid', app.uuid)
                    }
                    // Microsoft's COOP headers block window.close() in a popup, so
                    // this one leaves the page rather than opening a window.
                    window.location.href = authUrl
                } else {
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
        const runtimeConfig = useRuntimeConfig()
        const params: any = {}

        if (!app?.is_one_time_fee) {
            params.terms = form?.frequency?.value === 'monthly' ? 'monthly' : 'yearly'
        }

        params.quantity = form?.quantity

        const response = await appService.activateApp(app?.uuid, params)

        if (!response) {
            return
        }

        checkout = new Dibs.Checkout({
            checkoutKey: runtimeConfig?.public?.checkoutKey,
            paymentId: response?.paymentId,
            containerId: options.checkoutContainerId,
            language: 'da-DK',
            theme: { buttonRadius: '5px' },
        })

        checkout.on('payment-completed', (result: any) => {
            checkout.cleanup()
            navigateTo(`/apps/purchased-successfully?paymentId=${result?.paymentId}&category=${app?.category?.slug ?? ''}&exclude=${app?.uuid ?? ''}`)
        })

        activation.isCheckoutOpen = true
    }

    return { activation, requestActivation, activate }
}
