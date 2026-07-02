<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.revenue.report') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('employment.revenue.report') }}</template>

            <div class="p-1">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Date range filter -->
                <div class="bg-white border border-[#EAECF0] rounded-xl p-5 shadow-sm mb-5">
                    <div class="flex flex-wrap items-end gap-4">
                        <div class="space-y-1">
                            <FormLabel :label="$t('employment.revenue.fromDate')" />
                            <FormDateField id="from_date" name="from_date"
                                :placeholder="$t('employment.revenue.fromDate')" v-model="state.filter.from_date" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel :label="$t('employment.revenue.toDate')" />
                            <FormDateField id="to_date" name="to_date" :placeholder="$t('employment.revenue.toDate')"
                                v-model="state.filter.to_date" />
                        </div>
                        <FormButton buttonStyle="primary" @click="fetchReport" :disabled="state.isLoading">
                            <Icon name="ph:chart-bar" class="w-4 h-4" />
                            {{ $t('employment.revenue.generate') }}
                        </FormButton>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <!-- Prompt state -->
                    <div v-if="!state.hasFetched"
                        class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:chart-bar" class="w-12 h-12 text-[#8891A4] opacity-40 mx-auto mb-3" />
                        <p class="text-[#8891A4] text-sm">{{ $t('employment.billing.selectPeriod') }}</p>
                    </div>

                    <div v-else-if="!state.rows.length"
                        class="bg-white border border-[#EAECF0] rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:chart-bar" class="w-12 h-12 text-[#8891A4] opacity-40 mx-auto mb-3" />
                        <p class="text-[#8891A4] text-sm">{{ $t('employment.revenue.noData') }}</p>
                    </div>

                    <!-- Summary cards -->
                    <div v-else>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                                <p class="text-xs text-[#8891A4] uppercase tracking-wide">
                                    {{ $t('employment.revenue.totalRevenue') }}
                                </p>
                                <p class="text-2xl font-bold text-[#1F2533] mt-1">
                                    {{ formatAmount(totals.revenue) }}
                                </p>
                            </div>
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                                <p class="text-xs text-[#8891A4] uppercase tracking-wide">
                                    {{ $t('employment.revenue.weeklyBilling') }}
                                </p>
                                <p class="text-2xl font-bold text-[#205E77] mt-1">
                                    {{ formatAmount(totals.weekly) }}
                                </p>
                            </div>
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                                <p class="text-xs text-[#8891A4] uppercase tracking-wide">
                                    {{ $t('employment.revenue.hourlyBilling') }}
                                </p>
                                <p class="text-2xl font-bold text-[#368F8B] mt-1">
                                    {{ formatAmount(totals.hourly) }}
                                </p>
                            </div>
                            <div class="bg-white border border-[#EAECF0] rounded-xl p-4 shadow-sm">
                                <p class="text-xs text-[#8891A4] uppercase tracking-wide">
                                    {{ $t('employment.revenue.bonuses') }}
                                </p>
                                <p class="text-2xl font-bold text-[#D4900A] mt-1">
                                    {{ formatAmount(totals.bonuses) }}
                                </p>
                            </div>
                        </div>

                        <!-- Coordinator economy: contract price split across primary/secondary -->
                        <div v-if="state.economy.coordinators?.length"
                            class="bg-white border border-[#EAECF0] rounded-xl shadow-sm p-5 mb-5">
                            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                                <h3 class="text-sm font-semibold text-[#1F2533]">
                                    {{ $t('employment.economy.coordinatorSplit') }}
                                </h3>
                                <div class="flex items-center gap-5 text-sm">
                                    <span class="text-[#8891A4]">{{ $t('employment.economy.allocatedRevenue') }}:
                                        <span class="font-bold text-[#1F2533]">{{ formatAmount(state.economy.total_revenue) }}</span>
                                    </span>
                                    <span class="text-[#8891A4]">{{ $t('employment.economy.interventions') }}:
                                        <span class="font-bold text-[#1F2533]">{{ state.economy.case_count }}</span>
                                    </span>
                                </div>
                            </div>
                            <ClientOnly>
                                <VChart :option="economyChartOption" style="height: 320px; width: 100%;" autoresize />
                            </ClientOnly>
                        </div>

                        <!-- Consultant table -->
                        <div class="bg-white border border-[#EAECF0] rounded-xl shadow-sm overflow-hidden">
                            <table class="w-full">
                                <thead>
                                    <tr class="bg-[#F9FAFB] border-b border-[#EAECF0]">
                                        <th class="co-th">{{ $t('employment.revenue.consultant') }}</th>
                                        <th class="co-th">{{ $t('employment.revenue.citizens') }}</th>
                                        <th class="co-th">{{ $t('employment.revenue.weeklyBilling') }}</th>
                                        <th class="co-th">{{ $t('employment.revenue.hourlyBilling') }}</th>
                                        <th class="co-th">{{ $t('employment.revenue.bonuses') }}</th>
                                        <th class="co-th">{{ $t('employment.revenue.totalRevenue') }}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in state.rows" :key="row.consultant_uuid ?? row.consultant_name"
                                        class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                        <td class="co-td">
                                            <div class="flex items-center gap-2.5">
                                                <div class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                                                    :style="`background:${avatarColor(row.consultant_name)}`">
                                                    {{ initials(row.consultant_name) }}
                                                </div>
                                                <span class="text-[13px] font-medium text-[#1F2533]">
                                                    {{ row.consultant_name }}
                                                </span>
                                            </div>
                                        </td>
                                        <td class="co-td text-[13px] text-[#5C6478]">
                                            {{ row.citizen_count ?? 0 }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#1F2533]">
                                            {{ formatAmount(row.weekly_billing ?? 0) }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#1F2533]">
                                            {{ formatAmount(row.hourly_billing ?? 0) }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#1F2533]">
                                            {{ formatAmount(row.bonuses ?? 0) }}
                                        </td>
                                        <td class="co-td text-[13px] font-semibold text-[#1F2533]">
                                            {{ formatAmount(row.total_revenue ?? 0) }}
                                        </td>
                                    </tr>
                                    <!-- Totals row -->
                                    <tr class="bg-[#F5F6F8] border-t-2 border-[#EAECF0] font-semibold">
                                        <td class="co-td text-[13px] text-[#1F2533]">Total</td>
                                        <td class="co-td text-[13px] text-[#1F2533]">{{ totalCitizens }}</td>
                                        <td class="co-td text-[13px] text-[#1F2533]">{{ formatAmount(totals.weekly) }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#1F2533]">{{ formatAmount(totals.hourly) }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#1F2533]">{{ formatAmount(totals.bonuses) }}
                                        </td>
                                        <td class="co-td text-[13px] text-[#205E77]">{{ formatAmount(totals.revenue) }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { t } = useI18n()
const userStore = useUserStore() as any

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/overview')
    }
})

const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) =>
    (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

const state = reactive({
    error: {} as Error,
    hasFetched: false,
    isLoading: false,
    rows: [] as any[],
    economy: { total_revenue: 0, case_count: 0, coordinators: [] as any[] },
    filter: { from_date: '', to_date: '' },
})

const economyChartOption = computed(() => {
    const names = state.economy.coordinators.map((c: any) => c.consultant_name)
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { bottom: 0, icon: 'roundRect' },
        grid: { left: 70, right: 20, top: 20, bottom: 50 },
        xAxis: {
            type: 'category',
            data: names,
            axisLabel: { interval: 0, rotate: names.length > 4 ? 25 : 0 },
        },
        yAxis: { type: 'value' },
        series: [
            {
                name: t('employment.economy.primary'),
                type: 'bar',
                stack: 'total',
                itemStyle: { color: '#1b6d8a' },
                data: state.economy.coordinators.map((c: any) => c.primary_revenue),
            },
            {
                name: t('employment.economy.secondary'),
                type: 'bar',
                stack: 'total',
                itemStyle: { color: '#2dbab2' },
                data: state.economy.coordinators.map((c: any) => c.secondary_revenue),
            },
        ],
    }
})

const totals = computed(() => ({
    weekly: state.rows.reduce((s, r) => s + (r.weekly_billing ?? 0), 0),
    hourly: state.rows.reduce((s, r) => s + (r.hourly_billing ?? 0), 0),
    bonuses: state.rows.reduce((s, r) => s + (r.bonuses ?? 0), 0),
    revenue: state.rows.reduce((s, r) => s + (r.total_revenue ?? 0), 0),
}))

const totalCitizens = computed(() =>
    state.rows.reduce((s, r) => s + (r.citizen_count ?? 0), 0)
)

async function fetchReport() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const [response, economy] = await Promise.all([
            employmentService.getRevenueReport(state.filter),
            employmentService.getCoordinatorEconomy(state.filter),
        ])
        state.rows = response?.data ?? response ?? []
        state.economy = economy?.data ?? economy ?? { total_revenue: 0, case_count: 0, coordinators: [] }
        state.hasFetched = true
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
