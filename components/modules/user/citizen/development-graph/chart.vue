<template>
    <div class="space-y-4">
        <!-- Row 1: Protocol + Granularity -->
        <div class="flex flex-wrap items-end gap-4">
            <!-- Protocol Selector -->
            <div class="flex-1 min-w-[200px]">
                <FormLabel :label="$t('citizens.developmentGraph.protocol')" />
                <div v-if="state.isLoadingProtocols" class="h-9 w-full animate-pulse rounded-md bg-gray-200" />
                <FormSelect
                    v-else
                    v-model="selectedProtocolModel"
                    :options="protocolOptions"
                    :searchable="true"
                    :canClear="false" />
            </div>

            <!-- Granularity Toggle -->
            <div class="flex gap-1 pb-0.5">
                <FormButton
                    v-for="option in granularityOptions"
                    :key="option.value"
                    type="button"
                    buttonSize="xs"
                    :buttonStyle="state.groupBy === option.value ? 'primary' : 'white'"
                    @click="changeGroupBy(option.value)">
                    {{ $t(option.label) }}
                </FormButton>
            </div>
        </div>

        <!-- Row 2: Quick Presets OR Custom Date Range -->
        <div class="flex flex-wrap items-center gap-3">
            <!-- Presets (hidden when custom active) -->
            <div v-if="state.activePreset !== 'custom'" class="flex flex-wrap gap-1.5">
                <FormButton
                    v-for="preset in datePresets"
                    :key="preset.key"
                    type="button"
                    buttonSize="xs"
                    :buttonStyle="state.activePreset === preset.key ? 'primary' : 'white'"
                    @click="applyPreset(preset)">
                    {{ $t(preset.label) }}
                </FormButton>
            </div>

            <!-- Custom Date Range (shown only when custom active) -->
            <div v-else class="flex items-center gap-2">
                <FormButton
                    type="button"
                    buttonSize="xs"
                    buttonStyle="white"
                    @click="exitCustom">
                    ← {{ $t('citizens.developmentGraph.back') }}
                </FormButton>
                <flat-pickr
                    v-model="state.startDate"
                    :config="datePickerConfig"
                    class="block w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    :placeholder="$t('citizens.developmentGraph.startDate')"
                    @on-change="onDateChange" />
                <span class="text-gray-400">—</span>
                <flat-pickr
                    v-model="state.endDate"
                    :config="datePickerConfig"
                    class="block w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    :placeholder="$t('citizens.developmentGraph.endDate')"
                    @on-change="onDateChange" />
            </div>
        </div>

        <!-- Chart Area -->
        <LoadingSpinner :isActive="state.isLoading">
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <!-- Empty state: no data for selected protocol/range -->
            <div
                v-if="!state.isLoading && state.selectedProtocolUuid && state.chartOption.dataset.source.length === 0 && !state.error?.message"
                class="flex min-h-[300px] flex-col items-center justify-center py-10 text-center">
                <svg class="mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                <p class="text-sm font-medium text-gray-500">{{ $t('citizens.developmentGraph.noData') }}</p>
            </div>

            <!-- Empty state: no protocol selected -->
            <div
                v-if="!state.selectedProtocolUuid && !state.isLoading && !state.isLoadingProtocols"
                class="flex min-h-[300px] flex-col items-center justify-center py-10 text-center">
                <svg class="mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                <p class="text-sm font-semibold text-gray-600">{{ $t('citizens.developmentGraph.selectProtocolHeading') }}</p>
                <p class="mt-1 max-w-xs text-xs text-gray-400">{{ $t('citizens.developmentGraph.selectProtocolSubtext') }}</p>
            </div>

            <VChart
                v-if="state.chartOption.dataset.source.length > 0"
                :option="state.chartOption"
                style="height: 420px; width: 100%;" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import FlatPickr from 'vue-flatpickr-component'
import { citizenService } from '@/components/api/user/CitizenService'
import { protocolService } from '@/components/api/user/ProtocolService'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
})

const { t } = useI18n()

const granularityOptions = [
    { value: 'daily', label: 'citizens.developmentGraph.daily' },
    { value: 'weekly', label: 'citizens.developmentGraph.weekly' },
    { value: 'monthly', label: 'citizens.developmentGraph.monthly' },
]

const datePresets = [
    {
        key: 'thisMonth',
        label: 'citizens.developmentGraph.thisMonth',
        start: () => moment().startOf('month').format('YYYY-MM-DD'),
        end: () => moment().format('YYYY-MM-DD'),
    },
    {
        key: 'lastMonth',
        label: 'citizens.developmentGraph.lastMonth',
        start: () => moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        end: () => moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD'),
    },
    {
        key: 'last3Months',
        label: 'citizens.developmentGraph.last3Months',
        start: () => moment().subtract(3, 'months').startOf('month').format('YYYY-MM-DD'),
        end: () => moment().format('YYYY-MM-DD'),
    },
    {
        key: 'thisYear',
        label: 'citizens.developmentGraph.thisYear',
        start: () => moment().startOf('year').format('YYYY-MM-DD'),
        end: () => moment().format('YYYY-MM-DD'),
    },
    {
        key: 'custom',
        label: 'citizens.developmentGraph.custom',
        start: null,
        end: null,
    },
]

