<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.report.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.report.title') }}</template>

            <div class="p-1 space-y-5">

                <ModulesSuperadminDashboardTab />

                <!-- Uden adgang: sig det, frem for at tegne tomme grafer.
                     API'et afviser i forvejen, men en side fuld af nuller ligner
                     en forretning uden kunder frem for en lukket dør. -->
                <div v-if="!canViewReport"
                    class="bg-white border border-[#EAECF0] rounded-xl p-10 text-center">
                    <Icon name="ph:lock-simple" class="w-8 h-8 text-[#D5D9E2] mx-auto" />
                    <p class="text-[14px] font-semibold text-[#1F2533] mt-3">
                        {{ $t('superadmin.report.noAccess.title') }}
                    </p>
                    <p class="text-[12px] text-[#8891A4] mt-1">
                        {{ $t('superadmin.report.noAccess.hint') }}
                    </p>
                </div>

                <template v-else>
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

                <!-- Aftaletal: kontrakt-MRR/ARR som hovedtal, cash næste 12 mdr.,
                     backlog, udestående og bindinger der udløber. -->
                <ModulesSuperadminAgreementMetrics v-if="hasFinancials" :data="state.recurringRevenue" />

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

                                <!-- Hvor meget af totalen der er aftalt, og hvor meget der
                                     forudsætter at kunderne fornyer. Skrevet som tal og ikke
                                     kun tegnet, fordi den ravgule farve alene ikke er nok
                                     kontrast til at bære forskellen. -->
                                <div class="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 text-[12px]">
                                    <span class="flex items-center gap-1.5">
                                        <span class="w-2.5 h-2.5 rounded-sm" style="background:#1C6E9C"></span>
                                        <span class="text-[#5C6478]">{{ $t('superadmin.report.forecast.series.contracted') }}</span>
                                        <strong class="text-[#1F2533]">{{ formatAmount(state.forecast.contracted_total, 'DKK') }}</strong>
                                        <span class="text-[#8891A4]">({{ contractedShare }}%)</span>
                                    </span>
                                    <Tooltip :text="$t('superadmin.report.forecast.help.installments')" position="top" wrap>
                                        <span class="flex items-center gap-1.5">
                                            <span class="w-2.5 h-2.5 rounded-sm" style="background:#368F8B"></span>
                                            <span class="text-[#5C6478]">{{ $t('superadmin.report.forecast.series.installments') }}</span>
                                            <strong class="text-[#1F2533]">{{ formatAmount(bucketTotals.installments, 'DKK') }}</strong>
                                        </span>
                                    </Tooltip>
                                    <span class="flex items-center gap-1.5">
                                        <span class="w-2.5 h-2.5 rounded-sm" style="background:#E0A83D"></span>
                                        <span class="text-[#5C6478]">{{ $t('superadmin.report.forecast.series.assumed') }}</span>
                                        <strong class="text-[#1F2533]">{{ formatAmount(state.forecast.assumed_total, 'DKK') }}</strong>
                                    </span>
                                    <Tooltip :text="$t('superadmin.report.forecast.help.assumedRenewal')" position="top" wrap>
                                        <span class="flex items-center gap-1.5">
                                            <span class="w-2.5 h-2.5 rounded-sm" style="background:#F0CE8B"></span>
                                            <span class="text-[#5C6478]">{{ $t('superadmin.report.forecast.series.assumedRenewal') }}</span>
                                            <strong class="text-[#1F2533]">{{ formatAmount(bucketTotals.assumed_renewal, 'DKK') }}</strong>
                                        </span>
                                    </Tooltip>
                                </div>

                                <ClientOnly>
                                    <VChart :option="forecastOption" style="height: 300px; width: 100%;" autoresize
                                        @click="openRenewals" />
                                </ClientOnly>

                                <p v-if="!renewals.month" class="text-[11px] text-[#8891A4] mt-2 flex items-center gap-1.5">
                                    <Icon name="ph:cursor-click" class="w-3.5 h-3.5 flex-shrink-0" />
                                    {{ $t('superadmin.report.forecast.clickHint') }}
                                </p>

                                <!-- Den akkumulerede kurve, i sit eget plot. Den når
                                     millioner hvor en måned er titusinder, og delte den
                                     akse med søjlerne var søjlerne ulæselige. -->
                                <div class="mt-4 pt-4 border-t border-[#EAECF0]">
                                    <p class="text-[11px] text-[#8891A4] mb-1">
                                        {{ $t('superadmin.report.forecast.series.cumulative') }}
                                    </p>
                                    <ClientOnly>
                                        <VChart :option="forecastCumulativeOption"
                                            style="height: 140px; width: 100%;" autoresize />
                                    </ClientOnly>
                                </div>

                                <!-- Hvem søjlen består af. Prognosen siger hvor meget;
                                     salgsarbejdet har brug for hvem, så der kan arbejdes
                                     med fornyelsen inden den er der. -->
                                <div v-if="renewals.month"
                                    class="mt-4 border border-[#EAECF0] rounded-xl overflow-hidden">
                                    <div class="flex items-center justify-between px-4 py-3 bg-[#F9FAFB] border-b border-[#EAECF0]">
                                        <div>
                                            <p class="text-[13px] font-semibold text-[#1F2533]">
                                                {{ $t('superadmin.report.forecast.renewalsIn', { month: renewalsMonthLabel }) }}
                                            </p>
                                            <p class="text-[11px] text-[#8891A4]">
                                                {{ $t('superadmin.report.forecast.renewalsCount', { count: renewals.renewals.length }) }}
                                                · {{ formatAmount(renewals.renewals_total, 'DKK') }}
                                            </p>
                                        </div>
                                        <button type="button" @click="renewals.month = ''"
                                            class="text-[#8891A4] hover:text-[#1F2533]">
                                            <Icon name="ph:x" class="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div v-if="renewals.isLoading" class="flex justify-center py-8">
                                        <Icon name="ph:spinner" class="w-5 h-5 text-[#42AED9] animate-spin" />
                                    </div>
                                    <p v-else-if="!renewals.renewals.length"
                                        class="px-4 py-8 text-center text-[13px] text-[#8891A4]">
                                        {{ $t('superadmin.report.forecast.noRenewals') }}
                                    </p>
                                    <div v-else>
                                        <NuxtLink v-for="(row, i) in renewals.renewals" :key="i"
                                            :to="`/superadmin/companies/${row.company_uuid}/license-overview`"
                                            class="flex items-center justify-between px-4 py-3 border-b border-[#F5F6F8] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                                            <div class="min-w-0">
                                                <p class="text-[13px] font-medium text-[#1F2533] truncate">
                                                    {{ row.company_name }}
                                                </p>
                                                <p class="text-[11px] text-[#8891A4]">
                                                    {{ formatDateToReadable(row.renews_at) }}
                                                </p>
                                            </div>
                                            <span class="text-[13px] font-semibold text-[#1F2533] shrink-0 ml-3">
                                                {{ formatAmount(row.amount, 'DKK') }}
                                            </span>
                                        </NuxtLink>
                                    </div>
                                </div>

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
                </template>

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { analyticsService } from '@/components/api/superadmin/AnalyticsService'
import { dashboardService } from '@/components/api/superadmin/DashboardService'
import { forecastBucketTotals } from '@/composables/agreements'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { can } = usePermissions()

