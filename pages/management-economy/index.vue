<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('managementEconomy.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('managementEconomy.title') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Filter -->
                <div class="bg-white border border-surface-200 rounded-xl p-5 shadow-sm">
                    <div class="flex flex-wrap items-end gap-4">
                        <div class="space-y-1">
                            <FormLabel for="from_date" :label="$t('managementEconomy.fromDate')" />
                            <FormDateField id="from_date" name="from_date"
                                :placeholder="$t('managementEconomy.fromDate')" v-model="state.filter.from_date" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="to_date" :label="$t('managementEconomy.toDate')" />
                            <FormDateField id="to_date" name="to_date" :placeholder="$t('managementEconomy.toDate')"
                                v-model="state.filter.to_date" />
                        </div>
                        <FormButton buttonStyle="primary" @click="fetchReport" :disabled="state.isLoading">
                            <Icon name="ph:chart-bar" class="w-4 h-4" />
                            {{ $t('managementEconomy.generate') }}
                        </FormButton>
                        <FormButton buttonStyle="action" @click="exportCsv"
                            v-if="state.hasFetched && state.economy.coordinators?.length">
                            <Icon name="ph:file-arrow-down" class="w-4 h-4" />
                            {{ $t('managementEconomy.exportCsv') }}
                        </FormButton>
                    </div>
                </div>

                <LoadingSpinner :isActive="state.isLoading">
                    <div v-if="!state.hasFetched"
                        class="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
                        <Icon name="ph:chart-bar" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p class="text-slate-400 text-sm">{{ $t('managementEconomy.selectPeriod') }}</p>
                    </div>

                    <div v-else>
                        <!-- KPI -->
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                            <div class="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                                <p class="text-xs text-slate-400 uppercase tracking-wide">
                                    {{ $t('managementEconomy.allocatedRevenue') }}
                                </p>
                                <p class="text-2xl font-bold text-slate-900 mt-1">
                                    {{ formatAmount(state.economy.total_revenue) }}
                                </p>
                            </div>
                            <div class="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                                <p class="text-xs text-slate-400 uppercase tracking-wide">
                                    {{ $t('managementEconomy.interventions') }}
                                </p>
                                <p class="text-2xl font-bold text-secondary mt-1">{{ state.economy.case_count }}</p>
                            </div>
                            <div class="bg-white border border-surface-200 rounded-xl p-4 shadow-sm">
                                <p class="text-xs text-slate-400 uppercase tracking-wide">
                                    {{ $t('managementEconomy.coordinators') }}
                                </p>
                                <p class="text-2xl font-bold text-[#2dbab2] mt-1">
                                    {{ state.economy.coordinators?.length ?? 0 }}
                                </p>
                            </div>
                        </div>

                        <!-- Chart -->
                        <div v-if="state.economy.coordinators?.length"
                            class="bg-white border border-surface-200 rounded-xl shadow-sm p-5">
                            <h3 class="text-sm font-semibold text-slate-900 mb-4">
                                {{ $t('managementEconomy.coordinatorSplit') }}
                            </h3>
                            <ClientOnly>
                                <VChart :option="economyChartOption" style="height: 340px; width: 100%;" autoresize />
                            </ClientOnly>
                        </div>
                        <div v-else class="bg-white border border-surface-200 rounded-xl p-12 text-center shadow-sm">
                            <p class="text-slate-400 text-sm">{{ $t('managementEconomy.noData') }}</p>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { socialWelfareService } from '@/components/api/user/SocialWelfareService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { t } = useI18n()
const userStore = useUserStore() as any

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'social_welfare') {
        navigateTo('/overview')
    }
})

const state = reactive({
    error: {} as Error,
    hasFetched: false,
    isLoading: false,
    economy: { total_revenue: 0, case_count: 0, coordinators: [] as any[] },
    filter: { from_date: '', to_date: '' },
})

const economyChartOption = computed(() => {
    const names = state.economy.coordinators.map((c: any) => c.consultant_name)
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { bottom: 0, icon: 'roundRect' },
        grid: { left: 70, right: 20, top: 20, bottom: 50 },
        xAxis: { type: 'category', data: names, axisLabel: { interval: 0, rotate: names.length > 4 ? 25 : 0 } },
        yAxis: { type: 'value' },
        series: [
            {
                name: t('managementEconomy.primary'),
                type: 'bar', stack: 'total', itemStyle: { color: '#1b6d8a' },
                data: state.economy.coordinators.map((c: any) => c.primary_revenue),
            },
            {
                name: t('managementEconomy.secondary'),
                type: 'bar', stack: 'total', itemStyle: { color: '#2dbab2' },
                data: state.economy.coordinators.map((c: any) => c.secondary_revenue),
            },
        ],
    }
})

// Client-side CSV of the coordinator split — a quick step before full Power BI.
function exportCsv() {
    const coordinators = state.economy.coordinators ?? []
    const header = [
        t('managementEconomy.coordinators'),
        t('managementEconomy.primary'),
        t('managementEconomy.secondary'),
        'Total',
    ]
    const rows = coordinators.map((c: any) => {
        const primary = Number(c.primary_revenue ?? 0)
        const secondary = Number(c.secondary_revenue ?? 0)
        return [c.consultant_name ?? '', primary, secondary, primary + secondary]
    })
    rows.push([
        t('managementEconomy.allocatedRevenue'),
        coordinators.reduce((s: number, c: any) => s + Number(c.primary_revenue ?? 0), 0),
        coordinators.reduce((s: number, c: any) => s + Number(c.secondary_revenue ?? 0), 0),
        Number(state.economy.total_revenue ?? 0),
    ])
    // Semicolon-delimited + UTF-8 BOM so Danish characters open correctly in Excel.
    const csv = [header, ...rows]
        .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';'))
        .join('\r\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `koordinator-split_${state.filter.from_date || 'start'}_${state.filter.to_date || 'slut'}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

async function fetchReport() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await socialWelfareService.getCoordinatorEconomy(state.filter)
        state.economy = response?.data ?? response ?? { total_revenue: 0, case_count: 0, coordinators: [] }
        state.hasFetched = true
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}
</script>
