<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.invoices.invoices') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.invoices.invoices') }}</template>

            <div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.invoices"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.invoices?.data?.length === 0))">
                                <tr v-for="(invoice, index) in state.invoices?.data" :key="index">
                                    <td width="20%">
                                        <div>
                                            {{ formatDateTimeToReadable(invoice?.created_at) }}
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <div>
                                            <Badge type="primary" class="w-fit" v-if="invoice?.type === 'recurring'">
                                                {{ $t('superadmin.invoices.table.recurring') }}
                                            </Badge>
                                            <Badge type="active" class="w-fit" v-else>
                                                {{ $t('superadmin.invoices.table.new') }}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div>
                                            {{ invoice?.invoice_number }}
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <p class="capitalize">
                                            {{ formatAmount(invoice?.total_amount) }}
                                        </p>
                                    </td>
                                    <td width="25%">
                                        <div>
                                            <p>
                                                {{ invoice?.user?.company?.name }}
                                            </p>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/invoices/${invoice.uuid}/invoice-details`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('superadmin.invoices.table.actions.view') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.invoices" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { invoiceService } from '@/components/api/superadmin/InvoiceService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'superadmin.invoices.table.date', sorter: true, key: 'created_at' },
        { name: 'superadmin.invoices.table.status' },
        { name: 'superadmin.invoices.table.invoiceNumber', sorter: true, key: 'invoice_number' },
        { name: 'superadmin.invoices.table.amount', sorter: true, key: 'total_amount' },
        { name: 'superadmin.invoices.table.company' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    invoices: [] as any,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchInvoices()
})

async function fetchInvoices() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await invoiceService.getInvoices(params)
        if (response) {
            state.invoices = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchInvoices()
}

function next() {
    currentTablePage++
    fetchInvoices()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchInvoices()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchInvoices()
}
</script>