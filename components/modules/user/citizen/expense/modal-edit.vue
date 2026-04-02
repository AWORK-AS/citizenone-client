<template>
    <div>
        <Modal size="sm" :title="$t('citizens.expenses.editExpense')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenExpenseForm formType="update" :selectedExpense="props.selectedExpense"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateExpense" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { expenseService } from '@/components/api/user/ExpenseService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedExpense: {
        type: Object,
        required: true,
    },
})

const { t } = useI18n()
const emit = defineEmits(['close', 'refreshExpenses'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshExpenses() {
    emit('refreshExpenses')
}

async function updateExpense(expenseDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('name', expenseDetails.name)
        params.append('description', expenseDetails.description)
        params.append('expense_category_uuid', expenseDetails.expense_category_uuid)
        params.append('citizen_uuid', expenseDetails.citizen_uuid)
        params.append('expense_date', expenseDetails.expense_date)
        params.append('amount', expenseDetails.amount)
        params.append('is_existing_file_removed', expenseDetails.is_existing_file_removed ? '1' : '0')
        if (expenseDetails.receipt) {
            params.append('receipt', expenseDetails.receipt)
        }

        const response = await expenseService.updateExpense(props.selectedExpense.uuid, params)
        if (response?.data) {
            refreshExpenses()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.expenses.form.alert.updatedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
