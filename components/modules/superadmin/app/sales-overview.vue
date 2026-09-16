<template>
    <div class="space-y-5">
        <div v-if="state.isLoading" class="flex justify-center py-16">
            <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
        </div>

        <template v-else>
            <!-- What the store is worth, before any per-app detail. -->
            <dl class="grid grid-cols-2 gap-3 md:grid-cols-5">
                <div class="rounded-xl border border-[#EAECF0] bg-white px-4 py-3" v-for="tile in tiles" :key="tile.label">
                    <dt class="text-[10px] font-semibold uppercase tracking-wider text-[#8891A4]">{{ tile.label }}</dt>
                    <dd class="mt-1.5 text-[22px] font-semibold tabular-nums text-[#1F2533]" :class="tile.tone">
                        {{ tile.value }}
                    </dd>
                    <span class="text-[11px] text-[#8891A4]">{{ tile.hint }}</span>
                </div>
            </dl>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <!-- Best sellers by monthly revenue. One measure, one hue. -->
                <section class="rounded-xl border border-[#EAECF0] bg-white p-5">
                    <header class="mb-4 flex items-baseline justify-between gap-3">
                        <h2 class="text-[14px] font-semibold text-[#1F2533]">{{ $t('superadmin.apps.sales.bestSelling') }}</h2>
                        <span class="text-[11px] text-[#8891A4]">{{ $t('superadmin.apps.sales.perMonthExVat') }}</span>
                    </header>
                    <div class="space-y-2.5">
                        <div v-for="row in topSellers" :key="row.uuid" class="grid grid-cols-[7.5rem_1fr_5rem] items-center gap-3">
                            <span class="truncate text-[12px] text-[#5C6478]">{{ row.name }}</span>
                            <span class="h-3.5 overflow-hidden rounded bg-[#F1F4F8]">
                                <span class="block h-full rounded-r bg-[#1B6D8A]" :style="`width:${barWidth(row)}%`" />
                            </span>
                            <span class="text-right text-[12px] font-semibold tabular-nums text-[#1F2533]">
                                {{ formatAmount(row.monthly_revenue) }}
                            </span>
                        </div>
                        <p v-if="!topSellers.length" class="py-6 text-center text-[12px] text-[#8891A4]">
                            {{ $t('superadmin.apps.sales.nothingSoldYet') }}
                        </p>
                    </div>
                </section>

                <!-- New minus cancelled. Up is green, down is amber; the sign is on the label too. -->
                <section class="rounded-xl border border-[#EAECF0] bg-white p-5">
                    <header class="mb-4 flex items-baseline justify-between gap-3">
                        <h2 class="text-[14px] font-semibold text-[#1F2533]">{{ $t('superadmin.apps.sales.netChange') }}</h2>
                        <span class="text-[11px] text-[#8891A4]">{{ $t('superadmin.apps.sales.newMinusCancelled') }}</span>
                    </header>
                    <div class="flex h-36 items-stretch gap-2">
                        <div v-for="month in state.netChange" :key="month.month" class="flex flex-1 flex-col items-center">
                            <div class="flex flex-1 w-full items-end justify-center">
                                <span v-if="month.net > 0" class="flex flex-col items-center">
                                    <span class="mb-1 text-[11px] font-semibold tabular-nums text-[#0F8A5F]">+{{ month.net }}</span>
                                    <span class="w-6 rounded-t bg-[#0F8A5F]" :style="`height:${columnHeight(month.net)}px`" />
                                </span>
                            </div>
                            <div class="flex w-full flex-1 flex-col items-center border-t border-[#EAECF0]">
                                <span v-if="month.net < 0" class="flex flex-col items-center">
                                    <span class="w-6 rounded-b bg-[#C2410C]" :style="`height:${columnHeight(month.net)}px`" />
                                    <span class="mt-1 text-[11px] font-semibold tabular-nums text-[#C2410C]">{{ month.net }}</span>
                                </span>
                                <span class="mt-1 text-[10px] text-[#8891A4]">{{ monthLabel(month.month) }}</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- App by app -->
            <section class="overflow-x-auto rounded-xl border border-[#EAECF0] bg-white">
                <table class="w-full min-w-[46rem]">
                    <thead>
                        <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                            <th class="co-th">{{ $t('superadmin.apps.sales.colApp') }}</th>
                            <th class="co-th text-right">{{ $t('superadmin.apps.sales.colActive') }}</th>
                            <th class="co-th text-right">{{ $t('superadmin.apps.sales.colNew') }}</th>
                            <th class="co-th text-right">{{ $t('superadmin.apps.sales.colCancelled') }}</th>
                            <th class="co-th text-right">{{ $t('superadmin.apps.sales.colRevenue') }}</th>
                            <th class="co-th text-right">{{ $t('superadmin.apps.sales.colShare') }}</th>
                            <th class="co-th">{{ $t('superadmin.apps.sales.colTrend') }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in sold" :key="row.uuid" class="border-b border-[#F5F6F8]">
                            <td class="co-td">
                                <span class="text-[13px] font-semibold text-[#1F2533]">{{ row.name }}</span>
                                <span class="block text-[11px] text-[#8891A4]">{{ row.category || $t('superadmin.apps.sales.noCategory') }}</span>
                            </td>
                            <td class="co-td text-right text-[13px] font-semibold tabular-nums text-[#1F2533]">{{ row.active_subscriptions }}</td>
                            <td class="co-td text-right text-[13px] tabular-nums text-[#0F8A5F]">+{{ row.new_last_30_days }}</td>
                            <td class="co-td text-right text-[13px] tabular-nums"
                                :class="row.cancelled_last_30_days > 0 ? 'text-[#C2410C]' : 'text-[#8891A4]'">
                                {{ row.cancelled_last_30_days > 0 ? '-' + row.cancelled_last_30_days : 0 }}
                            </td>
                            <td class="co-td text-right text-[13px] font-semibold tabular-nums text-[#1F2533]">{{ formatAmount(row.monthly_revenue) }}</td>
                            <td class="co-td text-right text-[13px] tabular-nums text-[#5C6478]">{{ row.share_of_customers }} %</td>
                            <td class="co-td">
                                <svg width="62" height="20" viewBox="0 0 62 20" role="img"
                                    :aria-label="$t('superadmin.apps.sales.trendLabel', { name: row.name })">
                                    <polyline :points="sparkline(row.trend)" fill="none" stroke="#1B6D8A" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <section class="rounded-xl border border-[#EAECF0] bg-white p-5" v-if="unsold.length">
                    <h2 class="text-[14px] font-semibold text-[#1F2533]">{{ $t('superadmin.apps.sales.neverSold') }}</h2>
                    <p class="mt-1 text-[12px] text-[#8891A4]">{{ $t('superadmin.apps.sales.neverSoldHint') }}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                        <span v-for="row in unsold" :key="row.uuid"
                            class="rounded-lg border border-[#EAECF0] bg-[#F9FAFB] px-2.5 py-1 text-[12px] text-[#5C6478]">
                            {{ row.name }}
                        </span>
                    </div>
                </section>

                <section class="rounded-xl border border-dashed border-[#EAECF0] bg-[#F9FAFB] p-5" v-if="!state.viewsAreMeasured">
                    <h2 class="text-[14px] font-semibold text-[#1F2533]">{{ $t('superadmin.apps.sales.conversion') }}</h2>
                    <p class="mt-1 text-[12px] text-[#8891A4]">{{ $t('superadmin.apps.sales.conversionPending') }}</p>
                </section>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { appService } from '@/components/api/superadmin/AppService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const { formatAmount: format } = useAmountFormatter()

// The panel bills in DKK whoever is reading it.
const formatAmount = (value: any) => format(value, 'DKK')

const state = reactive({
    rows: [] as any[],
    totals: {} as any,
    netChange: [] as any[],
    viewsAreMeasured: false,
    isLoading: false,
})

const sold = computed(() => state.rows.filter((row: any) => row.active_subscriptions > 0))
const unsold = computed(() => state.rows.filter((row: any) => row.active_subscriptions === 0))
const topSellers = computed(() => sold.value.slice(0, 8))

const tiles = computed(() => [
    {
        label: t('superadmin.apps.sales.monthlyRevenue'),
        value: formatAmount(state.totals.monthly_revenue ?? 0),
        hint: t('superadmin.apps.sales.acrossApps', { count: sold.value.length }),
        tone: '',
    },
    {
        label: t('superadmin.apps.sales.activeSubscriptions'),
        value: state.totals.active_subscriptions ?? 0,
        hint: t('superadmin.apps.sales.customers', { count: state.totals.customers ?? 0 }),
        tone: '',
    },
    {
        label: t('superadmin.apps.sales.newLast30'),
        value: `+${state.totals.new_last_30_days ?? 0}`,
        hint: '',
        tone: 'text-[#0F8A5F]',
    },
    {
        label: t('superadmin.apps.sales.cancelledLast30'),
        value: `-${state.totals.cancelled_last_30_days ?? 0}`,
        hint: '',
        tone: 'text-[#C2410C]',
    },
    {
        label: t('superadmin.apps.sales.oneTime12Months'),
        value: formatAmount(state.totals.one_time_revenue_last_12_months ?? 0),
        hint: t('superadmin.apps.sales.appsWithoutSale', { count: state.totals.apps_without_a_sale ?? 0 }),
        tone: '',
    },
])

function barWidth(row: any) {
    const top = topSellers.value[0]?.monthly_revenue ?? 0

    return top > 0 ? Math.max(2, Math.round((row.monthly_revenue / top) * 100)) : 0
}

function columnHeight(net: number) {
    const peak = Math.max(1, ...state.netChange.map((month: any) => Math.abs(month.net)))

    return Math.max(4, Math.round((Math.abs(net) / peak) * 54))
}

function monthLabel(month: string) {
    const date = new Date(`${month}-01T00:00:00`)
    if (isNaN(date.getTime())) return month

    return date.toLocaleDateString(locale.value === 'en' ? 'en-GB' : 'da-DK', { month: 'short' })
}

/** New subscriptions per month, drawn to the row's own peak. */
function sparkline(trend: any[] = []) {
    if (!trend.length) return '2,18 60,18'

    const peak = Math.max(1, ...trend.map((point: any) => point.new))
    const step = trend.length > 1 ? 58 / (trend.length - 1) : 0

    return trend
        .map((point: any, index: number) => `${(2 + index * step).toFixed(1)},${(18 - (point.new / peak) * 14).toFixed(1)}`)
        .join(' ')
}

onMounted(fetchSales)

async function fetchSales() {
    state.isLoading = true
    try {
        const response = await appService.getSales()
        const data = response?.data ?? {}
        state.rows = data.applications ?? []
        state.totals = data.totals ?? {}
        state.netChange = data.net_change_by_month ?? []
        state.viewsAreMeasured = !!data.views_are_measured
    } catch (error) {
        state.rows = []
    }
    state.isLoading = false
}
</script>
