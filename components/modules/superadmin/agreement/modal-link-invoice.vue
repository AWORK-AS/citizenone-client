<template>
    <Modal size="xs" :title="$t('superadmin.agreements.linkInvoice.title')" titleIcon="ph:link" :show="props.isModalOpen"
        @close="$emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading || state.isSaving">
                <div class="space-y-3">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <p class="text-sm text-[#5C6478]">
                        {{ $t('superadmin.agreements.linkInvoice.intro', {
                            label: props.installment?.label ?? '',
                            amount: formatAmount(props.installment?.amount ?? 0, 'DKK') }) }}
                    </p>
                    <form @submit.prevent="submit">
                        <SuperadminFormLabel :label="$t('superadmin.agreements.linkInvoice.invoice')" required />
                        <SuperadminFormSelectField v-model="state.invoiceUuid">
                            <option value="">{{ $t('superadmin.agreements.linkInvoice.choose') }}</option>
                            <option v-for="invoice in state.invoices" :key="invoice.uuid" :value="invoice.uuid">
                                #{{ invoice.invoice_number }} - {{ formatAmount(invoice.total_amount, 'DKK') }}
                                - {{ invoice.is_paid ? $t('superadmin.invoices.table.paid') : $t('superadmin.invoices.table.unpaid') }}
                            </option>
                        </SuperadminFormSelectField>
                        <p v-if="!state.isLoading && !state.invoices.length" class="text-[12px] text-[#8891A4] mt-2">
                            {{ $t('superadmin.agreements.linkInvoice.none') }}
                        </p>
                        <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="$emit('close')">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="!state.invoiceUuid">
                                {{ $t('superadmin.agreements.linkInvoice.action') }}
                            </FormButton>
                        </div>
                    </form>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { unwrapData } from '@/composables/agreements'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    companyUuid: { type: String, required: true },
    agreementUuid: { type: String, required: true },
    installment: { type: Object as () => any, default: null },
})
const emit = defineEmits(['close', 'linked'])

const { formatAmount } = useAmountFormatter()

const state = reactive({
    invoices: [] as any[],
    invoiceUuid: '',
    isLoading: false,
    isSaving: false,
    error: {} as Error,
})

watch(() => props.isModalOpen, async (open: boolean) => {
    if (!open) return
    state.error = {}
    state.invoiceUuid = ''
    state.isLoading = true
    try {
        // The same list the company's Invoices tab shows.
        const response = await companyService.getInvoicesPerCompany(props.companyUuid, {
            page: 1, sortField: 'id', sortOrder: 'descend',
        })
        state.invoices = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
})

async function submit() {
    if (!state.invoiceUuid || !props.installment?.uuid) return
    state.error = {}
    state.isSaving = true
    try {
        const response = await agreementService.linkInvoice(props.agreementUuid, props.installment.uuid, state.invoiceUuid)
        emit('linked', unwrapData(response))
    } catch (error: any) {
        // 422 messages are shown as the API words them.
        state.error = error
    }
    state.isSaving = false
}
</script>
