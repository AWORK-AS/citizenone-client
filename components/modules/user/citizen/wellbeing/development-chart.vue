<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-end gap-3">
            <div class="w-44">
                <FormLabel for="wellbeing_from" :label="$t('wellbeing.development.from')" />
                <FormDateField id="wellbeing_from" name="wellbeing_from" v-model="state.from" />
            </div>
            <div class="w-44">
                <FormLabel for="wellbeing_to" :label="$t('wellbeing.development.to')" />
                <FormDateField id="wellbeing_to" name="wellbeing_to" v-model="state.to" />
            </div>
        </div>

        <LoadingSpinner :isActive="state.isLoading">
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <div v-if="!state.isLoading && !state.error?.message && state.series.length === 0"
                class="flex min-h-[160px] flex-col items-center justify-center py-8 text-center">
                <Icon name="ph:chart-line" class="mb-2 size-9 text-gray-300" />
                <p class="text-sm font-medium text-gray-500">{{ $t('wellbeing.development.empty') }}</p>
            </div>

            <VChart v-if="state.series.length > 0" :option="chartOption" style="height: 360px; width: 100%;" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { citizenScaleScoreService } from '@/components/api/user/CitizenScaleScoreService'
import type { Error } from '@/types'

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
    // The same key the journal ruler and the report's scale field write to.
    scaleKey: {
        type: String,
        default: 'trivsel',
    },
})

const { t } = useI18n()

// One colour per line, repeated if a case ever has more children than this.
const COLOURS = ['#174560', '#2DBAB2', '#E8A33D', '#D2553F', '#6B54C9', '#1F9D6B', '#3AA7C4', '#8A6208']

const state = reactive({
    error: {} as Error,
    isLoading: false,
    from: '' as string,
    to: '' as string,
    maxScore: 10,
    series: [] as any[],
})

function seriesLabel(series: any): string {
    const who = series.child_name || t('wellbeing.ruler.wholeCase')
    // A party other than staff (a parent, the child) is part of what the line
    // means, so it is named.
    const rater = series.rater_key && series.rater_key !== 'staff'
        ? (series.rater_label || series.rater_key)
        : ''

    return rater ? `${who} (${rater})` : who
}

const chartOption = computed(() => ({
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, icon: 'roundRect' },
    grid: { left: 40, right: 20, top: 20, bottom: 50, containLabel: true },
    xAxis: { type: 'time', axisLabel: { fontSize: 11 } },
    yAxis: {
        type: 'value',
        min: 0,
        max: state.maxScore,
        interval: state.maxScore >= 10 ? 2 : 1,
        splitLine: { lineStyle: { type: 'dashed' } },
    },
    series: state.series.map((series: any, index: number) => ({
        type: 'line',
        name: seriesLabel(series),
        data: (series.points ?? []).map((point: any) => [point.measured_at, point.score]),
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: { width: 2.5, color: COLOURS[index % COLOURS.length] },
        itemStyle: { color: COLOURS[index % COLOURS.length] },
        emphasis: { focus: 'series' },
    })),
}))

async function fetchDevelopment() {
    if (!props.citizenUuid) return
    state.error = {}
    state.isLoading = true
    try {
        const params: Record<string, string> = { scale_key: props.scaleKey }
        if (state.from) params.from = state.from
        if (state.to) params.to = state.to
        const response = await citizenScaleScoreService.getDevelopment(props.citizenUuid, params)
        state.series = response?.data?.series ?? []
        state.maxScore = Number(response?.data?.max_score) || 10
    } catch (error: any) {
        state.error = error
        state.series = []
    }
    state.isLoading = false
}

watch(() => [state.from, state.to], () => {
    // A period that ends before it starts is left alone rather than sent.
    if (state.from && state.to && state.to < state.from) return
    fetchDevelopment()
})

onMounted(fetchDevelopment)

defineExpose({ refresh: fetchDevelopment })
</script>