const datePickerConfig = {
    dateFormat: 'Y-m-d',
    allowInput: true,
}

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isLoadingProtocols: false,
    protocols: [] as any[],
    selectedProtocolUuid: '' as string,  // internal string; bridged to FormSelect via computed
    groupBy: 'monthly',
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
    activePreset: 'thisMonth',
    chartOption: {
        dataset: {
            dimensions: ['period', 'attended', 'absent'],
            source: [] as any[],
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
        },
        legend: {},
        xAxis: {
            type: 'category',
            axisLabel: { interval: 'auto' as any, rotate: 0, fontSize: 11 },
        },
        yAxis: { minInterval: 1 },
        dataZoom: [
            { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
            { type: 'slider', xAxisIndex: 0, show: false, start: 0, end: 100, bottom: 5, height: 18 },
        ] as any[],
        grid: { left: 50, right: 20, top: 40, bottom: 70 },
        series: [
            {
                type: 'bar',
                name: t('citizens.developmentGraph.presence'),
                stack: 'total',
                itemStyle: { color: '#22C55E' },
            },
            {
                type: 'bar',
                name: t('citizens.developmentGraph.absence'),
                stack: 'total',
                itemStyle: { color: '#EF4444' },
            },
        ],
    },
})

const protocolOptions = computed(() =>
    state.protocols.map((p) => ({ value: p.uuid, label: p.name }))
)

// FormSelect modelValue is inferred as null by TS — bridge via computed to satisfy type
const selectedProtocolModel = computed({
    get: (): null | undefined => (state.selectedProtocolUuid || null) as null | undefined,
    set: (val: any) => { state.selectedProtocolUuid = val ?? '' },
})

// Set dataZoom window: show ~N points at once; if data fits, hide slider entirely
function applyZoomWindow(totalPoints: number) {
    const visible = state.groupBy === 'daily' ? 15 : 12
    const fits = totalPoints <= visible
    const endPct = fits ? 100 : (visible / totalPoints) * 100

    state.chartOption.dataZoom = [
        { type: 'inside', xAxisIndex: 0, start: 0, end: endPct },
        { type: 'slider', xAxisIndex: 0, show: !fits, start: 0, end: endPct, bottom: 5, height: 18 },
    ] as any[]
}

function getXAxisConfig(groupBy: string) {
    const daily = groupBy === 'daily'
    return {
        type: 'category',
        axisLabel: {
            interval: daily ? 0 : 'auto' as any,
            rotate: daily ? 45 : 0,
            fontSize: 11,
        },
    }
}

watch(() => state.selectedProtocolUuid, (val) => {
    if (val) fetchGraphData()
})

onMounted(() => {
    fetchProtocols()
})

async function fetchProtocols() {
    state.isLoadingProtocols = true
    try {
        const response = await protocolService.getProtocolsByCitizen(props.citizenUuid, {})
        if (response) {
            state.protocols = response?.data ?? response
            if (state.protocols.length === 1) {
                state.selectedProtocolUuid = state.protocols[0].uuid
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isLoadingProtocols = false
}

function changeGroupBy(value: string) {
    state.groupBy = value
    state.chartOption.xAxis = getXAxisConfig(value)
    fetchGraphData()
}

function applyPreset(preset: typeof datePresets[0]) {
    state.activePreset = preset.key
    if (preset.key === 'custom') return
    state.startDate = preset.start!()
    state.endDate = preset.end!()
    fetchGraphData()
}

function exitCustom() {
    const fallback = datePresets.find(p => p.key === 'thisMonth')!
    applyPreset(fallback)
}

function onDateChange() {
    state.activePreset = 'custom'
    fetchGraphData()
}

async function fetchGraphData() {
    if (!state.selectedProtocolUuid) return

    state.error = {} as Error
    state.isLoading = true

    try {
        const params = {
            protocol_uuid: state.selectedProtocolUuid,
            group_by: state.groupBy,
            start_date: state.startDate,
            end_date: state.endDate,
        }
        const response = await citizenService.getDevelopmentGraph(props.citizenUuid, params)
        if (response) {
            const data = response?.data ?? []
            state.chartOption.dataset.source = data
            applyZoomWindow(data.length)
        }
    } catch (error: any) {
        state.error = error
        state.chartOption.dataset.source = []
    }

    state.isLoading = false
}
</script>
