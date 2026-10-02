<template>
    <div>
        <Modal size="lg" :title="$t('citizens.nursingAreas.vitals.graph.viewGraphs')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-5">
                        <Alert type="danger" :text="state.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />

                        <div class="flex flex-wrap items-end gap-3">
                            <div class="w-44">
                                <FormLabel for="vitals_graph_from" :label="$t('wellbeing.development.from')" />
                                <FormDateField id="vitals_graph_from" name="vitals_graph_from"
                                    :placeholder="$t('wellbeing.development.from')" v-model="state.from" />
                            </div>
                            <div class="w-44">
                                <FormLabel for="vitals_graph_to" :label="$t('wellbeing.development.to')" />
                                <FormDateField id="vitals_graph_to" name="vitals_graph_to"
                                    :placeholder="$t('wellbeing.development.to')" v-model="state.to" />
                            </div>
                        </div>

                        <div v-if="!state.isPageLoading && state.records.length === 0"
                            class="flex min-h-[160px] flex-col items-center justify-center py-8 text-center">
                            <Icon name="ph:chart-line" class="mb-2 size-9 text-gray-300" />
                            <p class="text-sm font-medium text-gray-500">
                                {{ $t('citizens.nursingAreas.vitals.graph.empty') }}
                            </p>
                        </div>

                        <div v-else class="space-y-6">
                            <div v-for="chart in charts" :key="chart.key" class="space-y-1">
                                <div class="flex items-center justify-between">
                                    <p class="font-medium text-sm">{{ chart.label }}</p>
                                    <span v-if="chart.skipped > 0" class="text-xs text-amber-600">
                                        {{ $t('citizens.nursingAreas.vitals.graph.skippedEntries', { count: chart.skipped }) }}
                                    </span>
                                </div>
                                <VChart v-if="chart.points > 0" :option="chart.option"
                                    style="height: 220px; width: 100%;" autoresize />
                                <div v-else
                                    class="flex h-[100px] flex-col items-center justify-center text-center bg-gray-50 rounded-md">
                                    <p class="text-xs text-gray-400">
                                        {{ $t('citizens.nursingAreas.vitals.graph.empty') }}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { vitalService } from '@/components/api/user/VitalService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    citizenUuid: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['close'])

// One colour per line within a chart (blood pressure needs two).
const COLOURS = ['#174560', '#2DBAB2']

const SIMPLE_SIGNS = [
    { key: 'pulse', field: 'pulse', labelKey: 'citizens.nursingAreas.vitals.form.pulse' },
    { key: 'weight', field: 'weight', labelKey: 'citizens.nursingAreas.vitals.form.weight' },
    { key: 'blood_sugar', field: 'blood_sugar', labelKey: 'citizens.nursingAreas.vitals.form.bloodSugar' },
    { key: 'temperature', field: 'temperature', labelKey: 'citizens.nursingAreas.vitals.form.temperature' },
]

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    from: '' as string,
    to: '' as string,
    records: [] as any[],
})

function closeModal() {
    emit('close')
}

// A free-text value like "72 bpm" or "71kg" still has a number in it
// somewhere - pulls the first one out, or null if there isn't one. Accepts a
// comma as the decimal separator too (the normal one in da/no/sv), since
// these fields are plain free text with no format enforced on entry.
function extractNumber(value: any): number | null {
    if (value === null || value === undefined) return null
    const match = String(value).match(/-?\d+([.,]\d+)?/)
    if (!match) return null
    const num = parseFloat(match[0].replace(',', '.'))
    return isNaN(num) ? null : num
}

function parseBloodPressure(value: any): { systolic: number | null, diastolic: number | null } {
    const parts = String(value ?? '').split('/')
    return {
        systolic: extractNumber(parts[0]),
        diastolic: parts.length > 1 ? extractNumber(parts[1]) : null,
    }
}