// Rapporten ligger bag samme rettighed som Ledelse-fanen.
const canViewReport = computed(() => can('view_management'))

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
    // `recurring_revenue` from the management overview: the agreement figures.
    recurringRevenue: null as any,
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

// Totals of the four buckets over the chosen horizon. `installments` and
// `assumed_renewal` are per-month fields next to `contracted` and `assumed`.
const bucketTotals = computed(() => forecastBucketTotals(forecastMonths.value))

/** The first twelve months of the horizon, whatever horizon is selected. */
const forecastNextTwelveMonths = computed(() =>
    forecastMonths.value.slice(0, 12).reduce((sum: number, month: any) => sum + (month.total ?? 0), 0)
)

const forecastRenewalTotal = computed(() =>
    forecastMonths.value.reduce((sum: number, month: any) => sum + (month.renewals ?? 0), 0)
)

const renewals = reactive({
    month: '',
    renewals: [] as any[],
    renewals_total: 0,
    isLoading: false,
})

const renewalsMonthLabel = computed(() =>
    renewals.month ? moment(renewals.month + '-01').format('MMMM YYYY') : ''
)

/**
 * Et klik på en søjle åbner de kunder den består af.
 *
 * Begge segmenter åbner den samme måned: opdelingen i aftalt og forudsat er
 * en egenskab ved kronerne, ikke ved kunderne, så det ville være vilkårligt
 * hvilket af de to der måtte klikkes på. `dataIndex` peger ind i de samme
 * måneder som grafen er tegnet af, så der spørges på måneden og ikke på
 * etiketten under søjlen.
 */
