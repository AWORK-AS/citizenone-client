<template>
    <Modal size="sm" :title="$t('aiUsage.buy.title')" :show="props.isModalOpen" @close="close">
        <template #modal-body>
            <!-- Once Nexi has taken over, the amount is settled and the chooser
                 would only invite a change that no longer applies. -->
            <div v-show="state.checkoutStarted && !state.done">
                <div id="ai-capacity-checkout" class="mx-auto max-w-sm"></div>
            </div>

            <!-- The receipt stays on this page rather than sending the admin to a
                 generic success screen: the balance they just topped up is a few
                 centimetres away, and this is the moment the bonus is worth
                 naming - it is the thing they would otherwise never notice. -->
            <div v-if="state.done" class="flex flex-col items-center gap-y-3 py-4 text-center">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg class="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                    </svg>
                </div>

                <p class="text-base font-semibold text-gray-900">{{ $t('aiUsage.buy.received') }}</p>

                <p class="text-sm text-gray-600">
                    {{ $t('aiUsage.buy.receivedAmount', { amount: kr(state.doneCapacity) }) }}
                </p>

                <p v-if="state.doneBonus > 0"
                    class="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {{ $t('aiUsage.buy.saved', { percent: state.doneBonus, amount: kr(state.doneCapacity - state.donePaid) }) }}
                </p>

                <FormButton buttonStyle="primary" buttonSize="xs" class="mt-2 px-6" @click="close">
                    {{ $t('aiUsage.buy.done') }}
                </FormButton>
            </div>

            <div v-if="!state.checkoutStarted && !state.done" class="flex flex-col gap-y-5">
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
                        <FormNumberField name="amount" :placeholder="String(minimum)" v-model="state.amountInput"
                            @input="onCustomInput" />
                    </div>
                    <p class="text-sm text-gray-500">{{ $t('aiUsage.buy.minimum', { amount: krShort(minimum) }) }}</p>
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
                        <dt class="font-semibold text-gray-900">{{ $t('aiUsage.buy.toPay') }}</dt>
                        <dd class="font-semibold tabular-nums text-gray-900">{{ kr(amount) }}</dd>
                    </div>
                    <!-- Carved out of the amount, not added to it. "Of which" is
                         what an inclusive price says, and it is what the order
                         sent to Nexi itemises. -->
                    <div class="flex justify-between gap-x-4 text-xs text-gray-500">
                        <dt>{{ $t('aiUsage.buy.ofWhichVat', { percent: taxRate }) }}</dt>
                        <dd class="tabular-nums">{{ kr(vat) }}</dd>
                    </div>
                    <div v-if="serviceFee > 0" class="flex justify-between gap-x-4 text-xs text-gray-500">
                        <dt>{{ $t('aiUsage.buy.ofWhichServiceFee') }}</dt>
                        <dd class="tabular-nums">{{ kr(serviceFee) }}</dd>
                    </div>
                </dl>

                <!-- Offered here because this is the only moment a card can be
                     kept: the purchase is where one is entered. Unticked by
                     default - storing a card for a charge nobody asked for would
                     be taking something that was not offered. -->
                <label v-if="!props.hasCard" class="flex cursor-pointer items-start gap-x-2.5 text-sm text-gray-700">
                    <input type="checkbox" v-model="state.autoReload"
                        class="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <span>{{ $t('aiUsage.buy.rememberCard') }}</span>
                </label>

                <p class="text-xs text-gray-500">{{ $t('aiUsage.buy.terms') }}</p>

                <p v-if="state.error" class="text-sm text-red-600">{{ state.error }}</p>

                <div class="flex justify-end gap-x-3">
                    <FormButton buttonStyle="cancel" buttonSize="xs" class="px-4" @click="close">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" buttonSize="xs" class="px-4"
                        :disabled="state.isLoading || amount < minimum" @click="pay">
                        {{ $t('aiUsage.buy.pay', { amount: krShort(amount) }) }}
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
    hasCard: { type: Boolean, required: false, default: false },
})

const emit = defineEmits(['close', 'purchased'])

const { t, locale } = useI18n()
const runtimeConfig = useRuntimeConfig()

let checkout = null as any

const state = reactive({
    amountInput: '',
    custom: false,
    autoReload: false,
    isLoading: false,
    checkoutStarted: false,
    done: false,
    donePaid: 0,
    doneCapacity: 0,
    doneBonus: 0,
    error: '',
})

const tiers = computed(() => (props.topupApp?.tiers ?? []) as any[])
const minimum = computed(() => Number(props.topupApp?.minimum_kroner) || 100)
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
// Carved out of the chosen amount, mirroring createCapacityPaymentBody: the fee
// comes off the top, then VAT out of what is left.
const vat = computed(() => {
    const net = (amount.value - serviceFee.value) / (1 + taxRate.value / 100)
    return Math.round((amount.value - serviceFee.value - net) * 100) / 100
})

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
    if (!props.topupApp?.uuid || amount.value < minimum.value) return

    state.isLoading = true
    state.error = ''

    try {
        // The amount, not a quantity. The server charges exactly this and carves
        // the VAT and the fee out of it, so what the button said is what the
        // statement will say.
        const response = await appService.activateApp(props.topupApp.uuid, {
            amount: amount.value,
            auto_reload: state.autoReload,
        })

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

            // Captured before the dialog resets, so the receipt can say what was
            // actually bought rather than re-deriving it from a chooser the user
            // may already have changed.
            const paid = amount.value
            const gained = capacity.value
            const bonus = bonusPercent.value

            checkout.on('payment-completed', () => {
                try { checkout.cleanup() } catch { /* already gone */ }
                state.donePaid = paid
                state.doneCapacity = gained
                state.doneBonus = bonus
                state.done = true
                emit('purchased')
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
    state.done = false
    state.error = ''
    emit('close')
}

// Open on the middle tier: the cheapest is the anchor nobody thinks about, and
// preselecting the largest would be pushing rather than helping.
watch(() => props.isModalOpen, (open: boolean) => {
    if (!open) return
    state.custom = false
    state.autoReload = false
    state.checkoutStarted = false
    state.done = false
    state.error = ''
    const list = tiers.value
    state.amountInput = String(list[Math.min(1, list.length - 1)]?.kroner ?? minimum.value)
}, { immediate: true })

declare const Dibs: any
</script>
