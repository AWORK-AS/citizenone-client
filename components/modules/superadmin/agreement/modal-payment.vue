<template>
    <Modal size="xs" :title="$t('superadmin.agreements.payment.title')" titleIcon="ph:bank" :show="props.isModalOpen"
        @close="$emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isSaving">
                <div class="space-y-3">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <p class="text-sm text-[#5C6478]">
                        {{ $t('superadmin.agreements.payment.intro', { number: props.invoice?.invoice_number ?? '' }) }}
                    </p>
                    <form @submit.prevent="submit">
                        <div class="space-y-3">
                            <div>
                                <SuperadminFormLabel :label="$t('superadmin.agreements.payment.paidAt')" required />
                                <input type="date" v-model="state.form.paid_at" class="co-input" required />
                            </div>
                            <div>
                                <SuperadminFormLabel :label="$t('superadmin.agreements.payment.paidAmount')" required />
                                <input type="number" step="0.01" min="0" v-model="state.form.paid_amount"
                                    class="co-input" required />
                                <p class="text-[11px] text-[#8891A4] mt-1">
                                    {{ $t('superadmin.agreements.payment.paidAmountHint') }}
                                </p>
                            </div>
                            <div>
                                <SuperadminFormLabel :label="$t('superadmin.agreements.payment.note')" />
                                <input type="text" maxlength="255" v-model="state.form.payment_note" class="co-input"
                                    :placeholder="$t('superadmin.agreements.payment.notePlaceholder')" />
                            </div>
                        </div>
                        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="$emit('close')">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('superadmin.agreements.payment.register') }}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { agreementService } from '@/components/api/superadmin/AgreementService'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    /** The invoice being paid: needs uuid, invoice_number and an amount incl. VAT. */
    invoice: { type: Object as () => any, default: null },
})
const emit = defineEmits(['close', 'saved'])

const state = reactive({
    isSaving: false,
    error: {} as Error,
    form: { paid_at: '', paid_amount: '' as string | number, payment_note: '' },
})

watch(() => props.isModalOpen, (open: boolean) => {
    if (!open) return
    state.error = {}
    state.form.paid_at = moment().format('YYYY-MM-DD')
    state.form.paid_amount = props.invoice?.total_amount ?? ''
    state.form.payment_note = ''
})

async function submit() {
    if (!props.invoice?.uuid) return
    state.error = {}
    state.isSaving = true
    try {
        await agreementService.registerPayment(props.invoice.uuid, {
            paid_at: state.form.paid_at,
            paid_amount: Number(state.form.paid_amount),
            payment_note: state.form.payment_note.trim() ? state.form.payment_note.trim() : null,
        })
        emit('saved')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
