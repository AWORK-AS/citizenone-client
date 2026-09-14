<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.report.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.report.title') }}</template>

            <div class="p-1 space-y-5">

                <ModulesSuperadminDashboardTab />

                <!-- Header + period controls -->
                <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <h1 class="text-[22px] font-bold text-[#1F2533]">{{ $t('superadmin.report.title') }}</h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">{{ $t('superadmin.report.subtitle') }}</p>
                    </div>

                    <div class="flex flex-wrap items-end gap-3">
                        <!-- Quick ranges -->
                        <div class="flex items-center gap-1 bg-white border border-[#EAECF0] rounded-lg p-1">
                            <button v-for="preset in presets" :key="preset.key"
                                class="px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                                :class="state.activePreset === preset.key
                                    ? 'bg-[#205E77] text-white'
                                    : 'text-[#5C6478] hover:bg-[#F5F6F8]'"
                                @click="applyPreset(preset.key)">
                                {{ $t(`superadmin.report.presets.${preset.key}`) }}
                            </button>
                        </div>

                        <!-- Date range -->
                        <div class="flex items-end gap-2">
                            <label class="flex flex-col gap-1">
                                <span class="text-[11px] font-semibold text-[#8891A4] uppercase tracking-wide">
                                    {{ $t('superadmin.report.from') }}
                                </span>
                                <input type="date" v-model="state.from" @change="onRangeChanged"
                                    class="border border-[#EAECF0] rounded-lg px-2.5 py-1.5 text-[13px] text-[#1F2533]" />
                            </label>
                            <label class="flex flex-col gap-1">
                                <span class="text-[11px] font-semibold text-[#8891A4] uppercase tracking-wide">
                                    {{ $t('superadmin.report.to') }}
                                </span>
                                <input type="date" v-model="state.to" @change="onRangeChanged"
                                    class="border border-[#EAECF0] rounded-lg px-2.5 py-1.5 text-[13px] text-[#1F2533]" />
                            </label>
                        </div>

                        <!-- Grouping -->
                        <div class="flex items-center gap-1 bg-white border border-[#EAECF0] rounded-lg p-1">
                            <button v-for="option in granularities" :key="option"
                                class="px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                                :class="state.granularity === option
                                    ? 'bg-[#205E77] text-white'
                                    : 'text-[#5C6478] hover:bg-[#F5F6F8]'"
                                @click="setGranularity(option)">
                                {{ $t(`superadmin.report.granularity.${option}`) }}
                            </button>
                        </div>
                    </div>
                </div>

                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Totals for the chosen range -->
                <div class="grid grid-cols-2 gap-4"
                    :class="hasFinancials ? 'lg:grid-cols-5' : 'lg:grid-cols-4'">
                    <div v-for="card in totalCards" :key="card.key"
                        class="bg-white border border-[#EAECF0] rounded-xl shadow-sm p-4 relative overflow-hidden">
                        <span class="absolute inset-x-0 top-0 h-[3px]" :style="`background:${card.accent}`"></span>
                        <p class="text-[10px] font-bold text-[#8891A4] uppercase tracking-[0.07em]">{{ card.label }}</p>
                        <p class="text-[28px] font-extrabold leading-none mt-1.5" :class="card.tone">{{ card.value }}</p>
                    </div>
                </div>

                <div v-if="state.isLoading" class="flex justify-center py-16">
                    <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                </div>

                <template v-else>
                    <!-- Customers -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm p-5">
                        <h2 class="text-[13px] font-semibold text-[#1F2533]">{{ $t('superadmin.report.charts.customers') }}</h2>
                        <p class="text-[11px] text-[#8891A4] mt-0.5 mb-3">{{ $t('superadmin.report.charts.customersHint') }}</p>
                        <ClientOnly>
                            <VChart :option="customersOption" style="height: 320px; width: 100%;" autoresize />
                        </ClientOnly>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <!-- Revenue -->
                        <div v-if="hasFinancials" class="bg-white border border-[#EAECF0] rounded-xl shadow-sm p-5">
                            <h2 class="text-[13px] font-semibold text-[#1F2533]">{{ $t('superadmin.report.charts.revenue') }}</h2>
                            <p class="text-[11px] text-[#8891A4] mt-0.5 mb-3">{{ $t('superadmin.report.charts.revenueHint') }}</p>
                            <ClientOnly>
                                <VChart :option="revenueOption" style="height: 280px; width: 100%;" autoresize />
                            </ClientOnly>
                        </div>

                        <!-- MRR -->
                        <div v-if="hasFinancials" class="bg-white border border-[#EAECF0] rounded-xl shadow-sm p-5">
                            <h2 class="text-[13px] font-semibold text-[#1F2533]">{{ $t('superadmin.report.charts.mrr') }}</h2>
                            <p class="text-[11px] text-[#8891A4] mt-0.5 mb-3">
                                {{ state.mrrRecordedSince
                                    ? $t('superadmin.report.charts.mrrSince', { date: formatDay(state.mrrRecordedSince) })
                                    : $t('superadmin.report.charts.mrrNotRecorded') }}
                            </p>
                            <ClientOnly>
                                <VChart v-if="hasMrrData" :option="mrrOption" style="height: 280px; width: 100%;" autoresize />
                            </ClientOnly>
                            <div v-if="!hasMrrData" class="flex flex-col items-center gap-2 py-12 text-[#8891A4]">
                                <Icon name="ph:chart-line" class="w-10 h-10 opacity-30" />
                                <p class="text-sm text-center max-w-sm">{{ $t('superadmin.report.charts.mrrEmpty') }}</p>
                            </div>
                        </div>

                        <!-- Revenue forecast: forward, not backward -->
                        <div v-if="hasFinancials" class="bg-white border border-[#EAECF0] rounded-xl shadow-sm p-5 lg:col-span-2">
                            <div class="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h2 class="text-[13px] font-semibold text-[#1F2533]">
                                        {{ $t('superadmin.report.forecast.title') }}
                                    </h2>
                                    <p class="text-[11px] text-[#8891A4] mt-0.5">
                                        {{ $t('superadmin.report.forecast.hint') }}
                                    </p>
                                </div>
                                <div class="inline-flex rounded-lg border border-[#D5D9E2] overflow-hidden bg-white">
                                    <button v-for="years in [1, 3, 5]" :key="years" @click="selectForecastYears(years)"
                                        :class="[
                                            'px-3 py-1.5 text-[12px] font-medium transition-colors',
                                            state.forecastYears === years
                                                ? 'bg-[#205E77] text-white'
                                                : 'text-[#5C6478] hover:bg-[#F5F6F8]',
                                        ]">
                                        {{ $t('superadmin.report.forecast.years', { count: years }) }}
                                    </button>
                                </div>
                            </div>

                            <div v-if="state.isForecastLoading" class="flex justify-center py-16">
                                <Icon name="ph:spinner" class="w-6 h-6 text-[#42AED9] animate-spin" />
                            </div>

                            <template v-else-if="state.forecast">
                                <!-- The three numbers somebody came for, before the chart. -->
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 mb-1">
                                    <div class="rounded-lg bg-[#F9FAFB] border border-[#EAECF0] p-3">
                                        <p class="text-[11px] text-[#8891A4]">{{ $t('superadmin.report.forecast.totalLabel', { count: state.forecastYears }) }}</p>
                                        <p class="text-[18px] font-semibold text-[#1F2533]">
                                            {{ formatAmount(state.forecast.total, 'DKK') }}
                                        </p>
                                    </div>
                                    <div class="rounded-lg bg-[#F9FAFB] border border-[#EAECF0] p-3">
                                        <p class="text-[11px] text-[#8891A4]">{{ $t('superadmin.report.forecast.nextTwelve') }}</p>
                                        <p class="text-[18px] font-semibold text-[#1F2533]">
                                            {{ formatAmount(forecastNextTwelveMonths, 'DKK') }}
                                        </p>
                                    </div>
                                    <div class="rounded-lg bg-[#F9FAFB] border border-[#EAECF0] p-3">
                                        <p class="text-[11px] text-[#8891A4]">{{ $t('superadmin.report.forecast.renewalShare') }}</p>
                                        <p class="text-[18px] font-semibold text-[#1F2533]">
                                            {{ formatAmount(forecastRenewalTotal, 'DKK') }}
                                        </p>
                                    </div>
                                </div>

                                <ClientOnly>
                                    <VChart :option="forecastOption" style="height: 300px; width: 100%;" autoresize />
                                </ClientOnly>

                                <div class="flex flex-wrap gap-2 mt-3">
                                    <span v-for="year in state.forecast.by_year" :key="year.year"
                                        class="text-[12px] text-[#5C6478] bg-[#F5F6F8] rounded-lg px-2.5 py-1">
                                        {{ year.year }}: <strong class="text-[#1F2533]">{{ formatAmount(year.total, 'DKK') }}</strong>
                                    </span>
                                </div>

                                <!-- The assumption, on the screen and not only in the code. -->
                                <p class="text-[11px] text-[#8891A4] mt-3 flex items-start gap-1.5">
                                    <Icon name="ph:info" class="w-3.5 h-3.5 mt-[1px] flex-shrink-0" />
                                    {{ $t('superadmin.report.forecast.assumption') }}
                                </p>
                            </template>
                        </div>

                        <!-- New users -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm p-5"
                            :class="hasFinancials ? 'lg:col-span-2' : ''">
                            <h2 class="text-[13px] font-semibold text-[#1F2533]">{{ $t('superadmin.report.charts.users') }}</h2>
                            <p class="text-[11px] text-[#8891A4] mt-0.5 mb-3">{{ $t('superadmin.report.charts.usersHint') }}</p>
                            <ClientOnly>
                                <VChart :option="usersOption" style="height: 260px; width: 100%;" autoresize />
                            </ClientOnly>
                        </div>
                    </div>
                </template>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { analyticsService } from '@/components/api/superadmin/AnalyticsService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { t } = useI18n()

