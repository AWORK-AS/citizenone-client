<template>
    <section class="bg-white border border-[#EAECF0] rounded-xl shadow-sm" data-testid="license-orders">
        <div class="flex flex-wrap items-start justify-between gap-3 p-5 pb-3">
            <div>
                <h2 class="text-[15px] font-semibold text-[#1F2533]">{{ $t('superadmin.orders.licenseOrders.title') }}</h2>
                <p class="text-[12px] text-[#5C6478] mt-0.5">{{ $t('superadmin.orders.licenseOrders.subtitle') }}</p>
            </div>
            <div class="flex items-center gap-2">
                <button v-if="state.attention > 0" type="button" @click="setStatus('attention')"
                    class="co-badge co-badge-red cursor-pointer" data-testid="license-orders-attention">
                    <Icon name="ph:warning" class="w-3.5 h-3.5" aria-hidden="true" />
                    {{ $t('superadmin.orders.licenseOrders.attention', { count: state.attention }) }}
                </button>
                <select :value="state.status" @change="setStatus(($event.target as HTMLSelectElement).value)"
                    :aria-label="$t('superadmin.orders.licenseOrders.columns.status')"
                    class="text-xs border border-[#EAECF0] rounded-lg px-2 py-1.5 text-[#5C6478] bg-white outline-none focus:border-[#42AED9]">
                    <option value="">{{ $t('superadmin.orders.licenseOrders.allStatuses') }}</option>
                    <option value="attention">{{ $t('superadmin.orders.licenseOrders.attention', { count: state.attention }) }}</option>
                    <option v-for="status in LICENSE_ORDER_STATUSES" :key="status" :value="status">
                        {{ $t(licenseOrderStatusKey(status)) }}
                    </option>
                </select>
            </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="text-[11px] uppercase tracking-wide text-[#8891A4] border-y border-[#EAECF0]">
                        <th class="px-4 py-2 font-semibold">{{ $t('superadmin.orders.licenseOrders.columns.date') }}</th>
                        <th class="px-4 py-2 font-semibold">{{ $t('superadmin.orders.licenseOrders.columns.company') }}</th>
                        <th class="px-4 py-2 font-semibold">{{ $t('superadmin.orders.licenseOrders.columns.orderedBy') }}</th>
                        <th class="px-4 py-2 font-semibold">{{ $t('superadmin.orders.licenseOrders.columns.items') }}</th>
                        <th class="px-4 py-2 font-semibold text-right">{{ $t('superadmin.orders.licenseOrders.columns.total') }}</th>
                        <th class="px-4 py-2 font-semibold">{{ $t('superadmin.orders.licenseOrders.columns.invoice') }}</th>
                        <th class="px-4 py-2 font-semibold">{{ $t('superadmin.orders.licenseOrders.columns.billing') }}</th>
                        <th class="px-4 py-2 font-semibold">{{ $t('superadmin.orders.licenseOrders.columns.status') }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="state.loading">
                        <td colspan="8" class="py-8 text-center">
                            <Icon name="ph:spinner" class="w-6 h-6 text-[#42AED9] animate-spin" />
                        </td>
                    </tr>
                    <tr v-else-if="state.rows.length === 0">
                        <td colspan="8" class="py-8 text-center text-sm text-[#8891A4]">{{ $t('superadmin.orders.licenseOrders.empty') }}</td>
                    </tr>
                    <tr v-for="order in state.rows" v-else :key="order.uuid"
                        class="border-b border-[#F1F2F5] text-[13px] text-[#1F2533]"
                        :class="order.needs_attention ? 'bg-[#FFF8F7]' : ''">
                        <td class="px-4 py-2 whitespace-nowrap text-[#5C6478]">{{ formatDate(order.created_at) }}</td>
                        <td class="px-4 py-2">
                            <NuxtLink v-if="order.company" :to="`/superadmin/companies/${order.company.uuid}/license-overview`" class="hover:underline">
                                {{ order.company.name }}
                            </NuxtLink>
                        </td>
                        <td class="px-4 py-2">
                            <span>{{ order.ordered_by?.name || order.ordered_by?.email || '—' }}</span>
                            <span class="co-badge ml-1" :class="order.source === 'customer' ? 'co-badge-navy' : 'co-badge-gray'">
                                {{ $t(`superadmin.orders.licenseOrders.source.${order.source === 'customer' ? 'customer' : 'superadmin'}`) }}
                            </span>
                        </td>
                        <td class="px-4 py-2 text-[#5C6478]">{{ licenseOrderItems(order.lines) }}</td>
                        <td class="px-4 py-2 text-right tabular-nums whitespace-nowrap">{{ formatAmount(order.total_amount, 'DKK') }}</td>
                        <td class="px-4 py-2 font-mono text-[12px]">
                            <NuxtLink v-if="order.invoice" :to="`/superadmin/invoices/${order.invoice.uuid}/invoice-details`" class="hover:underline text-[#0B6FA4]">
                                #{{ order.invoice.invoice_number }}
                            </NuxtLink>
                            <span v-else class="text-[#8891A4]">—</span>
                        </td>
                        <td class="px-4 py-2 text-[#5C6478]">
                            {{ $te(`superadmin.orders.licenseOrders.method.${order.billing_method}`)
                                ? $t(`superadmin.orders.licenseOrders.method.${order.billing_method}`)
                                : order.billing_method }}
                        </td>
                        <td class="px-4 py-2 whitespace-nowrap">
                            <span class="co-badge" :class="toneClass(order.economic_status)">
                                {{ order.economic_status === 'error' && order.economic_error
                                    ? $t('superadmin.orders.licenseOrders.errorReason', { reason: order.economic_error })
                                    : $t(licenseOrderStatusKey(order.economic_status)) }}
                            </span>
                            <Icon v-if="order.needs_attention && order.economic_status !== 'error'" name="ph:clock-countdown"
                                class="w-4 h-4 text-[#CC3B2D] ml-1 align-middle" aria-hidden="true" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="state.lastPage > 1" class="flex items-center justify-end gap-3 p-3 text-xs text-[#5C6478]">
            <button type="button" class="px-2 py-1 rounded border border-[#EAECF0] disabled:opacity-40" :disabled="state.page <= 1" @click="go(state.page - 1)">
                {{ $t('superadmin.orders.licenseOrders.previous') }}
            </button>
            <span>{{ $t('superadmin.orders.licenseOrders.page', { page: state.page, pages: state.lastPage }) }}</span>
            <button type="button" class="px-2 py-1 rounded border border-[#EAECF0] disabled:opacity-40" :disabled="state.page >= state.lastPage" @click="go(state.page + 1)">
                {{ $t('superadmin.orders.licenseOrders.next') }}
            </button>
        </div>
    </section>
</template>

<script setup lang="ts">
import { orderService } from '@/components/api/superadmin/OrderService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { LICENSE_ORDER_STATUSES, licenseOrderItems, licenseOrderStatusKey, licenseOrderTone } from '@/composables/licenseGrant'

const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    rows: [] as any[],
    status: '' as string,
    page: 1,
    lastPage: 1,
    attention: 0,
    loading: false,
})

function formatDate(value?: string | null) {
    return value ? formatDateToReadable(value) : '—'
}

function toneClass(status: unknown) {
    return {
        green: 'co-badge-green',
        blue: 'co-badge-blue',
        amber: 'bg-amber-50 text-amber-800',
        red: 'co-badge-red',
        gray: 'co-badge-gray',
    }[licenseOrderTone(status)]
}

async function load() {
    state.loading = true
    try {
        const params: Record<string, string | number> = { page: state.page, per_page: 25 }
        if (state.status) params.status = state.status
        const response = await orderService.getLicenseOrders(params)
        state.rows = response?.data ?? []
        state.lastPage = response?.meta?.last_page ?? 1
        state.attention = response?.meta?.attention ?? 0
    } catch (_) {
        state.rows = []
    }
    state.loading = false
}

function setStatus(status: string) {
    state.status = status
    state.page = 1
    load()
}

function go(page: number) {
    state.page = page
    load()
}

onMounted(load)
</script>
