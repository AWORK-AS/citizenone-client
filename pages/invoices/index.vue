<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('clientInvoices.clientInvoices') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('clientInvoices.clientInvoices') }}</template>

            <div class="mt-10">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/invoices/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('clientInvoices.newInvoice') }}
                    </FormButton>
                </div>
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
                                    <td width="20%">
                                        <div>
                                            {{ invoice?.invoice_number }}
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <p class="capitalize">
                                            {{ formatAmount(invoice?.total_amount) }}
                                        </p>
                                    </td>
                                    <td width="20%">
                                        <div>
                                            <p>
                                                {{ invoice?.user?.company?.name }}
                                            </p>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/invoices/${invoice.uuid}/invoice-details`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('clientInvoices.table.actions.view') }}
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
import { clientInvoiceService } from '@/components/api/user/ClientInvoiceService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'clientInvoices.clientInvoices',
        translate: true,
        href: '/invoices',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'clientInvoices.table.date', sorter: true, key: 'created_at' },
        { name: 'clientInvoices.table.invoiceNumber', sorter: true, key: 'invoice_number' },
        { name: 'clientInvoices.table.amount', sorter: true, key: 'total_amount' },
        { name: 'clientInvoices.table.billedTo' },
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
    fetchClientInvoices()
})

async function fetchClientInvoices() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await clientInvoiceService.getClientInvoices(params)
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
    fetchClientInvoices()
}

function next() {
    currentTablePage++
    fetchClientInvoices()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchClientInvoices()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchClientInvoices()
}
</script>