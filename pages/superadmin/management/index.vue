<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.dashboard.tabs.management') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.dashboard.tabs.management') }}
            </template>

            <div class="p-1 space-y-5">

                <ModulesSuperadminDashboardTab />

                <!-- Header -->
                <div>
                    <h1 class="text-[22px] font-bold text-[#1F2533]">
                        {{ $t('superadmin.dashboard.tabs.management') }}
                    </h1>
                    <p class="text-sm text-[#5C6478] mt-0.5">
                        {{ $t('superadmin.dashboard.management.subtitle') }}
                    </p>
                </div>

                <!-- Kørselsrate, sikret, aftalt og kundeafgang -->
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Kørselsraten, og hvor meget af den der faktisk opkræves.
                         Ét kort og ikke to: MRR og sikret MRR lå side om side og
                         viste 48.702 og 47.620 - to store tal der siger næsten det
                         samme, og som derfor begge blev læst som "omtrent MRR".
                         Forskellen er det interessante, så den står som forskel:
                         hvor meget der ikke kommer ind, og hvor mange aftaler det
                         er. CARR er udeladt; den er ARR ganget med det samme
                         forhold og tilføjede intet man kunne handle på. -->
                    <div v-if="state.recurringRevenue" class="co-stat-card" style="--accent:#2E9E33">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">{{ $t('superadmin.dashboard.adoption.mrr') }}</p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.mrr')"
                                        position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value text-[#2E9E33]">
                                    {{ formatAmount(state.recurringRevenue.mrr, 'DKK') }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.arr', { amount: formatAmount(state.recurringRevenue.arr, 'DKK') }) }}
                                </p>

                                <div v-if="state.recurringRevenue.cmrr !== undefined"
                                    class="mt-2 pt-2 border-t border-[#F0F1F4] flex items-center gap-1">
                                    <p class="co-stat-sub !mt-0"
                                        :class="notCollectingAmount > 0 ? 'text-[#CC3B2D]' : ''">
                                        {{ notCollectingAmount > 0
                                            ? $t('superadmin.dashboard.adoption.notCollectingAmount', {
                                                amount: formatAmount(notCollectingAmount, 'DKK'),
                                                count: state.recurringRevenue.agreements?.not_collecting ?? 0
                                            })
                                            : $t('superadmin.dashboard.adoption.allCollecting') }}
                                    </p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.cmrr')" position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#EDF7EE">
                                <Icon name="ph:chart-line-up" class="w-5 h-5 text-[#2E9E33]" />
                            </div>
                        </div>
                    </div>

                    <!-- Contracted: what the agreements are scheduled to bill -->
                    <div v-if="state.recurringRevenue?.contracted_next_12_months !== undefined" class="co-stat-card"
                        style="--accent:#42AED9">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">{{ $t('superadmin.dashboard.adoption.contracted') }}</p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.contracted')" position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value text-[#42AED9]">
                                    {{ formatAmount(state.recurringRevenue.contracted_next_12_months, 'DKK') }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.contractedThreeYears', { amount: formatAmount(state.recurringRevenue.contracted_next_36_months, 'DKK') }) }}
                                </p>
                                <NuxtLink to="/superadmin/analytics"
                                    class="co-stat-sub text-[#205E77] inline-flex items-center gap-1 hover:underline">
                                    {{ $t('superadmin.dashboard.adoption.seeForecast') }}
                                    <Icon name="ph:arrow-right" class="w-3 h-3" />
                                </NuxtLink>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#E8F6FC">
                                <Icon name="ph:calendar-check" class="w-5 h-5 text-[#42AED9]" />
                            </div>
                        </div>
                    </div>

                    <!-- Churn -->
                    <div v-if="state.churn" class="co-stat-card" style="--accent:#CC3B2D">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">
                                        {{ $t('superadmin.dashboard.adoption.churn', { days: state.churn.window_days }) }}
                                    </p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.churn')" position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value" :class="state.churn.churned > 0 ? 'text-[#CC3B2D]' : ''">
                                    {{ state.churn.rate === null ? '—' : `${state.churn.rate}%` }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.churnSub', {
                                        churned: state.churn.churned, base: state.churn.base
                                    }) }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#FFF0F0">
                                <Icon name="ph:user-minus" class="w-5 h-5 text-[#CC3B2D]" />
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Hvem pengene kommer fra.
                     En rangeret liste og ikke en graf: ti navngivne kunder med et
                     beløb læses hurtigere som tal, og en søjle pr. kunde ville
                     kræve at man slog navnet op for at vide hvem søjlen var. -->
                <div v-if="concentration" class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                    <div class="px-5 py-4 border-b border-[#EAECF0]">
                        <h2 class="text-[13px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.dashboard.management.concentration.title') }}
                        </h2>
                        <p class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.dashboard.management.concentration.hint', {
                                top: concentration.top_share,
                                largest: concentration.largest_share,
                                count: concentration.customer_count,
                            }) }}
                        </p>
                    </div>

                    <div v-if="!concentration.customers?.length"
                        class="px-5 py-8 text-center text-[13px] text-[#8891A4]">
                        {{ $t('superadmin.dashboard.management.concentration.empty') }}
                    </div>
                    <div v-else>
                        <NuxtLink v-for="(row, i) in concentration.customers" :key="i"
                            :to="`/superadmin/companies/${row.company_uuid}/license-overview`"
                            class="flex items-center gap-3 px-5 py-3 border-b border-[#F5F6F8] last:border-0 hover:bg-[#F9FAFB] transition-colors">
                            <span class="text-[11px] text-[#B4BBC7] w-4 shrink-0">{{ i + 1 }}</span>
                            <div class="min-w-0 flex-1">
                                <p class="text-[13px] font-medium text-[#1F2533] truncate">{{ row.company_name }}</p>
                                <!-- Andelen som en tynd streg: den gør rangordenen
                                     synlig uden at gøre listen til en graf. -->
                                <div class="h-1 bg-[#F0F1F4] rounded-full mt-1 overflow-hidden">
                                    <div class="h-full rounded-full"
                                        :style="`width:${Math.min(100, row.share)}%;background:#1C6E9C`"></div>
                                </div>
                            </div>
                            <div class="text-right shrink-0">
                                <p class="text-[13px] font-semibold text-[#1F2533]">
                                    {{ formatAmount(row.mrr, 'DKK') }}
                                </p>
                                <p class="text-[11px] text-[#8891A4]">{{ row.share }}%</p>
                            </div>
                        </NuxtLink>
                    </div>
                </div>

                <!-- Hvorfor kørselsraten bevægede sig.
                     Kundeafgang i hoveder siger ikke om en måned var god: mister
                     man sin største og vinder to små, ser det ud som vækst. Her
                     står bevægelsen i kroner, delt i de fire ting den består af.
                     Fortegnet bærer retningen, ikke farven alene. -->
                <div v-if="bridge" class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                    <h2 class="text-[13px] font-semibold text-[#1F2533]">
                        {{ $t('superadmin.dashboard.management.bridge.title') }}
                    </h2>

                    <p v-if="!bridge.available" class="text-[12px] text-[#8891A4] mt-2">
                        {{ bridge.recorded_since
                            ? $t('superadmin.dashboard.management.bridge.recordingSince', { date: formatDay(bridge.recorded_since) })
                            : $t('superadmin.dashboard.management.bridge.notRecordedYet') }}
                    </p>

                    <template v-else>
                        <p class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.dashboard.management.bridge.between', {
                                from: formatDay(bridge.from), to: formatDay(bridge.to)
                            }) }}
                        </p>

                        <dl class="mt-4 space-y-2 text-[13px]">
                            <div v-for="row in bridgeRows" :key="row.key"
                                class="flex items-baseline justify-between gap-4">
                                <dt class="text-[#5C6478]">
                                    {{ $t('superadmin.dashboard.management.bridge.' + row.key) }}
                                </dt>
                                <dd class="font-medium tabular-nums" :class="row.amount < 0 ? 'text-[#CC3B2D]' : 'text-[#2E9E33]'">
                                    {{ row.amount < 0 ? '−' : '+' }} {{ formatAmount(Math.abs(row.amount), 'DKK') }}
                                </dd>
                            </div>
                            <div class="flex items-baseline justify-between gap-4 border-t border-[#EAECF0] pt-2">
                                <dt class="font-semibold text-[#1F2533]">
                                    {{ $t('superadmin.dashboard.management.bridge.net') }}
                                </dt>
                                <dd class="font-bold tabular-nums"
                                    :class="bridge.net < 0 ? 'text-[#CC3B2D]' : 'text-[#2E9E33]'">
                                    {{ bridge.net < 0 ? '−' : '+' }} {{ formatAmount(Math.abs(bridge.net), 'DKK') }}
                                </dd>
                            </div>
                        </dl>

                        <div v-if="bridge.churned_customers?.length" class="mt-4 pt-3 border-t border-[#EAECF0]">
                            <p class="text-[11px] text-[#8891A4] mb-2">
                                {{ $t('superadmin.dashboard.management.bridge.whoLeft') }}
                            </p>
                            <NuxtLink v-for="(row, i) in bridge.churned_customers" :key="i"
                                :to="`/superadmin/companies/${row.company_uuid}/license-overview`"
                                class="flex items-center justify-between py-1.5 text-[12px] hover:underline">
                                <span class="text-[#1F2533] truncate">{{ row.company_name }}</span>
                                <span class="text-[#CC3B2D] font-medium shrink-0 ml-3">
                                    − {{ formatAmount(row.mrr, 'DKK') }}
                                </span>
                            </NuxtLink>
                        </div>
                    </template>
                </div>

                <!-- Faktureret i perioden -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <!-- Revenue -->
                    <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm">
                        <div class="flex items-center justify-between mb-3">
                            <h2 class="text-[13px] font-semibold text-[#1F2533]">
                                {{ $t('superadmin.dashboard.revenue.revenue') }}
                            </h2>
                        </div>
                        <div class="flex gap-1.5 mb-3">
                            <input type="date" v-model="state.revenueDateFrom"
                                class="text-xs border border-[#EAECF0] rounded-lg px-2 py-1.5 text-[#5C6478] bg-white outline-none focus:border-[#42AED9] flex-1 transition-colors"
                                @change="fetchOverview" />
                            <input type="date" v-model="state.revenueDateTo"
                                class="text-xs border border-[#EAECF0] rounded-lg px-2 py-1.5 text-[#5C6478] bg-white outline-none focus:border-[#42AED9] flex-1 transition-colors"
                                @change="fetchOverview" />
                        </div>
                        <p class="text-[24px] font-bold text-[#1F2533]">
                            {{ formatAmount(state.revenue, 'DKK') }}
                        </p>
                        <p class="text-[11px] text-[#8891A4] mt-0.5">
                            {{ $t('superadmin.dashboard.exclVat') }}
                        </p>
                    </div>
                </div>

            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dashboardService } from '@/components/api/superadmin/DashboardService'
