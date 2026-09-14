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

            <div id="invoice-checkout" v-show="state.isCheckoutVisible" class="mx-auto max-w-sm md:max-w-md mt-10"></div>

            <div class="mt-10" v-if="!state.isCheckoutVisible">
                <!-- What is running and what it costs, before the list of what
                     has already been charged. -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6" v-if="state.apps.length">
                    <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {{ $t('invoices.purchases.apps') }}
                        </p>
                        <p class="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">{{ state.apps.length }}</p>
                        <p class="mt-1 text-xs text-gray-500">
                            {{ $t('invoices.purchases.appsHint', { amount: formatAmount(monthlyAppTotal) }) }}
                        </p>
                    </div>
                    <div class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                            {{ $t('invoices.purchases.nextCharge') }}
                        </p>
                        <p class="mt-1 text-2xl font-semibold text-gray-900 tabular-nums">
                            {{ formatAmount(monthlyAppTotal + (state.fees.current?.fee_amount || 0)) }}
                        </p>
                        <p class="mt-1 text-xs text-gray-500">{{ $t('invoices.purchases.nextChargeHint') }}</p>
                    </div>
                </div>

                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-4 mb-6" v-if="state.apps.length">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('invoices.purchases.title') }}</h3>
                    <ul class="mt-2 divide-y divide-gray-100 text-sm">
                        <li v-for="app in state.apps" :key="app.uuid" class="flex items-center justify-between py-2">
                            <span class="text-gray-700">{{ app.name }}</span>
                            <span class="tabular-nums text-gray-900">
                                {{ formatAmount(app.monthly_price) }} {{ $t('invoices.purchases.perMonth') }}
                            </span>
                        </li>
                    </ul>
                </div>

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
                        <Table class="table-sticky-actions" :columnHeaders="state.columnHeaders" :data="state.invoices"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.invoices?.data?.length === 0))">
                                <tr v-for="(invoice, index) in state.invoices?.data" :key="index">
                                    <td width="25%">
                                        <div class="whitespace-nowrap">
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
                                        <p class="capitalize whitespace-nowrap">
                                            {{ formatAmount(invoice?.total_amount) }}
                                        </p>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/invoices/${invoice.uuid}/invoice-details`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ invoice?.is_paid
                                                    ? $t('invoices.table.actions.viewReceipt')
                                                    : $t('invoices.table.actions.viewInvoice') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="sendInvoice(invoice)">
                                                <Icon name="ph:envelope-simple" class="size-4" />
                                                {{ $t('invoices.table.actions.sendInvoice') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" v-if="!invoice?.is_paid"
                                                @click="payInvoice(invoice)">
                                                <Icon name="ph:credit-card" class="size-4" />
                                                {{ $t('invoices.table.actions.pay') }}
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
import { appService } from '@/components/api/user/AppService'
import { companyFeeService } from '@/components/api/user/CompanyFeeService'
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
const router = useRouter()
const route = useRoute()
let currentTablePage = 1
let checkout = null as any
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
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    invoices: [] as any,
    isSendAllInvoicesLoading: false,
    isTableLoading: false,
    isCheckoutVisible: false,
    modal: {
        isEmailReceiversOpen: false,
    },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    apps: [] as any[],
    fees: { current: null as any, statements: [] as any[] },
})

// What the company is paying for every month, next to what has already been
// charged. The fee is part of the same bill, so it belongs on the same page.
const monthlyAppTotal = computed(() => state.apps
    .reduce((total: number, app: any) => total + (Number(app.monthly_price) || 0), 0))

async function fetchPurchases() {
    try {
        const [apps, fees] = await Promise.all([
            appService.getApps({ per_page: 100 }),
            companyFeeService.getCompanyFees(),
        ])

        state.apps = (apps?.data || []).filter((app: any) => app.user_activated)
        state.fees = fees?.data || state.fees
    } catch (error: any) {
        // The invoice list is the point of the page; the summary is extra.
    }
}

onMounted(() => {
    fetchInvoices()
    fetchPurchases()
})

watch(() => route.query.paymentId, async (paymentId) => {
    const invoiceUuid = route.query.invoiceUuid
    if (!paymentId || !invoiceUuid) return
    state.isCheckoutVisible = false
    await verifyInvoicePayment(invoiceUuid as string, paymentId as string)
    router.replace({ query: {} })
    await fetchInvoices()
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

// A custom_monthly/custom_yearly invoice (never wired to auto-recur) paid
// here always opts into auto-renewal - see InvoiceService::payInvoice()/
// provisionInvoicePayment() on the backend, which promotes the invoice's
// frequency to plain monthly/yearly once Nexi actually tokenizes the card.
// Already-recurring/one-time/free invoices are unaffected either way.
async function payInvoice(invoice: any) {
    state.error = {}
    try {
        const response = await invoiceService.payInvoice(invoice.uuid)
        if (response?.paymentId) {
            state.isCheckoutVisible = true
            await nextTick()
            const checkoutEl = document.getElementById('invoice-checkout')
            if (checkoutEl) checkoutEl.innerHTML = ''
            checkout = new Dibs.Checkout({
                checkoutKey: runtimeConfig?.public?.checkoutKey,
                paymentId: response.paymentId,
                containerId: 'invoice-checkout',
                language: 'da-DK',
                theme: { buttonRadius: '5px' },
            })
            checkout.on('payment-completed', (res: any) => {
                checkout.cleanup()
                navigateTo(`/settings/invoices?paymentId=${res['paymentId']}&invoiceUuid=${invoice.uuid}`)
            })
        }
    } catch (error: any) {
        state.error = error
        state.isCheckoutVisible = false
    }
}

async function verifyInvoicePayment(invoiceUuid: string, paymentId: string) {
    state.error = {}
    try {
        await invoiceService.verifyInvoicePayment(invoiceUuid, paymentId)
        successAlert(`${t('alert.success')}!`, `${t('invoices.table.alert.invoicePaidSuccessfully')}.`)
    } catch (error: any) {
        state.error = error
    }
}
</script>