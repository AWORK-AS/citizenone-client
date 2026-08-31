<template>
    <Modal :title="$t('citizens.priceEstimates.settleTitle')" :show="props.isModalOpen" @close="emit('close')">
        <template #modal-body>
            <div class="space-y-4">
                <Alert type="danger" :text="state.error" v-if="state.error" />

                <p class="text-sm text-gray-600">
                    {{ $t('citizens.priceEstimates.settleExplanation') }}
                </p>

                <div class="rounded-lg bg-surface-100 px-4 py-3">
                    <p class="text-xs uppercase tracking-wide text-gray-500">
                        {{ $t('citizens.priceEstimates.leftToSettle') }}
                    </p>
                    <p class="text-2xl font-semibold tabular-nums text-gray-900">
                        {{ formatAmount(props.estimate?.billable_amount) }}
                    </p>
                </div>

                <div class="space-y-1">
                    <FormLabel for="settle-method" :label="$t('citizens.priceEstimates.paymentMethod')" />
                    <FormSelect id="settle-method" :options="methodOptions" v-model="state.method" />
                </div>

                <div class="flex items-center justify-end gap-2 pt-2">
                    <FormButton buttonStyle="action" @click="emit('close')" :disabled="state.isSaving">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton buttonStyle="primary" @click="settle" :disabled="state.isSaving">
                        {{ $t('citizens.priceEstimates.settleNow') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
    isModalOpen: boolean
    citizenUuid: string
    estimate: any | null
}>()

const emit = defineEmits<{ (event: 'settled'): void; (event: 'close'): void }>()

const { t, locale } = useI18n()

const state = reactive({
    method: 'card',
    isSaving: false,
    error: '',
})

// The ways a patient hands money over at the desk. Bank transfer and the rest
// belong to an invoice that was sent, which is the other button.
const methodOptions = computed(() => [
    { value: 'card', label: t('citizens.priceEstimates.methods.card') },
    { value: 'terminal', label: t('citizens.priceEstimates.methods.terminal') },
    { value: 'mobilepay', label: t('citizens.priceEstimates.methods.mobilepay') },
    { value: 'cash', label: t('citizens.priceEstimates.methods.cash') },
])

function formatAmount(amount: any): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

async function settle() {
    if (!props.estimate) return

    state.error = ''
    state.isSaving = true

    try {
        await citizenInvoiceService.settleEstimate(props.citizenUuid, props.estimate.uuid, {
            method: state.method,
            // Settling twice from a double click would raise a second invoice,
            // so the estimate and the amount identify the attempt.
            idempotency_key: `settle-${props.estimate.uuid}-${props.estimate.billable_amount}`,
        })

        emit('settled')
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isSaving = false
    }
}

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return

    state.error = ''
    state.method = 'card'
})
</script>
