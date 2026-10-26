<template>

    <Head>
        <Title>{{ $t('paymentStatus.renew.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
    </Head>

    <LoadingSpinner :isActive="state.isPageLoading">
        <div class="bg-[#f9fafaff] flex min-h-screen flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-center">
                <Logo />
            </div>

            <div class="mt-10 mx-auto w-full max-w-lg">
                <div class="bg-white shadow rounded-lg p-6">
                    <template v-if="state.isPaid">
                        <h1 class="text-lg font-semibold text-[#1F2533]">{{ $t('paymentStatus.renew.successTitle') }}</h1>
                        <p class="mt-2 text-sm text-gray-600">{{ $t('paymentStatus.renew.successBody') }}</p>
                        <button type="button"
                            class="mt-5 w-full rounded-lg bg-[#00607A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004c61]"
                            @click="navigateTo('/')">
                            {{ $t('paymentStatus.renew.goToLogin') }}
                        </button>
                    </template>

                    <template v-else>
                        <h1 class="text-lg font-semibold text-[#1F2533]">{{ $t('paymentStatus.renew.title') }}</h1>
                        <p v-if="!state.error" class="mt-2 text-sm text-gray-600">
                            {{ $t('paymentStatus.renew.intro', { company: state.companyName }) }}
                        </p>

                        <div v-if="state.invoiceNumber" class="mt-4 rounded-lg bg-gray-50 px-4 py-3 flex items-baseline justify-between">
                            <span class="text-sm text-gray-600">{{ $t('paymentStatus.invoiceNumber') }}</span>
                            <span class="text-base font-semibold text-[#1F2533]">{{ state.invoiceNumber }}</span>
                        </div>

                        <div v-if="amountLabel" class="mt-2 rounded-lg bg-gray-50 px-4 py-3 flex items-baseline justify-between">
                            <span class="text-sm text-gray-600">{{ $t('paymentStatus.amountDue') }}</span>
                            <span class="text-base font-semibold text-[#1F2533]">{{ amountLabel }}</span>
                        </div>

                        <Alert v-if="state.error" class="mt-4" type="danger" :text="state.error" />

                        <p v-if="state.isCollecting" class="mt-4 text-sm text-gray-600 flex items-center gap-2">
                            <Icon name="ph:spinner" class="h-4 w-4 animate-spin" aria-hidden="true" />
                            {{ $t('paymentStatus.collecting') }}
                        </p>

                        <button v-if="state.canStart && !state.checkoutReady && !state.isCollecting" type="button"
                            class="mt-5 w-full rounded-lg bg-[#00607A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004c61] disabled:opacity-60"
                            :disabled="state.isStarting" @click="startPayment">
                            {{ $t('paymentStatus.payButton') }}
                        </button>

                        <div v-show="state.checkoutReady" id="renew-subscription-checkout" class="mt-4 mx-auto max-w-sm"></div>
                    </template>
                </div>

                <p class="mt-4 text-center text-sm text-gray-500">
                    <a href="mailto:support@citizenone.dk" class="underline underline-offset-2">
                        {{ $t('paymentStatus.contactSupport') }}
                    </a>
                </p>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { subscriptionRenewalService } from '@/components/api/SubscriptionRenewalService'
import { useI18n } from 'vue-i18n'

/**
 * Paying the failed invoice of a suspended company, reached from the
 * suspension email. Deliberately outside the authenticated layout: the
 * suspension is exactly what stops the admin logging in, so requiring a login
 * here would close the only door out.
 */
const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()
const route = useRoute()
const token = String(route.query.token ?? '')

let checkout = null as any
let paymentId = '' as string

const state = reactive({
    isPageLoading: true,
    isStarting: false,
    isCollecting: false,
    canStart: false,
    checkoutReady: false,
    isPaid: false,
    error: '' as string,
    companyName: '' as string,
    invoiceNumber: '' as string,
    amountDue: 0 as number,
})

const amountLabel = computed(() => {
    if (!state.amountDue) return ''
    return state.amountDue.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr.'
})

async function collectOutstanding() {
    checkout?.cleanup?.()
    state.checkoutReady = false
    state.isCollecting = true

    try {
        const response = await subscriptionRenewalService.complete(token, paymentId)
        if (response?.data?.paid) {
            state.isPaid = true
            return
        }
        state.error = t('paymentStatus.paymentFailed')
    } catch (error: any) {
        state.error = error?.message || t('paymentStatus.paymentFailed')
    } finally {
        state.isCollecting = false
    }
}

async function startPayment() {
    state.error = ''
    state.isStarting = true

    try {
        const response = await subscriptionRenewalService.pay(token)
        paymentId = response?.data?.payment_id ?? ''

        if (!paymentId) {
            state.error = t('paymentStatus.couldNotStart')
            return
        }

        state.checkoutReady = true
        await nextTick()

        checkout = new Dibs.Checkout({
            checkoutKey: runtimeConfig?.public?.checkoutKey,
            paymentId,
            containerId: 'renew-subscription-checkout',
            language: nexiCheckoutLanguage(locale.value),
            theme: { buttonRadius: '5px' },
        })

        checkout.on('payment-completed', collectOutstanding)
    } catch (error: any) {
        state.error = error?.message || t('paymentStatus.couldNotStart')
    } finally {
        state.isStarting = false
    }
}

onMounted(async () => {
    if (!token) {
        state.error = t('paymentStatus.renew.invalidToken')
        state.isPageLoading = false
        return
    }

    try {
        const response = await subscriptionRenewalService.show(token)
        const data = response?.data

        if (!data?.invoice_number) {
            state.error = t('paymentStatus.renew.invalidToken')
            return
        }

        state.companyName = data.company_name ?? ''
        state.invoiceNumber = String(data.invoice_number)
        state.amountDue = Number(data.amount_due ?? 0)
        state.canStart = true
    } catch (error: any) {
        state.error = error?.message ?? t('paymentStatus.renew.invalidToken')
    } finally {
        state.isPageLoading = false
    }
})

onUnmounted(() => checkout?.cleanup?.())
</script>