const granularities = ['day', 'week', 'month', 'quarter', 'year']
const presets = [
    { key: 'thisQuarter' },
    { key: 'thisYear' },
    { key: 'lastTwelveMonths' },
    { key: 'lastYear' },
]

const state = reactive({
    from: moment().subtract(11, 'months').startOf('month').format('YYYY-MM-DD'),
    to: moment().format('YYYY-MM-DD'),
    granularity: 'month',
    activePreset: 'lastTwelveMonths' as string | null,
    buckets: [] as any[],
    totals: null as any,
    mrrRecordedSince: null as string | null,
    isLoading: false,
    error: {} as Error,
    // The forecast is its own request: it looks forward, has its own horizon,
    // and must not be refetched every time somebody moves the date range.
    forecast: null as any,
    forecastYears: 3,
    isForecastLoading: false,
})

const hasFinancials = computed(() => state.totals?.revenue !== null && state.totals?.revenue !== undefined)

const totalCards = computed(() => {
    const totals = state.totals ?? {}
    const cards = [
        { key: 'new', accent: '#2E9E33', label: t('superadmin.report.totals.newCompanies'), value: totals.new_companies ?? 0, tone: 'text-[#2E9E33]' },
        {
            key: 'churned', accent: '#CC3B2D', label: t('superadmin.report.totals.churnedCompanies'),
            value: totals.churned_companies ?? 0,
            tone: (totals.churned_companies ?? 0) > 0 ? 'text-[#CC3B2D]' : 'text-[#1F2533]',
        },
        { key: 'net', accent: '#205E77', label: t('superadmin.report.totals.netCompanies'), value: formatSigned(totals.net_companies ?? 0), tone: 'text-[#1F2533]' },
        { key: 'users', accent: '#368F8B', label: t('superadmin.report.totals.newUsers'), value: totals.new_users ?? 0, tone: 'text-[#1F2533]' },
    ]

    if (hasFinancials.value) {
        cards.push({
            key: 'revenue', accent: '#42AED9', label: t('superadmin.report.totals.revenue'),
            value: formatAmount(totals.revenue, 'DKK'), tone: 'text-[#1F2533]',
        })
    }

    return cards
})
const hasMrrData = computed(() => state.buckets.some((b: any) => b.mrr !== null && b.mrr !== undefined))

