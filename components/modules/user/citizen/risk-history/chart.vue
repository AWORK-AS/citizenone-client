<template>
    <div class="space-y-4">
        <div class="inline-flex flex-wrap gap-1 rounded-lg bg-gray-100 p-0.5">
            <button type="button" v-for="option in periodOptions" :key="option.value" @click="setPeriod(option.value)"
                :class="[
                    'rounded-md px-3 py-1.5 text-sm font-medium transition',
                    state.period === option.value ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                ]">
                {{ option.label }}
            </button>
        </div>

        <LoadingSpinner :isActive="state.isLoading">
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <div v-if="!state.isLoading && !state.error?.message && state.entries.length < 2"
                class="flex min-h-[300px] flex-col items-center justify-center py-10 text-center">
                <Icon name="ph:chart-line" class="mb-3 size-10 text-gray-300" />
                <p class="text-sm font-medium text-gray-500">{{ $t('citizens.riskHistory.notEnoughData') }}</p>
            </div>

            <VChart v-else-if="!state.isLoading" :option="state.chartOption" style="height: 400px; width: 100%;" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
})

const { t } = useI18n()

const LEVELS: Record<string, number> = {
    'no risk': 0,
    'increased risk': 1,
    'acute increased risk': 2,
}

const COLORS: Record<string, string> = {
    green: '#15803D',
    yellow: '#EAB308',
    red: '#DC2626',
}

const periodOptions = computed(() => [
    { value: 1, label: t('citizens.riskHistory.period1') },
    { value: 3, label: t('citizens.riskHistory.period3') },
    { value: 6, label: t('citizens.riskHistory.period6') },
])

const state = reactive({
    error: {} as Error,
    isLoading: false,
    period: 3,
    entries: [] as any[],
    chartOption: {} as any,
})

function buildChartOption() {
    const categoryLabels = [
        t('citizens.riskHistory.noRisk'),
        t('citizens.riskHistory.increasedRisk'),
        t('citizens.riskHistory.acuteIncreasedRisk'),
    ]

    state.chartOption = {
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => `${params.name}<br />${categoryLabels[params.value[1]]}`,
        },
        grid: { left: 90, right: 30, top: 20, bottom: 40 },
        xAxis: {
            type: 'category',
            data: state.entries.map((entry) => entry.date),
            axisLabel: { fontSize: 11 },
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 2,
            interval: 1,
            axisLabel: { formatter: (value: number) => categoryLabels[value] ?? '' },
        },
        series: [
            {
                type: 'line',
                step: 'end',
                symbolSize: 12,
                lineStyle: { width: 2, color: '#CBD5E1' },
                data: state.entries.map((entry) => ({
                    value: LEVELS[entry.assessment] ?? 0,
                    itemStyle: { color: COLORS[entry.color] ?? '#94A3B8' },
                })),
            },
        ],
    }
}

function setPeriod(period: number) {
    state.period = period
    fetchHistory()
}

async function fetchHistory() {
    state.error = {} as Error
    state.isLoading = true

    try {
        const response = await journalService.getRiskAssessmentHistory(props.citizenUuid, state.period)
        state.entries = response?.data ?? []
        buildChartOption()
    } catch (error: any) {
        state.error = error
        state.entries = []
    }

    state.isLoading = false
}

onMounted(() => {
    fetchHistory()
})
</script>
