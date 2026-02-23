<template>
    <div>
        <Modal size="md" :title="$t('expenses.viewExpense.viewExpense')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3" v-if="props.selectedExpense">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <p>
                            <span class="font-semibold">
                                {{ $t('expenses.viewExpense.employee') }}:
                            </span>
                            {{ props.selectedExpense?.user?.firstname }} {{ props.selectedExpense?.user?.lastname }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('expenses.viewExpense.expense') }}:
                            </span>
                            {{ props.selectedExpense?.name }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('expenses.viewExpense.category') }}:
                            </span>
                            {{ props.selectedExpense?.category?.name }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('expenses.viewExpense.date') }}:
                            </span>
                            {{ formatDateToReadable(props.selectedExpense?.expense_date) }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('expenses.viewExpense.amount') }}:
                            </span>
                            {{ props.selectedExpense?.amount }}
                        </p>
                        <p>
                            <span class="font-semibold">
                                {{ $t('expenses.viewExpense.description') }}:
                            </span>
                            {{ props.selectedExpense?.description }}
                        </p>
                        <div v-if="props.selectedExpense?.file_url">
                            <span class="font-semibold">
                                {{ $t('expenses.viewExpense.receipt') }}:
                            </span>
                            <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                v-if="props.selectedExpense?.file_url" @click="downloadReceipt(props.selectedExpense?.uuid)">
                                <Icon name="ph:file" class="size-6" />
                                <span class="truncate">{{ props.selectedExpense?.file_name_src }}</span>
                            </div>
                        </div>
                        
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="primary" class="rounded-md col-start-1"
                                @click="emit('editExpense'); closeModal();">
                                {{ $t('expenses.editExpense') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="cancel" class="rounded-md col-start-2"
                                @click="closeModal()">
                                {{ $t('close') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { expenseService } from '@/components/api/user/ExpenseService'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

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
const emit = defineEmits(['close', 'editExpense'])
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

async function downloadReceipt(expenseUuid: string) {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await expenseService.downloadReceipt(expenseUuid)
        if (response) {
            saveAs(response, props.selectedExpense?.file_name_src || 'receipt')
        }
    } catch (error: any) {
        state.error.message = error?.message || 'An error occurred during the download.'
    }
    state.isPageLoading = false
}

</script>