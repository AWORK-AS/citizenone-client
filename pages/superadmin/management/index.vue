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
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <!-- MRR / ARR -->
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
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#EDF7EE">
                                <Icon name="ph:chart-line-up" class="w-5 h-5 text-[#2E9E33]" />
                            </div>
                        </div>
                    </div>

                    <!-- Committed: the part of the run rate that is collecting -->
                    <div v-if="state.recurringRevenue?.cmrr !== undefined" class="co-stat-card" style="--accent:#205E77">
                        <div class="flex items-start justify-between">
                            <div>
                                <div class="flex items-center gap-1">
                                    <p class="co-stat-label">{{ $t('superadmin.dashboard.adoption.cmrr') }}</p>
                                    <Tooltip :text="$t('superadmin.dashboard.adoption.help.cmrr')" position="bottom" wrap>
                                        <Icon name="ph:info" class="w-3.5 h-3.5 text-[#B4BBC7] hover:text-[#5C6478]" />
                                    </Tooltip>
                                </div>
                                <p class="co-stat-value text-[#205E77]">
                                    {{ formatAmount(state.recurringRevenue.cmrr, 'DKK') }}
                                </p>
                                <p class="co-stat-sub">
                                    {{ $t('superadmin.dashboard.adoption.carr', { amount: formatAmount(state.recurringRevenue.carr, 'DKK') }) }}
                                </p>
                                <p v-if="state.recurringRevenue.agreements?.not_collecting" class="co-stat-sub text-[#CC3B2D]">
                                    {{ $t('superadmin.dashboard.adoption.notCollecting', { count: state.recurringRevenue.agreements.not_collecting }) }}
                                </p>
                            </div>
                            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style="background:#E4F1F6">
                                <Icon name="ph:shield-check" class="w-5 h-5 text-[#205E77]" />
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
    // Måned til dato. Kortet stod før på i dag-til-i dag, hvilket er en periode
    // der næsten altid er tom, og et tomt omsætningskort ligner en stille måned
    // frem for en forkert indstilling. Det er samtidig den periode API'et selv
    // falder tilbage på, når der ingen datoer er med.
    revenueDateFrom: moment().startOf('month').format('YYYY-MM-DD'),
    revenueDateTo: moment().format('YYYY-MM-DD'),
    error: {} as any,
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
