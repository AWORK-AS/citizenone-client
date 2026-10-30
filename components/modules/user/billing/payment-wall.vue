<template>
    <!-- Payment outstanding. An admin is blocked until the card is fixed. A suspended company
         blocks everyone, and non-admins are told to contact their administrator; a company
         that is only past due shows non-admins a notice. -->
    <div v-if="mode === 'update_card' || mode === 'contact_admin'" class="fixed inset-0 z-[100] bg-[#1F2533]/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8">
        <div class="w-full max-w-lg rounded-xl bg-white shadow-xl my-auto">
            <div class="px-6 pt-6 pb-4 border-b border-gray-100">
                <div class="flex items-start gap-3">
                    <span class="shrink-0 rounded-full bg-red-50 p-2">
                        <Icon name="ph:credit-card" class="h-6 w-6 text-[#CC3B2D]" aria-hidden="true" />
                    </span>
                    <div class="min-w-0">
                        <h2 class="text-lg font-semibold text-[#1F2533]">
                            {{ heading }}
                        </h2>
                        <p class="mt-1 text-sm text-gray-600">{{ body }}</p>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 space-y-4">
                <div v-if="amountLabel && mode === 'update_card'" class="rounded-lg bg-gray-50 px-4 py-3 flex items-baseline justify-between">
                    <span class="text-sm text-gray-600">{{ $t('paymentStatus.amountDue') }}</span>
                    <span class="text-base font-semibold text-[#1F2533]">{{ amountLabel }}</span>
                </div>

                <Alert v-if="state.error" type="danger" :text="state.error" />

                <p v-if="state.isCollecting" class="text-sm text-gray-600 flex items-center gap-2">
                    <Icon name="ph:spinner" class="h-4 w-4 animate-spin" aria-hidden="true" />
                    {{ $t('paymentStatus.collecting') }}
                </p>

                <!-- The Nexi widget mounts here once a payment has been minted. -->
                <div v-show="state.checkoutReady" id="billing-wall-checkout" class="mx-auto max-w-sm"></div>

                <Tooltip v-if="mode === 'update_card' && !state.checkoutReady"
                    :text="$t('paymentDunning.suspended.updateCardHelp')" position="top" wrap class="!block w-full">
                    <button type="button"
                        class="w-full rounded-lg bg-[#0F4C75] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0A3B5C] disabled:opacity-60"
                        :disabled="state.isStarting" @click="startPayment">
                        {{ state.isStarting ? $t('paymentStatus.pleaseWait') : $t('paymentDunning.suspended.updateCard') }}
                    </button>
                </Tooltip>
            </div>

            <div class="px-6 pb-6 flex items-center justify-between text-sm">
                <a :href="`mailto:${supportEmail}`" class="text-[#00607A] underline underline-offset-2">
                    {{ $t('paymentStatus.contactSupport') }}
                </a>
                <button type="button" class="text-gray-500 underline underline-offset-2" @click="logout">
                    {{ $t('paymentStatus.logOut') }}
                </button>
            </div>
        </div>
    </div>

    <!-- Not an admin: a standing notice, not a wall. Blocking someone who cannot
         pay only stops the work without fixing anything. -->
    <div v-else-if="mode === 'notice'"
        class="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 text-amber-900">
        <Icon name="ph:warning" class="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <div class="min-w-0 flex-1">
            <p class="text-sm font-medium">{{ $t('paymentStatus.notice.title') }}</p>
            <p class="text-sm mt-0.5 opacity-90">
                {{ $t('paymentStatus.notice.body', { days: state.status?.days_until_suspension ?? 0 }) }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { billingService } from '@/components/api/user/BillingService'
import { wallMode } from '@/composables/billingMethod'
import { useI18n } from 'vue-i18n'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()
const supportEmail = 'support@citizenone.dk'

let checkout = null as any

const state = reactive({
    status: null as any,
    error: '' as string,
    isStarting: false,
    isCollecting: false,
    checkoutReady: false,
})

const route = useRoute()
// The pay page is where the wall's own button leads, and where the dunning
// emails land. A blocking modal on top of it would hide the one thing that
// fixes the problem.
const onPayPage = computed(() => route.path.startsWith('/subscription/pay/'))
const mode = computed(() => wallMode(state.status, onPayPage.value))
const isSuspended = computed(() => state.status?.status === 'suspended')

const heading = computed(() => {
    if (mode.value === 'contact_admin') return t('paymentDunning.suspended.contactTitle')
    return isSuspended.value ? t('paymentDunning.suspended.title') : t('paymentStatus.wall.pastDueTitle')
})

const body = computed(() => {
    if (mode.value === 'contact_admin') return t('paymentDunning.suspended.contactBody')
    if (isSuspended.value) return t('paymentDunning.suspended.adminBody')
    return t('paymentStatus.wall.pastDueBody', { days: state.status?.days_until_suspension ?? 0 })
})

const amountLabel = computed(() => {
    const amount = Number(state.status?.amount_due ?? 0)
    if (!amount) return ''
    return amount.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr.'
})

// The failed invoice is paid with a new card on its own page, which also saves
// the card for the next charge. A standing with no invoice to name (which
// should not happen) still falls back to replacing the card on file.
function startPayment() {
    if (state.status?.failed_invoice_uuid) {
        navigateTo(`/subscription/pay/${state.status.failed_invoice_uuid}`)
        return
    }

    startCardUpdate()
}

async function startCardUpdate() {
    state.error = ''
    state.isStarting = true

    try {
        const response = await billingService.createPaymentMethod()
        const paymentId = response?.data?.payment_id

        if (!paymentId) {
            state.error = t('paymentStatus.couldNotStart')
            return
        }

        state.checkoutReady = true
        await nextTick()

        checkout = new Dibs.Checkout({
            checkoutKey: runtimeConfig?.public?.checkoutKey,
            paymentId,
            containerId: 'billing-wall-checkout',
            language: nexiCheckoutLanguage(locale.value),
            theme: { buttonRadius: '5px' },
        })

        // The new card only replaces the one on file; the money still has to be
        // collected, so ask for it straight away rather than waiting for the
        // nightly sweep.
        checkout.on('payment-completed', collectOutstanding)
    } catch (error: any) {
        state.error = error?.message ?? ''
    } finally {
        state.isStarting = false
    }
}

async function collectOutstanding() {
    checkout?.cleanup?.()
    state.checkoutReady = false
    state.isCollecting = true

    try {
        const response = await billingService.retry()

        if (response?.data?.paid) {
            window.location.reload()
            return
        }

        state.error = t('paymentStatus.stillUnpaid')
    } catch (error: any) {
        state.error = error?.message ?? ''
    } finally {
        state.isCollecting = false
    }
}

function logout() {
    clearSessionToken()
    localStorage.removeItem('rememberMe')
    navigateTo('/')
}

onMounted(async () => {
    try {
        const response = await billingService.getStatus()
        if (response) state.status = response.data ?? response
    } catch (_) {
        // Billing standing must never be what stops the app rendering.
    }
})

onUnmounted(() => checkout?.cleanup?.())
</script>
