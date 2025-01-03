<template>
    <div>
        <Modal size="xl" :title="$t('invoices.email.emailReceivers')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isNewReceiverOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('invoices.email.newReceiver') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.invoiceReceivers"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.invoiceReceivers?.data?.length === 0))">
                                <tr v-for="(invoiceReceiver, index) in state.invoiceReceivers?.data" :key="index">
                                    <td width="40%">
                                        <div>
                                            <span>
                                                {{ invoiceReceiver?.firstname }} {{ invoiceReceiver?.lastname }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="40%">
                                        <span>{{ invoiceReceiver?.email }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editInvoiceReceiver(invoiceReceiver)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('invoices.email.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="confirmEmailReceiverDeletion(invoiceReceiver)">
                                                <Icon name="ph:note-blank" class="size-4" />
                                                {{ $t('invoices.email.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.invoiceReceivers" @previous="previous" @next="next" />
                </div>
                <ModulesInvoiceModalNew :isModalOpen="state.modal.isNewReceiverOpen"
                    @close="state.modal.isNewReceiverOpen = false" @refreshInvoiceReceivers="fetchInvoiceReceivers" />
                <ModulesInvoiceModalEdit :isModalOpen="state.modal.isEditReceiverOpen"
                    :selectedInvoiceReceiver="state.selectedInvoiceReceiver"
                    @close="state.modal.isEditReceiverOpen = false" @refreshInvoiceReceivers="fetchInvoiceReceivers" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteInvoiceReceiverOpen"
                    :message="$t('invoices.email.table.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteInvoiceReceiverOpen = false" @confirm="deleteInvoiceReceiver" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { invoiceReceiverService } from '@/components/api/InvoiceReceiverService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'invoices.email.table.name', sorter: true, key: 'firstname' },
        { name: 'invoices.email.table.email', sorter: true, key: 'email' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    invoiceReceivers: [] as any,
    isTableLoading: false,
    modal: {
        isDeleteInvoiceReceiverOpen: false,
        isNewReceiverOpen: false,
        isEditReceiverOpen: false,
    },
    selectedInvoiceReceiver: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        fetchInvoiceReceivers()
    }
})

async function fetchInvoiceReceivers() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await invoiceReceiverService.getInvoiceReceivers(params)
        if (response) {
            state.invoiceReceivers = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchInvoiceReceivers()
}

function next() {
    currentTablePage++
    fetchInvoiceReceivers()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchInvoiceReceivers()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchInvoiceReceivers()
}

function editInvoiceReceiver(invoiceReceiver: any) {
    state.selectedInvoiceReceiver = invoiceReceiver
    state.modal.isEditReceiverOpen = true
}

function confirmEmailReceiverDeletion(invoiceReceiver: any) {
    state.selectedInvoiceReceiver = invoiceReceiver
    state.modal.isDeleteInvoiceReceiverOpen = true
}

async function deleteInvoiceReceiver() {
    state.error = {}
    state.isTableLoading = true
    try {
        const invoiceReceiverUuid = state.selectedInvoiceReceiver?.uuid
        const response = await invoiceReceiverService.deleteInvoiceReceiver(invoiceReceiverUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('invoices.email.table.alert.emailReceiverSuccessfullyDeleted')}.`)
            fetchInvoiceReceivers()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>