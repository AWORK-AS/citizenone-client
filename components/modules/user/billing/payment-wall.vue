<template>
    <!-- Admin, payment outstanding: the app is blocked until the card is fixed.
         Everyone else keeps working and is told who can fix it. -->
    <div v-if="isBlocking" class="fixed inset-0 z-[100] bg-[#1F2533]/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8">
        <div class="w-full max-w-lg rounded-xl bg-white shadow-xl my-auto">
            <div class="px-6 pt-6 pb-4 border-b border-gray-100">
                <div class="flex items-start gap-3">
                    <span class="shrink-0 rounded-full bg-red-50 p-2">
                        <Icon name="ph:credit-card" class="h-6 w-6 text-[#CC3B2D]" aria-hidden="true" />
                    </span>
                    <div class="min-w-0">
                        <h2 class="text-lg font-semibold text-[#1F2533]">
                            {{ isSuspended ? $t('paymentStatus.wall.suspendedTitle') : $t('paymentStatus.wall.pastDueTitle') }}
                        </h2>
                        <p class="mt-1 text-sm text-gray-600">
                            {{ isSuspended
                                ? $t('paymentStatus.wall.suspendedBody')
                                : $t('paymentStatus.wall.pastDueBody', { days: state.status?.days_until_suspension ?? 0 }) }}
                        </p>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 space-y-4">
                <div v-if="amountLabel" class="rounded-lg bg-gray-50 px-4 py-3 flex items-baseline justify-between">
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

                <button v-if="!state.checkoutReady" type="button"
                    class="w-full rounded-lg bg-[#00607A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004c61] disabled:opacity-60"
                    :disabled="state.isStarting" @click="startCardUpdate">
                    {{ state.isStarting ? $t('paymentStatus.pleaseWait') : $t('paymentStatus.updateCard') }}
                </button>
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
    <div v-else-if="isNotice"
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

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const supportEmail = 'support@citizenone.dk'

let checkout = null as any

const state = reactive({
    status: null as any,
    error: '' as string,
    isStarting: false,
    isCollecting: false,
    checkoutReady: false,
})

const isOverdue = computed(() => ['past_due', 'suspended'].includes(state.status?.status))
const isSuspended = computed(() => state.status?.status === 'suspended')
const isBlocking = computed(() => isOverdue.value && !!state.status?.can_manage)
const isNotice = computed(() => isOverdue.value && !state.status?.can_manage)

const amountLabel = computed(() => {
    const amount = Number(state.status?.amount_due ?? 0)
    if (!amount) return ''
    return amount.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr.'
})

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
            language: 'da-DK',
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
    localStorage.removeItem('_token')
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
