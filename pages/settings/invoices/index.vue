<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('invoices.invoices') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('invoices.invoices') }}</template>

            <ModulesUserSettingsTab />

            <div class="mt-10">
                <div class="space-y-5">
                    <div class="flex justify-end gap-x-3">
                        <FormButton buttonStyle="primary" @click="state.modal.isEmailReceiversOpen = true">
                            {{ $t('invoices.email.emailReceivers') }}
                        </FormButton>
                        <LoadingSpinner :isActive="state.isSendAllInvoicesLoading">
                            <FormButton buttonStyle="primary" @click="sendAllInvoices">
                                {{ $t('invoices.sendAllInvoices') }}
                            </FormButton>
                        </LoadingSpinner>
                    </div>
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.invoices"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.invoices?.data?.length === 0))">
                                <tr v-for="(invoice, index) in state.invoices?.data" :key="index">
                                    <td width="25%">
                                        <div>
                                            {{ formatDateTimeToReadable(invoice?.created_at) }}
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <div>
                                            <Badge type="primary" class="w-fit" v-if="invoice?.type === 'recurring'">
                                                {{ $t('recurring.recurring') }}
                                            </Badge>
                                            <Badge type="active" class="w-fit" v-else>
                                                {{ $t('invoices.table.new') }}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div>
                                            <Badge type="active" class="w-fit" v-if="invoice?.is_paid">
                                                {{ $t('invoices.table.paid') }}
                                            </Badge>
                                            <Badge type="inactive" class="w-fit" v-else>
                                                {{ $t('invoices.table.unpaid') }}
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
                                    <td width="20%">
                                        <div>
                                            <p>
                                                {{ invoice?.user?.company?.name }}
                                            </p>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/invoices/${invoice.uuid}/invoice-details`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('invoices.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="sendInvoice(invoice)">
                                                <Icon name="ph:envelope-simple" class="size-4" />
                                                {{ $t('invoices.table.actions.sendInvoice') }}
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
            <ModulesUserInvoiceModalEmailReceivers :isModalOpen="state.modal.isEmailReceiversOpen"
                @close="state.modal.isEmailReceiversOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { invoiceService } from '@/components/api/user/InvoiceService'
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
        name: 'invoices.invoices',
        translate: true,
        href: '/settings/invoices',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'invoices.table.date', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'invoices.table.status', isTranslateName: true, },
        { name: 'invoices.table.paid', isTranslateName: true, },
        { name: 'invoices.table.invoiceNumber', isTranslateName: true, sorter: true, key: 'invoice_number' },
        { name: 'invoices.table.amount', isTranslateName: true, sorter: true, key: 'total_amount' },
        { name: 'invoices.table.company', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    invoices: [] as any,
    isSendAllInvoicesLoading: false,
    isTableLoading: false,
    modal: {
        isEmailReceiversOpen: false,
    },
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

async function sendInvoice(invoice: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const invoiceUuid = invoice?.uuid
        const response = await invoiceService.sendInvoice(invoiceUuid)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('invoices.table.alert.invoiceSuccessfullySent')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function sendAllInvoices() {
    state.error = {}
    state.isSendAllInvoicesLoading = true
    try {
        const response = await invoiceService.sendAllInvoice()
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('invoices.alert.allInvoicesSuccessfullySent')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSendAllInvoicesLoading = false
}
</script>