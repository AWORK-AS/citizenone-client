<template>
    <div class="space-y-5">
        <div class="flex flex-wrap items-end justify-between gap-3">
            <div class="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-0.5">
                <button type="button" v-for="option in periodOptions" :key="option.value" @click="setPeriod(option.value)"
                    :class="[
                        'rounded-md px-3 py-1.5 text-sm font-medium transition',
                        state.period === option.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    ]">
                    {{ option.label }}
                </button>
            </div>

            <div class="flex flex-wrap items-end gap-2">
                <div class="space-y-1">
                    <FormLabel for="from" :label="$t('invoicing.reports.from')" />
                    <FormDateField id="from" name="from" v-model="state.from"
                        :placeholder="$t('invoicing.reports.from')" @update:modelValue="onDateTyped" />
                </div>
                <div class="space-y-1">
                    <FormLabel for="to" :label="$t('invoicing.reports.to')" />
                    <FormDateField id="to" name="to" v-model="state.to" :placeholder="$t('invoicing.reports.to')"
                        @update:modelValue="onDateTyped" />
                </div>
                <FormButton buttonStyle="action" @click="exportCsv">
                    <Icon name="ph:download-simple" class="size-4" />
                    {{ $t('invoicing.reports.export') }}
                </FormButton>
            </div>
        </div>

        <Alert type="danger" :text="state.error" v-if="state.error" />

        <LoadingSpinner :isActive="state.isLoading">
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div v-for="card in cards" :key="card.key"
                    class="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-gray-900/5">
                    <p class="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{{ card.label }}</p>
                    <p class="mt-1 text-2xl font-semibold tabular-nums" :class="card.tone">
                        {{ formatAmount(card.value) }}
                    </p>
                    <p class="mt-1 text-xs text-gray-500">{{ card.hint }}</p>
                </div>
            </div>

            <div class="mt-5 grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div class="xl:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-5">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('invoicing.reports.overTime') }}</h3>
                    <ClientOnly>
                        <VChart :option="chartOption" style="height: 280px; width: 100%;" autoresize />
                    </ClientOnly>
                </div>

                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-5">
                    <h3 class="text-sm font-semibold text-gray-900">{{ $t('invoicing.reports.ageing') }}</h3>
                    <p class="text-xs text-gray-500">{{ $t('invoicing.reports.ageingHelp') }}</p>
                    <dl class="mt-3 space-y-2 text-sm">
                        <div v-for="bucket in state.report.outstanding_by_age" :key="bucket.bucket"
                            class="flex items-center justify-between gap-3">
                            <dt class="text-gray-500">{{ $t(`invoicing.reports.buckets.${bucket.bucket}`) }}</dt>
                            <dd class="tabular-nums" :class="bucket.bucket === 'days_60_plus' && bucket.amount > 0
                                ? 'text-red-600 font-medium' : 'text-gray-900'">
                                {{ formatAmount(bucket.amount) }}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <div class="mt-5 grid grid-cols-1 xl:grid-cols-3 gap-5">
                <div class="xl:col-span-2 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
                    <h3 class="px-5 pt-5 text-sm font-semibold text-gray-900">{{ $t('invoicing.reports.topServices') }}</h3>
                    <table class="mt-3 min-w-full text-sm">
                        <thead>
                            <tr class="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th class="px-5 py-2">{{ $t('services.form.name') }}</th>
                                <th class="px-5 py-2 text-right">{{ $t('citizens.invoices.form.quantity') }}</th>
                                <th class="px-5 py-2 text-right">{{ $t('invoicing.reports.revenue') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="row in state.report.top_services" :key="`${row.code}-${row.name}`"
                                class="border-t border-gray-100">
                                <td class="px-5 py-2">
                                    <span class="text-gray-400 tabular-nums mr-1" v-if="row.code">{{ row.code }}</span>
                                    {{ row.name }}
                                </td>
                                <td class="px-5 py-2 text-right tabular-nums">{{ formatQuantity(row.quantity) }}</td>
                                <td class="px-5 py-2 text-right tabular-nums">{{ formatAmount(row.amount) }}</td>
                            </tr>
                            <tr v-if="!state.report.top_services.length">
                                <td class="px-5 py-4 text-sm text-gray-500" colspan="3">
                                    {{ $t('invoicing.reports.empty') }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-5 space-y-5">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-900">{{ $t('services.categories.title') }}</h3>
                        <dl class="mt-2 space-y-1 text-sm">
                            <div v-for="row in state.report.by_category" :key="row.name || 'none'"
                                class="flex justify-between gap-3">
                                <dt class="text-gray-500">{{ row.name || $t('services.categories.uncategorised') }}</dt>
                                <dd class="tabular-nums">{{ formatAmount(row.amount) }}</dd>
                            </div>
                            <p class="text-sm text-gray-500" v-if="!state.report.by_category.length">
                                {{ $t('invoicing.reports.empty') }}
                            </p>
                        </dl>
                    </div>

                    <div class="border-t border-gray-100 pt-4">
                        <h3 class="text-sm font-semibold text-gray-900">{{ $t('invoicing.reports.paymentMethods') }}</h3>
                        <dl class="mt-2 space-y-1 text-sm">
                            <div v-for="row in state.report.payment_methods" :key="row.method"
                                class="flex justify-between gap-3">
                                <dt class="text-gray-500">
                                    {{ $t(`citizens.invoices.methods.${row.method}`) }}
                                    <span class="text-xs text-gray-400">{{ row.payment_count }}</span>
                                </dt>
                                <dd class="tabular-nums">{{ formatAmount(row.amount) }}</dd>
                            </div>
                            <p class="text-sm text-gray-500" v-if="!state.report.payment_methods.length">
                                {{ $t('invoicing.reports.empty') }}
                            </p>
                        </dl>
                    </div>
                </div>
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenInvoiceService } from '@/components/api/user/CitizenInvoiceService'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const emptyReport = () => ({
    totals: {
        invoice_count: 0,
        net_amount: 0,
        vat_amount: 0,
        subsidy_amount: 0,
        total_amount: 0,
        paid_amount: 0,
        outstanding: 0,
        overdue: 0,
        draft_count: 0,
    },
    open: { outstanding: 0, overdue: 0 },
    monthly: [] as any[],
    top_services: [] as any[],
    by_category: [] as any[],
    payment_methods: [] as any[],
    fees: [] as any[],
    outstanding_by_age: [] as any[],
})

const state = reactive({
    report: emptyReport(),
    period: 'month',
    from: moment().startOf('month').format('YYYY-MM-DD'),
    to: moment().endOf('month').format('YYYY-MM-DD'),
    isLoading: true,
    error: '',
})

const periodOptions = computed(() => [
    { value: 'month', label: t('invoicing.reports.periods.month') },
    { value: 'last_month', label: t('invoicing.reports.periods.lastMonth') },
    { value: 'quarter', label: t('invoicing.reports.periods.quarter') },
    { value: 'year', label: t('invoicing.reports.periods.year') },
])

// Turnover is what was invoiced before VAT: the VAT is the state's, not the
// clinic's, so counting it as income would flatter every figure on the page.
const cards = computed(() => [
    {
        key: 'revenue',
        label: t('invoicing.reports.cards.revenue'),
        value: state.report.totals.net_amount,
        hint: t('invoicing.reports.cards.revenueHint', { count: state.report.totals.invoice_count }),
        tone: 'text-gray-900',
    },
    {
        key: 'outstanding',
        label: t('invoicing.reports.cards.outstanding'),
        value: state.report.open.outstanding,
        hint: t('invoicing.reports.cards.outstandingHint', { count: state.report.totals.draft_count }),
        tone: 'text-gray-900',
    },
    {
        key: 'overdue',
        label: t('invoicing.reports.cards.overdue'),
        value: state.report.open.overdue,
        hint: t('invoicing.reports.cards.overdueHint'),
        tone: state.report.open.overdue > 0 ? 'text-red-600' : 'text-gray-900',
    },
    {
        key: 'paid',
        label: t('invoicing.reports.cards.paid'),
        value: state.report.totals.paid_amount,
        hint: t('invoicing.reports.cards.paidHint'),
        tone: 'text-gray-900',
    },
])

const chartOption = computed(() => ({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, icon: 'roundRect' },
    grid: { left: 60, right: 16, top: 16, bottom: 44 },
    xAxis: {
        type: 'category',
        data: state.report.monthly.map((row: any) => row.month),
        axisTick: { show: false },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
        {
            name: t('invoicing.reports.revenue'),
            type: 'bar',
            data: state.report.monthly.map((row: any) => row.net_amount),
            itemStyle: { color: '#4F46E5', borderRadius: [4, 4, 0, 0] },
            barMaxWidth: 28,
        },
        {
            name: t('invoicing.reports.cards.paid'),
            type: 'line',
            smooth: true,
            data: state.report.monthly.map((row: any) => row.paid_amount),
            itemStyle: { color: '#059669' },
        },
    ],
}))

function formatAmount(amount: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0)
}

