<template>
    <Modal size="sm" :title="$t('aiUsage.buy.title')" :show="props.isModalOpen" @close="close">
        <template #modal-body>
            <!-- Once Nexi has taken over, the amount is settled and the chooser
                 would only invite a change that no longer applies. -->
            <div v-show="state.checkoutStarted">
                <div id="ai-capacity-checkout" class="mx-auto max-w-sm"></div>
            </div>

            <div v-if="!state.checkoutStarted" class="flex flex-col gap-y-5">
                <p class="text-sm text-gray-600">{{ $t('aiUsage.buy.subtitle') }}</p>

                <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <button v-for="tier in tiers" :key="tier.kroner" type="button"
                        class="flex flex-col items-center gap-y-1 rounded-lg border-1.5 px-3 py-3 text-sm font-semibold transition-colors"
                        :class="isSelected(tier.kroner)
                            ? 'border-primary bg-primary-50 text-primary'
                            : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'"
                        @click="selectTier(tier)">
                        <span class="tabular-nums">{{ krShort(tier.kroner) }}</span>
                        <span v-if="tier.bonus_percent > 0"
                            class="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                            {{ $t('aiUsage.buy.bonus', { percent: tier.bonus_percent }) }}
                        </span>
                    </button>

                    <button type="button"
                        class="flex flex-col items-center justify-center rounded-lg border-1.5 px-3 py-3 text-sm font-semibold transition-colors"
                        :class="state.custom
                            ? 'border-primary bg-primary-50 text-primary'
                            : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'"
                        @click="chooseCustom">
                        {{ $t('aiUsage.buy.other') }}
                    </button>
                </div>

                <div v-if="state.custom" class="flex items-center gap-x-3">
                    <div class="w-32">
                        <FormNumberField name="amount" :placeholder="String(unit)" v-model="state.amountInput"
                            @input="onCustomInput" />
                    </div>
                    <!-- Sold in units, so an amount between two of them cannot be
                         charged. Saying the step here beats silently rounding it. -->
                    <p class="text-sm text-gray-500">{{ $t('aiUsage.buy.step', { unit: krShort(unit) }) }}</p>
                </div>

                <dl class="flex flex-col gap-y-2 rounded-lg bg-gray-50 px-4 py-3 text-sm">
                    <div class="flex justify-between gap-x-4">
                        <dt class="text-gray-600">{{ $t('aiUsage.buy.capacity') }}</dt>
                        <dd class="font-semibold tabular-nums text-gray-900">{{ kr(capacity) }}</dd>
                    </div>
                    <div v-if="bonusPercent > 0" class="flex justify-between gap-x-4">
                        <dt class="text-gray-600">{{ $t('aiUsage.buy.bonus', { percent: bonusPercent }) }}</dt>
                        <dd class="tabular-nums text-primary">+{{ kr(capacity - amount) }}</dd>
                    </div>
                    <div class="flex justify-between gap-x-4 border-t border-gray-200 pt-2">
                        <dt class="text-gray-600">{{ $t('aiUsage.buy.price') }}</dt>
                        <dd class="tabular-nums text-gray-900">{{ kr(amount) }}</dd>
                    </div>
                    <div class="flex justify-between gap-x-4">
                        <dt class="text-gray-600">{{ $t('aiUsage.buy.vat', { percent: taxRate }) }}</dt>
                        <dd class="tabular-nums text-gray-900">{{ kr(vat) }}</dd>
                    </div>
                    <div v-if="serviceFee > 0" class="flex justify-between gap-x-4">
                        <dt class="text-gray-600">{{ $t('aiUsage.buy.serviceFee') }}</dt>
                        <dd class="tabular-nums text-gray-900">{{ kr(serviceFee) }}</dd>
                    </div>
                    <div class="flex justify-between gap-x-4 border-t border-gray-200 pt-2">
                        <dt class="font-semibold text-gray-900">{{ $t('aiUsage.buy.toPay') }}</dt>
                        <dd class="font-semibold tabular-nums text-gray-900">{{ kr(total) }}</dd>
                    </div>
                </dl>

                <p class="text-xs text-gray-500">{{ $t('aiUsage.buy.terms') }}</p>

                <p v-if="state.error" class="text-sm text-red-600">{{ state.error }}</p>

                <div class="flex justify-end gap-x-3">
                    <FormButton buttonStyle="cancel" buttonSize="xs" class="px-4" @click="close">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" buttonSize="xs" class="px-4"
                        :disabled="state.isLoading || amount < unit" @click="pay">
                        {{ $t('aiUsage.buy.pay', { amount: kr(total) }) }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { appService } from '@/components/api/user/AppService'

/**
 * Buying more assistant capacity.
 *
 * The amount is chosen here rather than as a quantity of some unit, because
 * "how many licences do you want" is the wrong question for capacity and the
 * ladder of bonuses only makes sense against an amount.
 *
 * The payment itself is not reimplemented: the same endpoint every app purchase
 * uses creates the Nexi payment, and the same Dibs checkout renders it. Only the
 * chooser in front of it is new.
 *
 * The bonus shown here is computed from the tiers the server sent with the
 * balance, so this dialog quotes the ladder that will actually be applied when
 * the payment provisions rather than a second copy of it that could drift.
 */
const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    topupApp: { type: Object as any, required: false, default: null },
})