function lineChartOption(series: { name: string, data: any[], color: string }[]) {
    return {
        tooltip: { trigger: 'axis' },
        legend: series.length > 1 ? { bottom: 0, icon: 'roundRect' } : undefined,
        grid: { left: 40, right: 20, top: 20, bottom: series.length > 1 ? 40 : 20, containLabel: true },
        xAxis: { type: 'time', axisLabel: { fontSize: 11 } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
        series: series.map((s) => ({
            type: 'line',
            name: s.name,
            data: s.data,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2.5, color: s.color },
            itemStyle: { color: s.color },
        })),
    }
}

const charts = computed(() => {
    const records = state.records
    const result: { key: string, label: string, skipped: number, points: number, option: any }[] = []

    // Blood pressure - two lines, one chart.
    let bpSkipped = 0
    const systolicPoints: any[] = []
    const diastolicPoints: any[] = []
    records.forEach((r) => {
        const { systolic, diastolic } = parseBloodPressure(r.blood_pressure)
        if (systolic === null) {
            bpSkipped++
            return
        }
        systolicPoints.push([r.date, systolic])
        if (diastolic !== null) diastolicPoints.push([r.date, diastolic])
    })
    result.push({
        key: 'blood_pressure',
        label: t('citizens.nursingAreas.vitals.form.bloodPressure'),
        skipped: bpSkipped,
        points: systolicPoints.length,
        option: lineChartOption([
            { name: t('citizens.nursingAreas.vitals.graph.systolic'), data: systolicPoints, color: COLOURS[0] },
            { name: t('citizens.nursingAreas.vitals.graph.diastolic'), data: diastolicPoints, color: COLOURS[1] },
        ]),
    })

    // Pulse / Weight / Blood sugar / Temperature - one line each.
    SIMPLE_SIGNS.forEach((sign) => {
        let skipped = 0
        const points: any[] = []
        records.forEach((r) => {
            const num = extractNumber(r[sign.field])
            if (num === null) {
                skipped++
                return
            }
            points.push([r.date, num])
        })
        const label = t(sign.labelKey)
        result.push({
            key: sign.key,
            label,
            skipped,
            points: points.length,
            option: lineChartOption([{ name: label, data: points, color: COLOURS[0] }]),
        })
    })

    // Custom additional_fields - one chart per distinct field name found in
    // this citizen's history, regardless of company (a field someone once
    // typed a number into for one citizen may be free text for another).
    const customFieldNames: string[] = []
    records.forEach((r) => {
        (r.additional_fields ?? []).forEach((f: any) => {
            if (f?.name && !customFieldNames.includes(f.name)) customFieldNames.push(f.name)
        })
    })
    customFieldNames.forEach((name) => {
        let skipped = 0
        const points: any[] = []
        records.forEach((r) => {
            const field = (r.additional_fields ?? []).find((f: any) => f?.name === name)
            if (!field) return
            const num = extractNumber(field.value)
            if (num === null) {
                skipped++
                return
            }
            points.push([r.date, num])
        })
        result.push({
            key: `custom_${name}`,
            label: name,
            skipped,
            points: points.length,
            option: lineChartOption([{ name, data: points, color: COLOURS[0] }]),
        })
    })

    return result
})

// Guards against the modal-open fetch and a quick from/to change racing each
// other - only the response to the most recently issued request is applied.
let fetchSequence = 0

async function fetchVitalsForGraph() {
    if (!props.citizenUuid) return
    const requestId = ++fetchSequence
    state.error = {}
    state.isPageLoading = true
    try {
        const params: Record<string, string> = { citizen_uuid: props.citizenUuid }
        if (state.from) params.from = state.from
        if (state.to) params.to = state.to
        const response = await vitalService.getAllVitalsForGraph(params)
        if (requestId !== fetchSequence) return
        state.records = response?.data ?? []
    } catch (error: any) {
        if (requestId !== fetchSequence) return
        state.error = error
        state.records = []
    }
    if (requestId === fetchSequence) state.isPageLoading = false
}

watch(() => props.isModalOpen, (opened) => {
    if (opened) fetchVitalsForGraph()
})

watch(() => [state.from, state.to], () => {
    // A period that ends before it starts is left alone rather than sent.
    if (state.from && state.to && state.to < state.from) return
    fetchVitalsForGraph()
})
</script>
