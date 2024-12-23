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
                                            <FormButton type="button" buttonStyle="action" class="rounded-md" @click="">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('invoices.email.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md" @click="">
                                                <Icon name="ph:note-blank" class="size-4" />
                                                {{ $t('invoices.email.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.citizens" @previous="previous" @next="next" />
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { invoiceReceiverService } from '@/components/api/InvoiceReceiverService'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
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
        isNewReceiverOpen: false,
    },
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
        const response = await invoiceReceiverService.getInvoiceReceiver(params)
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
    state.dataFilter.search = value
    fetchInvoiceReceivers()
}
</script>