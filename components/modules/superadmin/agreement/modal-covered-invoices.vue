<template>
    <Modal size="sm" :title="$t('superadmin.agreements.covered.addTitle')" titleIcon="ph:handshake" :show="props.isModalOpen"
        @close="$emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isLoading || state.isSaving">
                <div class="space-y-3">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <p class="text-sm text-[#5C6478]">{{ $t('superadmin.agreements.covered.addIntro') }}</p>
                    <p v-if="!state.isLoading && !state.invoices.length" class="text-[12px] text-[#8891A4]">
                        {{ $t('superadmin.agreements.covered.noneToAdd') }}
                    </p>
                    <div class="max-h-72 overflow-y-auto space-y-1">
                        <label v-for="invoice in state.invoices" :key="invoice.uuid"
                            class="flex items-center gap-2 text-sm text-[#1F2533] cursor-pointer py-1">
                            <input type="checkbox" class="rounded border-[#D5D9E2]" :value="invoice.uuid"
                                v-model="state.selected" />
                            <span class="font-mono">#{{ invoice.invoice_number }}</span>
                            <span class="text-[#5C6478]">{{ formatAmount(invoice.total_amount, 'DKK') }}</span>
                            <span class="text-[11px] text-[#8891A4]">{{ formatDateToReadable(invoice.created_at) }}</span>
                        </label>
                    </div>
                    <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormButton type="button" buttonStyle="cancel" @click="$emit('close')">{{ $t('cancel') }}</FormButton>
                        <FormButton type="button" buttonStyle="primary" class="w-full" :disabled="!state.selected.length"
                            @click="submit">
                            {{ $t('superadmin.agreements.covered.addSelected', { count: state.selected.length }) }}
                        </FormButton>
                    </div>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { agreementService } from '@/components/api/superadmin/AgreementService'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { isInvoiceFree, unwrapData } from '@/composables/agreements'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    companyUuid: { type: String, required: true },
    agreementUuid: { type: String, required: true },
})
const emit = defineEmits(['close', 'covered'])

const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    invoices: [] as any[],
    selected: [] as string[],
    isLoading: false,
    isSaving: false,
    error: {} as Error,
})

watch(() => props.isModalOpen, async (open: boolean) => {
    if (!open) return
    state.error = {}
    state.selected = []
    state.isLoading = true
    try {
        const response = await companyService.getInvoicesPerCompany(props.companyUuid, {
            page: 1, sortField: 'id', sortOrder: 'descend',
        })
        // Invoices already on an installment or already covered are left out;
        // anything the list resource does not flag is left to the API's 422.
        state.invoices = (response?.data ?? []).filter(isInvoiceFree)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
})

async function submit() {
    if (!state.selected.length) return
    state.error = {}
    state.isSaving = true
    try {
        emit('covered', unwrapData(await agreementService.addCoveredInvoices(props.agreementUuid, state.selected)))
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