import { useAmountFormatter } from '@/composables/amountFormatter'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()

const state = reactive({
    revenue: 0,
    recurringRevenue: null as any,
    churn: null as any,
    concentration: null as any,
    mrrBridge: null as any,
    // Måned til dato. Kortet stod før på i dag-til-i dag, hvilket er en periode
    // der næsten altid er tom, og et tomt omsætningskort ligner en stille måned
    // frem for en forkert indstilling. Det er samtidig den periode API'et selv
    // falder tilbage på, når der ingen datoer er med.
    revenueDateFrom: moment().startOf('month').format('YYYY-MM-DD'),
    revenueDateTo: moment().format('YYYY-MM-DD'),
    error: {} as any,
})

// Det der ikke kommer ind: kørselsraten minus den del der faktisk opkræves.
// Regnet her frem for i skabelonen, så tallet har et navn.
const concentration = computed(() => state.concentration)
const bridge = computed(() => state.mrrBridge)

// Rækkefølgen er den regnestykket læses i: hvad der kom til, og hvad der gik fra.
const bridgeRows = computed(() => [
    { key: 'new', amount: Number(bridge.value?.new ?? 0) },
    { key: 'expansion', amount: Number(bridge.value?.expansion ?? 0) },
    { key: 'contraction', amount: -Number(bridge.value?.contraction ?? 0) },
    { key: 'churned', amount: -Number(bridge.value?.churned ?? 0) },
])