const emit = defineEmits(['close'])

const { t, locale } = useI18n()
const runtimeConfig = useRuntimeConfig()

let checkout = null as any

const state = reactive({
    amountInput: '',
    custom: false,
    isLoading: false,
    checkoutStarted: false,
    error: '',
})

const tiers = computed(() => (props.topupApp?.tiers ?? []) as any[])
const unit = computed(() => Number(props.topupApp?.unit_kroner) || 100)
const amount = computed(() => Number(state.amountInput) || 0)

const bonusPercent = computed(() => {
    // Highest tier at or below what is being paid, matching AiTopupTiers on the
    // server: an amount typed into "Other" earns the same rung as a tile rather
    // than falling to zero for not matching one exactly.
    let best = 0
    for (const tier of tiers.value) {
        if (amount.value + 0.001 >= Number(tier.kroner)) best = Math.max(best, Number(tier.bonus_percent) || 0)
    }
    return best
})

const capacity = computed(() => Math.round(amount.value * (1 + bonusPercent.value / 100) * 100) / 100)

// Checkout adds VAT and a service fee, and the card is charged the sum. The
// rest of the product quotes ex-VAT prices, which is fine on a catalogue tile -
// it is not fine on the dialog where the payment is authorised. Both figures
// come from the server, read from the same config the payment request reads.
const taxRate = computed(() => Number(props.topupApp?.tax_rate_percent) || 0)
const serviceFee = computed(() => Number(props.topupApp?.service_fee_kroner) || 0)
const vat = computed(() => Math.round(amount.value * taxRate.value) / 100)
const total = computed(() => Math.round((amount.value + vat.value + serviceFee.value) * 100) / 100)

function isSelected(kroner: number) {
    return !state.custom && amount.value === Number(kroner)
}

function selectTier(tier: any) {
    state.custom = false
    state.amountInput = String(tier.kroner)
}

function chooseCustom() {
    state.custom = true
}

function onCustomInput(event: Event) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 7)
    state.amountInput = input.value
}

/**
 * Money on a chooser and on the button, where the ører are noise: 200 kr., not
 * 200,00 kr. The breakdown keeps its decimals, because that is a statement of
 * what is owed and there decimals are the convention.
 */
function krShort(value: number) {
    const amount = Number(value) || 0
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        style: 'currency', currency: 'DKK',
        maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount)
}

function kr(value: number) {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        style: 'currency', currency: 'DKK', maximumFractionDigits: 2,
    }).format(Number(value) || 0)
}

async function pay() {
    if (!props.topupApp?.uuid || amount.value < unit.value) return

    state.isLoading = true
    state.error = ''

    try {
        // Rounded down to a whole unit: the catalogue charges a unit price times
        // a quantity, so an amount between two units cannot be taken. Rounding
        // up would charge more than the dialog quoted.
        const quantity = Math.max(1, Math.floor(amount.value / unit.value))

        const response = await appService.activateApp(props.topupApp.uuid, { quantity })

        if (response?.paymentId) {
            state.checkoutStarted = true
            await nextTick()

            checkout = new Dibs.Checkout({
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response.paymentId,
                containerId: 'ai-capacity-checkout',
                language: locale.value === 'en' ? 'en-GB' : 'da-DK',
                theme: { buttonRadius: '5px' },
            })

            checkout.on('payment-completed', (event: any) => {
                checkout.cleanup()
                navigateTo(`/apps/purchased-successfully?paymentId=${event?.paymentId ?? ''}`)
            })
        }
    } catch (error: any) {
        state.error = error?.message ?? t('aiUsage.buy.failed')
    }

    state.isLoading = false
}

function close() {
    if (checkout) {
        try { checkout.cleanup() } catch { /* already gone */ }
        checkout = null
    }
    state.checkoutStarted = false
    state.error = ''
    emit('close')
}

// Open on the middle tier: the cheapest is the anchor nobody thinks about, and
// preselecting the largest would be pushing rather than helping.
watch(() => props.isModalOpen, (open: boolean) => {
    if (!open) return
    state.custom = false
    state.checkoutStarted = false
    state.error = ''
    const list = tiers.value
    state.amountInput = String(list[Math.min(1, list.length - 1)]?.kroner ?? unit.value)
}, { immediate: true })

declare const Dibs: any
</script>
