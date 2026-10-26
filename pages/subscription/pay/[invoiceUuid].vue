<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('paymentStatus.payTitle') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="mx-auto mt-10 w-full max-w-lg">
                    <div class="bg-white shadow rounded-lg p-6">
                        <template v-if="state.isPaid">
                            <h1 class="text-lg font-semibold text-[#1F2533]">{{ $t('paymentStatus.paidTitle') }}</h1>
                            <p class="mt-2 text-sm text-gray-600">{{ $t('paymentStatus.paidBody') }}</p>
                            <button type="button"
                                class="mt-5 w-full rounded-lg bg-[#00607A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004c61]"
                                @click="goToOverview">
                                {{ $t('paymentStatus.goToOverview') }}
                            </button>
                        </template>

                        <template v-else>
                            <h1 class="text-lg font-semibold text-[#1F2533]">{{ $t('paymentStatus.payTitle') }}</h1>

                            <p v-if="state.alreadyPaid" class="mt-2 text-sm text-gray-600">
                                {{ $t('paymentStatus.alreadyPaid') }}
                            </p>
                            <p v-else-if="state.notFound" class="mt-2 text-sm text-gray-600">
                                {{ $t('paymentStatus.invoiceNotFound') }}
                            </p>
                            <p v-else-if="state.invoice" class="mt-2 text-sm text-gray-600">
                                {{ $t('paymentStatus.payIntro', { number: state.invoice.invoice_number }) }}
                            </p>

                            <div v-if="state.invoice && !state.notFound"
                                class="mt-4 rounded-lg bg-gray-50 px-4 py-3 flex items-baseline justify-between">
                                <span class="text-sm text-gray-600">{{ $t('paymentStatus.invoiceNumber') }}</span>
                                <span class="text-base font-semibold text-[#1F2533]">{{ state.invoice.invoice_number }}</span>
                            </div>

                            <div v-if="amountLabel && !state.notFound"
                                class="mt-2 rounded-lg bg-gray-50 px-4 py-3 flex items-baseline justify-between">
                                <span class="text-sm text-gray-600">{{ $t('paymentStatus.amountDue') }}</span>
                                <span class="text-base font-semibold text-[#1F2533]">{{ amountLabel }}</span>
                            </div>

                            <Alert v-if="state.error" class="mt-4" type="danger" :text="state.error" />

                            <p v-if="state.isVerifying" class="mt-4 text-sm text-gray-600 flex items-center gap-2">
                                <Icon name="ph:spinner" class="h-4 w-4 animate-spin" aria-hidden="true" />
                                {{ $t('paymentStatus.collecting') }}
                            </p>

                            <button v-if="canStart" type="button"
                                class="mt-5 w-full rounded-lg bg-[#00607A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004c61] disabled:opacity-60"
                                :disabled="state.isStarting" @click="startPayment">
                                {{ state.isStarting ? $t('paymentStatus.pleaseWait') : $t('paymentStatus.payButton') }}
                            </button>

                            <div v-show="state.checkoutReady" id="pay-failed-invoice-checkout" class="mt-4 mx-auto max-w-sm"></div>
                        </template>
                    </div>

                    <p class="mt-4 text-center text-sm text-gray-500">
                        <a href="mailto:support@citizenone.dk" class="underline underline-offset-2">
                            {{ $t('paymentStatus.contactSupport') }}
                        </a>
                    </p>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { invoiceService } from '@/components/api/user/InvoiceService'
import { useI18n } from 'vue-i18n'

/**
 * Pays one failed invoice with a new card. This is where the dunning emails
 * lead. The invoice is in the path, not the query string, because a deep link
 * that hits a login keeps only its path (see BaseAPIService.revokeAccess), so
 * this is what brings the admin back here after they have logged in.
 */
const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()
const route = useRoute()
const invoiceUuid = String(route.params.invoiceUuid ?? '')

let checkout = null as any

const state = reactive({
    isPageLoading: true,
    isStarting: false,
    isVerifying: false,
    checkoutReady: false,
    isPaid: false,
    alreadyPaid: false,
    notFound: false,
    error: '' as string,
    invoice: null as any,
})

const canStart = computed(() =>
    !!state.invoice && !state.alreadyPaid && !state.notFound && !state.checkoutReady && !state.isVerifying)

const amountLabel = computed(() => {
    const amount = Number(state.invoice?.total_amount ?? 0)
    if (!amount) return ''
    return amount.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr.'
})

// A full load, not a route change: the payment wall in the layout read the
// billing standing when it mounted and would otherwise still show it.
function goToOverview() {
    window.location.href = '/overview'
}

async function verify(paymentId: string) {
    checkout?.cleanup?.()
    state.checkoutReady = false
    state.isVerifying = true

    try {
        await invoiceService.verifyInvoicePayment(invoiceUuid, paymentId)
        state.isPaid = true
    } catch (error: any) {
        state.error = error?.message || t('paymentStatus.paymentFailed')
    } finally {
        state.isVerifying = false
    }
}

async function startPayment() {
    state.error = ''
    state.isStarting = true

    try {
        const response = await invoiceService.payInvoice(invoiceUuid)

        if (!response?.paymentId) {
            state.error = response?.message || t('paymentStatus.couldNotStart')
            return
        }

        state.checkoutReady = true
        await nextTick()

        checkout = new Dibs.Checkout({
            checkoutKey: runtimeConfig?.public?.checkoutKey,
            paymentId: response.paymentId,
            containerId: 'pay-failed-invoice-checkout',
            language: nexiCheckoutLanguage(locale.value),
            theme: { buttonRadius: '5px' },
        })

        checkout.on('payment-completed', (result: any) => verify(result?.paymentId ?? response.paymentId))
    } catch (error: any) {
        state.error = error?.message || t('paymentStatus.couldNotStart')
        state.checkoutReady = false
    } finally {
        state.isStarting = false
    }
}

onMounted(async () => {
    try {
        const response = await invoiceService.getInvoiceDetails(invoiceUuid)
        const invoice = response?.data ?? response

        if (!invoice?.uuid) {
            state.notFound = true
            return
        }

        state.invoice = invoice
        state.alreadyPaid = !!invoice.is_paid
    } catch (error: any) {
        // 404 is also what another company's invoice looks like.
        if (error?.status === 404) {
            state.notFound = true
        } else {
            state.error = error?.message || t('paymentStatus.couldNotStart')
        }
    } finally {
        state.isPageLoading = false
    }
})

onUnmounted(() => checkout?.cleanup?.())
</script>