const forecastMonths = computed<any[]>(() => state.forecast?.months ?? [])

/** The first twelve months of the horizon, whatever horizon is selected. */
const forecastNextTwelveMonths = computed(() =>
    forecastMonths.value.slice(0, 12).reduce((sum: number, month: any) => sum + (month.total ?? 0), 0)
)

const forecastRenewalTotal = computed(() =>
    forecastMonths.value.reduce((sum: number, month: any) => sum + (month.renewals ?? 0), 0)
)

/**
 * Yearly renewals are stacked separately from the monthly charges: a month that
 * looks like a spike is a month with renewals in it, and the chart should say
 * so rather than leave somebody to guess.
 */
const forecastOption = computed(() => ({
    tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        valueFormatter: (value: any) => formatAmount(value, 'DKK'),
    },
    legend: { bottom: 0, icon: 'roundRect' },
    grid: { left: 70, right: 20, top: 20, bottom: 60 },
    xAxis: {
        type: 'category',
        data: forecastMonths.value.map((month: any) => moment(month.month + '-01').format('MMM YY')),
        axisLabel: { rotate: forecastMonths.value.length > 14 ? 45 : 0, color: '#5C6478' },
    },
    yAxis: { type: 'value', axisLabel: { color: '#5C6478' } },
    series: [
        {
            name: t('superadmin.report.forecast.series.recurring'),
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#42AED9' },
            data: forecastMonths.value.map((month: any) => month.recurring),
        },
        {
            name: t('superadmin.report.forecast.series.renewals'),
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#2E9E33' },
            data: forecastMonths.value.map((month: any) => month.renewals),
        },
        {
            name: t('superadmin.report.forecast.series.cumulative'),
            type: 'line',
            yAxisIndex: 0,
            smooth: true,
            itemStyle: { color: '#205E77' },
            lineStyle: { width: 2 },
            data: forecastMonths.value.map((month: any) => month.cumulative),
        },
    ],
}))

