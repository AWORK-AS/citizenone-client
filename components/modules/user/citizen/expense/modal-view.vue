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
                                @click="downloadReceipt()">
                                <Icon name="ph:file" class="size-6" />
                                <span class="truncate">{{ props.selectedExpense?.file_name_src }}</span>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
            <template #modal-footer>
                <div class="flex justify-end gap-3">
                    <FormButton buttonStyle="tertiary" @click="closeModal">
                        {{ $t('close') }}
                    </FormButton>
                    <FormButton v-if="props.selectedExpense?.status === 'pending'" buttonStyle="action"
                        @click="editExpense">
                        {{ $t('citizens.expenses.table.actions.edit') }}
                    </FormButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenExpenseService } from '@/components/api/user/CitizenExpenseService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
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

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function editExpense() {
    emit('editExpense')
    closeModal()
}

async function downloadReceipt() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await citizenExpenseService.downloadReceipt(props.selectedExpense.uuid)
        if (response) {
            saveAs(response, props.selectedExpense?.file_name_src || 'receipt')
        }
    } catch (error: any) {
        state.error.message = error?.message || 'An error occurred during the download.'
    }
    state.isPageLoading = false
}
</script>
