<template>
    <section class="rounded-lg border-1.5 border-gray-200 bg-white p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('aiUsage.autoReload.title') }}</h3>
                <p class="mt-1 text-sm text-gray-600">
                    {{ props.autoReload?.enabled
                        ? $t('aiUsage.autoReload.on', {
                            threshold: kr(props.autoReload.threshold_kroner),
                            amount: kr(props.autoReload.amount_kroner),
                        })
                        : $t('aiUsage.autoReload.off') }}
                </p>
            </div>

            <FormButton :buttonStyle="props.autoReload?.enabled ? 'cancel' : 'AI'" buttonSize="xs" class="px-4"
                :disabled="state.saving" @click="props.autoReload?.enabled ? turnOff() : open()">
                {{ props.autoReload?.enabled ? $t('aiUsage.autoReload.turnOff') : $t('aiUsage.autoReload.turnOn') }}
            </FormButton>
        </div>

        <!-- Only when there is no card. Saying it here, before the switch is
             reached for, beats a refusal after they have set two numbers. -->
        <p v-if="!props.autoReload?.has_card" class="mt-3 text-xs text-gray-500">
            {{ $t('aiUsage.autoReload.needsCard') }}
        </p>

        <Modal size="xs" :title="$t('aiUsage.autoReload.modalTitle')" :show="state.open" @close="close">
            <template #modal-body>
                <div class="flex flex-col gap-y-5">
                    <p class="text-sm text-gray-600">{{ $t('aiUsage.autoReload.modalSubtitle') }}</p>

                    <div class="flex flex-col gap-y-1.5">
                        <label class="text-sm font-medium text-gray-900" for="ai-reload-threshold">
                            {{ $t('aiUsage.autoReload.whenBelow') }}
                        </label>
                        <div class="w-40">
                            <FormNumberField id="ai-reload-threshold" name="threshold" placeholder="100"
                                v-model="state.threshold" @input="digitsOnly($event, 'threshold')" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-y-1.5">
                        <label class="text-sm font-medium text-gray-900" for="ai-reload-amount">
                            {{ $t('aiUsage.autoReload.topUpWith') }}
                        </label>
                        <div class="w-40">
                            <FormNumberField id="ai-reload-amount" name="amount" placeholder="500"
                                v-model="state.amount" @input="digitsOnly($event, 'amount')" />
                        </div>
                        <p class="text-xs text-gray-500">{{ $t('aiUsage.buy.minimum', { amount: kr(minimum) }) }}</p>
                    </div>

                    <p class="text-xs text-gray-500">{{ $t('aiUsage.autoReload.consent') }}</p>

                    <p v-if="state.error" class="text-sm text-red-600">{{ state.error }}</p>

                    <div class="flex justify-end gap-x-3">
                        <FormButton buttonStyle="cancel" buttonSize="xs" class="px-4" @click="close">
                            {{ $t('aiUsage.autoReload.later') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" buttonSize="xs" class="px-4"
                            :disabled="state.saving || !isValid" @click="save">
                            {{ $t('aiUsage.autoReload.turnOn') }}
                        </FormButton>
                    </div>
                </div>
            </template>
        </Modal>
    </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { aiUsageService } from '@/components/api/user/AiUsageService'

/**
 * Buying capacity again before it runs out.
 *
 * The assistant is used while a caregiver is with a citizen, so running dry
 * there is not a billing inconvenience. This is for the companies that would
 * rather be charged than refused - and it stays off until one of them says so.
 *
 * It cannot be switched on without a card, and a card is only stored when
 * someone ticked the box during a purchase. The state says so plainly rather
 * than letting the switch fail after two numbers have been typed.
 */
const props = defineProps({
    autoReload: { type: Object as any, required: false, default: null },
    minimumKroner: { type: Number, required: false, default: 100 },
})

const emit = defineEmits(['updated'])

const { t, locale } = useI18n()

const state = reactive({
    open: false,
    saving: false,
    threshold: '',
    amount: '',
    error: '',
})

const minimum = computed(() => Number(props.minimumKroner) || 100)

const isValid = computed(() =>
    Number(state.threshold) >= 1 && Number(state.amount) >= minimum.value)

function open() {
    state.error = ''
    // Seeded from whatever was set last, or from something sensible rather than
    // two empty boxes: a person opening this has a preference about running out,
    // not about numbers.
    state.threshold = String(props.autoReload?.threshold_kroner || 100)
    state.amount = String(props.autoReload?.amount_kroner || 500)
    state.open = true
}

function close() {
    state.open = false
    state.error = ''
}

function digitsOnly(event: Event, field: 'threshold' | 'amount') {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 7)
    state[field] = input.value
}

function kr(value: number) {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        style: 'currency', currency: 'DKK',
        maximumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
    }).format(Number(value) || 0)
}

async function save() {
    state.saving = true
    state.error = ''

    try {
        await aiUsageService.updateAutoReload({
            enabled: true,
            threshold_kroner: Number(state.threshold),
            amount_kroner: Number(state.amount),
        })
        state.open = false
        emit('updated')
    } catch (error: any) {
        state.error = error?.message ?? t('aiUsage.autoReload.failed')
    }

    state.saving = false
}

async function turnOff() {
    state.saving = true
    state.error = ''

    try {
        // The stored card is deliberately kept. Someone turning this off for a
        // month should not have to find their card again to turn it back on.
        await aiUsageService.updateAutoReload({ enabled: false })
        emit('updated')
    } catch (error: any) {
        state.error = error?.message ?? t('aiUsage.autoReload.failed')
    }

    state.saving = false
}
</script>