// Bucket keys are stable ids from the backend ("2026-Q3"); the axis shows
// something a person would say out loud.
const labels = computed(() => state.buckets.map((bucket: any) => {
    const start = moment(bucket.starts_on)
    switch (state.granularity) {
        case 'day': return start.format('D. MMM')
        case 'week': return start.format('[U]W YYYY')
        case 'quarter': return `Q${start.quarter()} ${start.format('YYYY')}`
        case 'year': return start.format('YYYY')
        default: return start.format('MMM YYYY')
    }
}))

const baseOption = (extra: any) => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 60, right: 20, top: 30, bottom: 60 },
    xAxis: {
        type: 'category',
        data: labels.value,
        axisLabel: { rotate: labels.value.length > 8 ? 35 : 0, color: '#5C6478' },
    },
    yAxis: { type: 'value', axisLabel: { color: '#5C6478' } },
    ...extra,
})

const customersOption = computed(() => baseOption({
    legend: { bottom: 0, icon: 'roundRect' },
    series: [
        {
            name: t('superadmin.report.series.newCompanies'),
            type: 'bar',
            itemStyle: { color: '#2E9E33' },
            data: state.buckets.map((b: any) => b.new_companies),
        },
        {
            name: t('superadmin.report.series.churnedCompanies'),
            type: 'bar',
            itemStyle: { color: '#CC3B2D' },
            data: state.buckets.map((b: any) => b.churned_companies),
        },
        {
            name: t('superadmin.report.series.netCompanies'),
            type: 'line',
            smooth: true,
            itemStyle: { color: '#205E77' },
            lineStyle: { width: 2 },
            data: state.buckets.map((b: any) => b.net_companies),
        },
    ],
}))