async function openRenewals(event: any) {
    if (event?.componentType !== 'series' || event?.seriesType !== 'bar') return

    const month = forecastMonths.value[event.dataIndex]?.month
    if (!month) return

    renewals.month = month
    renewals.isLoading = true
    renewals.renewals = []
    renewals.renewals_total = 0

    try {
        const response = await analyticsService.getRenewals(month)
        renewals.renewals = response?.renewals ?? []
        renewals.renewals_total = response?.renewals_total ?? 0
    } catch (_) {
        renewals.renewals = []
    }

    renewals.isLoading = false
}

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
            name: t('superadmin.report.forecast.series.contracted'),
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#1C6E9C', borderColor: '#FFFFFF', borderWidth: 2 },
            data: forecastMonths.value.map((month: any) => month.contracted),
        },
        {
            name: t('superadmin.report.forecast.series.installments'),
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#368F8B', borderColor: '#FFFFFF', borderWidth: 2 },
            data: forecastMonths.value.map((month: any) => month.installments ?? 0),
        },
        {
            name: t('superadmin.report.forecast.series.assumed'),
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#E0A83D', borderColor: '#FFFFFF', borderWidth: 2 },
            // Skravering oveni farven: den del der hviler på en antagelse skal
            // også kunne ses i sort/hvid, på en projektor og af en farveblind.
            // Farven alene bærer ikke den skelnen.
            data: forecastMonths.value.map((month: any) => month.assumed),
            decal: { symbol: 'rect', dashArrayX: [1, 0], dashArrayY: [4, 3], rotation: Math.PI / 4, color: 'rgba(255,255,255,0.55)' },
        },
        {
            // Agreements that auto-renew past ends_on. An assumption, so it gets
            // its own hatching (wider stripes) and colour next to `assumed`.
            name: t('superadmin.report.forecast.series.assumedRenewal'),
            type: 'bar',
            stack: 'total',
            itemStyle: { color: '#F0CE8B', borderColor: '#FFFFFF', borderWidth: 2 },
            data: forecastMonths.value.map((month: any) => month.assumed_renewal ?? 0),
            decal: { symbol: 'rect', dashArrayX: [1, 0], dashArrayY: [8, 4], rotation: -Math.PI / 4, color: 'rgba(31,37,51,0.25)' },
        },
    ],
}))

/**
 * Den akkumulerede kurve har sit eget plot.
 *
 * Den lå oveni søjlerne på samme akse, og den når 1,7 mio. hvor en måned er
 * omkring 50.000 - så søjlerne blev presset ned i under tre procent af højden
 * og var ikke til at læse. To størrelsesordener hører ikke i samme plot, og en
 * dobbeltakse ville kun have skjult problemet bag to skalaer ingen sammenligner
 * rigtigt.
 */
// Hvor stor en andel af prognosen der hviler på aftaler der løber. Et enkelt
// tal, fordi det er dét man vil vide når nogen spørger hvor sikker prognosen er.
const contractedShare = computed(() => {
    const total = Number(state.forecast?.total ?? 0)
    if (!total) return 0
    // Scheduled installments are contracted money too.
    const contracted = Number(state.forecast?.contracted_total ?? 0) + bucketTotals.value.installments
    return Math.min(100, Math.round((contracted / total) * 100))
})

const forecastCumulativeOption = computed(() => ({
    tooltip: {
        trigger: 'axis',
        valueFormatter: (value: any) => formatAmount(value, 'DKK'),
    },
    grid: { left: 70, right: 20, top: 16, bottom: 30 },
    xAxis: {
        type: 'category',
        data: forecastMonths.value.map((month: any) => moment(month.month + '-01').format('MMM YY')),
        axisLabel: { show: false },
        axisTick: { show: false },
    },
    yAxis: { type: 'value', axisLabel: { color: '#5C6478' } },
    series: [
        {
            name: t('superadmin.report.forecast.series.cumulative'),
            type: 'line',
            smooth: true,
            showSymbol: false,
            itemStyle: { color: '#205E77' },
            lineStyle: { width: 2 },
            areaStyle: { color: 'rgba(32,94,119,0.08)' },
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
    fetchAgreementFigures()
})

async function fetchAgreementFigures() {
    try {
        const response = await dashboardService.getManagementOverview({})
        state.recurringRevenue = response?.data?.recurring_revenue ?? null
    } catch (_) {
        // Behind a different permission than the report: no figures, no error.
        state.recurringRevenue = null
    }
}

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
