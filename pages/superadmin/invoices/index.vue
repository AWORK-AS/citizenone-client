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
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.invoices"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.invoices?.data?.length === 0))">
                                <tr v-for="(data, index) in state.invoices?.data" :key="index">
                                    <td width="20%">
                                        <div>
                                            {{ formatDateTimeToReadable(data?.created_at) }}
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <div>
                                            <Badge type="primary" class="w-fit" v-if="data?.status === 'recurring'">
                                                {{ $t('superadmin.invoices.table.recurring') }}
                                            </Badge>
                                            <Badge type="active" class="w-fit" v-else>
                                                {{ $t('superadmin.invoices.table.new') }}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div>
                                            {{ data?.invoice_number }}
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <p class="capitalize">
                                            {{ formatAmount(data?.total_amount) }}
                                        </p>
                                    </td>
                                    <td width="25%">
                                        <div>
                                            <p>
                                                {{ data?.user?.company?.name }}
                                            </p>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/invoices/${data.uuid}/invoice-details`)">
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'invoice_number' },
        { column: 'company_name' },
        { column: 'status' },
    ],
    columnHeaders: [
        { name: 'superadmin.invoices.table.date', sorter: true, key: 'created_at' },
        { name: 'superadmin.invoices.table.status' },
        { name: 'superadmin.invoices.table.invoiceNumber', sorter: true, key: 'invoice_number' },
        { name: 'superadmin.invoices.table.amount', sorter: true, key: 'total_amount' },
        { name: 'superadmin.invoices.table.company' },
        { name: '' },
    ],
    dataFilter: [],
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchInvoices()
}

function formatAmount(amount: any) {
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'DKK ' + formattedIntegerPart + ',' + decimalPart
}
</script>