const revenueOption = computed(() => baseOption({
    tooltip: {
        trigger: 'axis',
        valueFormatter: (value: any) => formatAmount(value, 'DKK'),
    },
    series: [{
        name: t('superadmin.report.series.revenue'),
        type: 'bar',
        itemStyle: { color: '#42AED9' },
        data: state.buckets.map((b: any) => b.revenue ?? 0),
    }],
}))

const mrrOption = computed(() => baseOption({
    tooltip: {
        trigger: 'axis',
        valueFormatter: (value: any) => formatAmount(value, 'DKK'),
    },
    series: [{
        name: t('superadmin.report.series.mrr'),
        type: 'line',
        smooth: true,
        // Buckets before recording started stay null, so the line starts where
        // the data does instead of climbing out of a fake zero.
        connectNulls: false,
        itemStyle: { color: '#2E9E33' },
        areaStyle: { opacity: 0.08 },
        data: state.buckets.map((b: any) => b.mrr),
    }],
}))

const usersOption = computed(() => baseOption({
    series: [{
        name: t('superadmin.report.series.newUsers'),
        type: 'bar',
        itemStyle: { color: '#368F8B' },
        data: state.buckets.map((b: any) => b.new_users),
    }],
}))

function formatSigned(value: number) {
    return value > 0 ? `+${value}` : String(value)
}

function formatDay(value: string) {
    return moment(value).format('D. MMM YYYY')
}

function applyPreset(key: string) {
    const now = moment()
    switch (key) {
        case 'thisQuarter':
            state.from = now.clone().startOf('quarter').format('YYYY-MM-DD')
            state.to = now.format('YYYY-MM-DD')
            state.granularity = 'week'
            break
        case 'thisYear':
            state.from = now.clone().startOf('year').format('YYYY-MM-DD')
            state.to = now.format('YYYY-MM-DD')
            state.granularity = 'month'
            break
        case 'lastYear':
            state.from = now.clone().subtract(1, 'year').startOf('year').format('YYYY-MM-DD')
            state.to = now.clone().subtract(1, 'year').endOf('year').format('YYYY-MM-DD')
            state.granularity = 'quarter'
            break
        default:
            state.from = now.clone().subtract(11, 'months').startOf('month').format('YYYY-MM-DD')
            state.to = now.format('YYYY-MM-DD')
            state.granularity = 'month'
    }
    state.activePreset = key
    fetchTrends()
}

function setGranularity(value: string) {
    state.granularity = value
    fetchTrends()
}

function onRangeChanged() {
    // Hand-picked dates are no longer one of the presets.
    state.activePreset = null
    fetchTrends()
}

onMounted(() => {
    fetchTrends()
    fetchForecast()
})

function selectForecastYears(years: number) {
    if (state.forecastYears === years) return

    state.forecastYears = years
    fetchForecast()
}

async function fetchForecast() {
    state.isForecastLoading = true
    try {
        state.forecast = await analyticsService.getRevenueForecast(state.forecastYears)
    } catch (error: any) {
        // A superadmin without `view_financials` gets a 403 here, and the whole
        // card is behind the same condition as the rest of the money on this
        // page - so there is nothing to say and nothing to break.
        state.forecast = null
    }
    state.isForecastLoading = false
}

async function fetchTrends() {
    state.error = {}
    state.isLoading = true
    try {
        const response = await analyticsService.getTrends({
            from: state.from,
            to: state.to,
            granularity: state.granularity,
        })
        if (response) {
            state.buckets = response.buckets ?? []
            state.totals = response.totals ?? null
            state.mrrRecordedSince = response.mrr_recorded_since ?? null
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