function formatQuantity(quantity: number): string {
    return String(Number(quantity) || 0).replace('.', ',')
}

function setPeriod(period: string) {
    state.period = period

    const ranges: Record<string, [any, any]> = {
        month: [moment().startOf('month'), moment().endOf('month')],
        last_month: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        quarter: [moment().startOf('quarter'), moment().endOf('quarter')],
        year: [moment().startOf('year'), moment().endOf('year')],
    }

    const [from, to] = ranges[period] || ranges.month
    state.from = from.format('YYYY-MM-DD')
    state.to = to.format('YYYY-MM-DD')

    load()
}

// A typed date is a period of its own, so the buttons stop claiming one.
function onDateTyped() {
    state.period = 'custom'
    load()
}

async function load() {
    state.error = ''
    state.isLoading = true

    try {
        const response = await citizenInvoiceService.getReport({ from: state.from, to: state.to })
        state.report = { ...emptyReport(), ...(response?.data || {}) }
    } catch (error: any) {
        state.error = error?.message || ''
    } finally {
        state.isLoading = false
    }
}

async function exportCsv() {
    state.error = ''

    try {
        const blob = await citizenInvoiceService.exportReport({ from: state.from, to: state.to })

        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `fakturaer-${state.from}-${state.to}.csv`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch (error: any) {
        state.error = error?.message || ''
    }
}

onMounted(() => load())
</script>
