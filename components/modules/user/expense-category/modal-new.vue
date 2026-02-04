<template>
    <div>
        <Modal size="xs" :title="$t('expenseCategories.addNewExpenseCategory')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserExpenseCategoryForm formType="create" :selectedExpenseCategory="state.formExpenseCategory"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveExpenseCategory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { expenseCategoryService } from '@/components/api/user/ExpenseCategoryService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshExpenseCategories'])

const state = reactive({
    error: {} as Error,
    formExpenseCategory: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshExpenseCategories() {
    emit('refreshExpenseCategories')
}

async function saveExpenseCategory(expenseCategoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: expenseCategoryDetails.name,
        }
        const response = await expenseCategoryService.saveExpenseCategory(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('expenseCategories.form.alert.newExpenseCategorySuccessfullySaved')}.`)
            refreshExpenseCategories()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>