function formatDay(value?: string | null) {
    return value ? moment(value).format('D. MMM YYYY') : '—'
}


const notCollectingAmount = computed(() => {
    const r = state.recurringRevenue
    if (!r || r.cmrr === undefined) return 0
    return Math.max(0, Number(r.mrr ?? 0) - Number(r.cmrr ?? 0))
})

onMounted(() => fetchOverview())

async function fetchOverview() {
    try {
        const response = await dashboardService.getManagementOverview({
            date: { start_date: state.revenueDateFrom, end_date: state.revenueDateTo }
        })
        if (response) {
            state.revenue = response?.data?.total_revenue ?? 0
            state.recurringRevenue = response?.data?.recurring_revenue ?? null
            state.churn = response?.data?.churn ?? null
            state.concentration = response?.data?.concentration ?? null
            state.mrrBridge = response?.data?.mrr_bridge ?? null
        }
    } catch (e: any) { state.error = e }
}
</script>

<style scoped>
.co-stat-card {
    background: white;
    border: 1px solid #EAECF0;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    position: relative;
    overflow: hidden;
}

.co-stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    border-radius: 12px 12px 0 0;
    background: var(--accent, #42AED9);
}

.co-stat-label {
    font-size: 10px;
    font-weight: 700;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.07em;
}

.co-stat-value {
    font-size: 28px;
    font-weight: 800;
    color: #1F2533;
    line-height: 1;
    margin-top: 6px;
}

.co-stat-sub {
    font-size: 11px;
    color: #8891A4;
    margin-top: 4px;
}
</style>
