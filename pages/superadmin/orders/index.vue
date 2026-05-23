<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.orders.pageTitle') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.orders.header') }}
            </template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.orders.header') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{ state.orders?.meta?.total ?? state.orders?.total ?? 0 }} {{
                                $t('superadmin.orders.totalOrders') }}
                        </p>
                    </div>
                </div>

                <!-- Search -->
                <div class="mb-4">
                    <SuperadminTableSearch v-model="searchQuery"
                        :placeholder="$t('superadmin.orders.searchPlaceholder')" @input="debouncedSearch" />
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Table -->
                <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.orders" :isLoading="state.isLoading"
                    :sortData="state.sortData" :emptyMessage="$t('superadmin.orders.noOrdersFound')"
                    emptyIcon="ph:receipt" rowKey="uuid" @sort="handleSort">
                    <template #body>
                        <tr v-for="order in state.orders?.data" :key="order.uuid ?? order.id"
                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ formatDateToReadable(order.created_at) }}
                            </td>
                            <td class="co-td">
                                <span v-if="order.status === 'recurring'" class="co-badge co-badge-navy">
                                    {{ $t('superadmin.orders.statusRecurring') }}
                                </span>
                                <span v-else class="co-badge co-badge-green">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                    {{ $t('superadmin.orders.statusNew') }}
                                </span>
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478] font-mono">
                                {{ parseData(order.data)['payment']?.orderDetails?.reference ?? '—' }}
                            </td>
                            <td class="co-td capitalize text-[13px] text-[#1F2533]">
                                {{ order.external_data_type ?? '—' }}
                            </td>
                            <td class="co-td">
                                <div class="text-[13px] text-[#5C6478] space-y-0.5">
                                    <div v-for="({ label, value }) in formatOrderData(order.data)" :key="label">
                                        <span class="text-[#1F2533] font-medium">{{ label }}:</span> {{ value }}
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </template>
                </SuperadminTable>
                <div class="mt-4">
                    <Pagination :data="state.orders" @previous="previous" @next="next" />
                </div>
            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { orderService } from '@/components/api/superadmin/OrderService'
const { formatDateToReadable } = useDatetimeFormatter()
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

let currentPage = 1
let searchTimeout: any = null
const searchQuery = ref('')

const formatKey = (key: string) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const parseData = (data: any): Record<string, any> => {
    if (!data) return {}
    if (typeof data === 'object') return data
    try { return JSON.parse(data) } catch { return {} }
}

const formatOrderData = (data: any): { label: string; value: string }[] => {
    const d = parseData(data)
    const payment = d?.payment ?? {}
    const person = payment?.consumer?.privatePerson ?? {}
    const orderDetails = payment?.orderDetails ?? {}
    const paymentDetails = payment?.paymentDetails ?? {}
    const subscription = payment?.subscription ?? {}

    const rows: { label: string; value: string }[] = []

    const name = [person.firstName, person.lastName].filter(Boolean).join(' ')
    if (name) rows.push({ label: t('superadmin.orders.dataName'), value: name })
    if (person.email) rows.push({ label: t('superadmin.orders.dataEmail'), value: person.email })
    if (orderDetails.amount && orderDetails.currency)
        rows.push({ label: t('superadmin.orders.dataAmount'), value: `${(orderDetails.amount / 100).toFixed(2)} ${orderDetails.currency}` })
    if (paymentDetails.paymentMethod)
        rows.push({ label: t('superadmin.orders.dataPaymentMethod'), value: `${paymentDetails.paymentType ?? ''} — ${paymentDetails.paymentMethod}`.trim().replace(/^—\s*/, '') })
    if (subscription.myReference)
        rows.push({ label: t('superadmin.orders.dataSubscription'), value: subscription.myReference })

    return rows.length ? rows : Object.entries(d).map(([k, v]) => ({
        label: formatKey(k),
        value: typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
    }))
}

const state = reactive({
    columnHeaders: computed(() => [
        { key: 'created_at', name: t('superadmin.orders.colDate'), sorter: true },
        { key: 'status', name: t('superadmin.orders.colStatus') },
        { key: 'uuid', name: t('superadmin.orders.colReferenceNumber'), sorter: true },
        { key: 'type', name: t('superadmin.orders.colType'), sorter: true },
        { key: 'data', name: t('superadmin.orders.colData') },
    ]),
    dataFilter: {
        search: null as any,
    },
    error: {} as Error,
    isLoading: false,
    orders: {} as any,
    sortData: { sortField: 'created_at', sortOrder: 'descend' },
})

onMounted(() => {
    fetchOrders()
})

async function fetchOrders() {
    state.error = {}
    state.isLoading = true
    try {
        const params: any = {
            page: currentPage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        if (state.dataFilter.search) params.search = state.dataFilter.search
        const response = await orderService.getOrders(params)
        if (response) state.orders = response
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        const trimmed = searchQuery.value.trim()
        state.dataFilter.search = trimmed.length ? Array(trimmed.split(/\s+/)) : null
        currentPage = 1
        fetchOrders()
    }, 350)
}

function handleSort({ sort, column }: { sort: string | null; column: string | null }) {
    state.sortData.sortField = column ?? 'created_at'
    state.sortData.sortOrder = sort ?? 'descend'
    currentPage = 1
    fetchOrders()
}

function previous() {
    currentPage--
    fetchOrders()
}

function next() {
    currentPage++
    fetchOrders()
}
</script>
