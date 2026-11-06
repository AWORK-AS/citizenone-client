<template>
    <div class="rounded-xl border border-surface-200 bg-white p-5 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h3 class="text-sm font-semibold text-slate-900">{{ $t('settings.powerBi.previewTitle') }}</h3>
                <p class="mt-1 text-xs text-slate-500">{{ $t('settings.powerBi.previewSubtitle') }}</p>
            </div>
            <span v-if="preview?.example"
                class="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {{ $t('settings.powerBi.previewExample') }}
            </span>
        </div>

        <div v-if="isLoading" class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div v-for="i in 4" :key="i" class="h-20 animate-pulse rounded-lg bg-surface-50" />
        </div>

        <div v-else-if="preview" class="relative mt-5">
            <!-- Example figures sit behind a soft blur: the shape of the report, not a free copy of it. -->
            <div :class="preview.example ? 'pointer-events-none select-none blur-[3px]' : ''"
                :aria-hidden="preview.example ? 'true' : undefined">
                <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <div v-for="kpi in kpis" :key="kpi.key"
                        class="rounded-lg border border-surface-100 bg-surface-50 px-4 py-3">
                        <p class="text-xs text-slate-500">{{ kpi.label }}</p>
                        <p class="mt-1 text-xl font-semibold text-slate-900">{{ kpi.value }}</p>
                    </div>
                </div>

                <div class="mt-4 grid gap-4 lg:grid-cols-5">
                    <div class="rounded-lg border border-surface-100 p-3 lg:col-span-3">
                        <p class="text-xs font-medium text-slate-600">{{ $t('settings.powerBi.chartInquiries') }}</p>
                        <VChart :option="inquiriesOption" style="height: 220px; width: 100%;" autoresize />
                    </div>
                    <div class="rounded-lg border border-surface-100 p-3 lg:col-span-2">
                        <p class="text-xs font-medium text-slate-600">{{ $t('settings.powerBi.chartDepartments') }}</p>
                        <VChart v-if="preview.active_per_department.length" :option="departmentsOption"
                            style="height: 220px; width: 100%;" autoresize />
                        <p v-else class="flex h-[220px] items-center justify-center text-center text-xs text-slate-400">
                            {{ $t('settings.powerBi.noDepartments') }}
                        </p>
                    </div>
                </div>
            </div>

            <div v-if="preview.example" class="absolute inset-0 flex items-center justify-center p-4">
                <div class="max-w-sm rounded-xl border border-surface-200 bg-white/95 p-5 text-center shadow-lg">
                    <div class="mx-auto flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary">
                        <Icon name="ph:chart-bar" class="size-5" />
                    </div>
                    <p class="mt-3 text-sm text-slate-600">{{ $t('settings.powerBi.previewExampleText') }}</p>
                    <div class="mt-4 flex justify-center">
                        <FormButton buttonStyle="primary" @click="navigateTo('/apps')">
                            <Icon name="ph:storefront" class="h-4 w-4" />
                            {{ $t('settings.powerBi.previewActivate') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { powerBiService } from '@/components/api/user/PowerBiService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useI18n } from 'vue-i18n'

type Preview = {
    example: boolean
    kpis: { active_citizens: number, inquiries: number, conversion_rate: number | null, revenue: number }
    inquiries_per_month: { month: string, inquiries: number, converted: number }[]
    active_per_department: { department: string, citizens: number }[]
}

const { t, locale } = useI18n()
const { formatAmount } = useAmountFormatter()

const preview = ref<Preview | null>(null)
const isLoading = ref(true)

const numberFormat = computed(() => new Intl.NumberFormat(locale.value === 'dk' ? 'da-DK' : locale.value))

const kpis = computed(() => {
    const k = preview.value?.kpis
    if (!k) return []
    return [
        { key: 'active', label: t('settings.powerBi.kpiActive'), value: numberFormat.value.format(k.active_citizens) },
        { key: 'inquiries', label: t('settings.powerBi.kpiInquiries'), value: numberFormat.value.format(k.inquiries) },
        {
            key: 'conversion',
            label: t('settings.powerBi.kpiConversion'),
            value: k.conversion_rate === null ? '–' : `${(k.conversion_rate * 100).toFixed(0)} %`,
        },
        { key: 'revenue', label: t('settings.powerBi.kpiRevenue'), value: formatAmount(k.revenue) },
    ]
})

function monthLabel(value: string): string {
    return new Date(value).toLocaleDateString(locale.value === 'dk' ? 'da-DK' : locale.value, { month: 'short' })
}

const inquiriesOption = computed(() => {
    const months = preview.value?.inquiries_per_month ?? []
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { bottom: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10 },
        grid: { left: 32, right: 8, top: 12, bottom: 40 },
        xAxis: { type: 'category', data: months.map(m => monthLabel(m.month)), axisTick: { show: false } },
        yAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#eef2f6' } } },
        series: [
            {
                name: t('settings.powerBi.kpiInquiriesShort'),
                type: 'bar', barMaxWidth: 18, itemStyle: { color: '#1b6d8a', borderRadius: [3, 3, 0, 0] },
                data: months.map(m => m.inquiries),
            },
            {
                name: t('settings.powerBi.kpiConversion'),
                type: 'line', smooth: true, symbolSize: 6, itemStyle: { color: '#2dbab2' },
                data: months.map(m => m.converted),
            },
        ],
    }
})

const departmentsOption = computed(() => {
    const rows = [...(preview.value?.active_per_department ?? [])].reverse()
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 8, right: 24, top: 8, bottom: 8, containLabel: true },
        xAxis: { type: 'value', minInterval: 1, splitLine: { lineStyle: { color: '#eef2f6' } } },
        yAxis: { type: 'category', data: rows.map(r => r.department), axisTick: { show: false } },
        series: [{
            name: t('settings.powerBi.kpiActive'),
            type: 'bar', barMaxWidth: 16, itemStyle: { color: '#1b6d8a', borderRadius: [0, 3, 3, 0] },
            label: { show: true, position: 'right', color: '#475569', fontSize: 11 },
            data: rows.map(r => r.citizens),
        }],
    }
})

onMounted(async () => {
    try {
        const response = await powerBiService.preview()
        preview.value = response?.data ?? null
    } catch {
        // The preview is a bonus on the page; without it the rest still works.
        preview.value = null
    }
    isLoading.value = false
})
</script>
