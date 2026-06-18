<template>
    <div class="space-y-4">
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
                style="height: 500px; width: 100%;" />
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
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

const state = reactive({
    error: {} as Error,
    isLoading: false,
    isLoadingProtocols: false,
    protocols: [] as any[],
    selectedProtocolUuid: '' as string,
    groupBy: 'daily',
    startDate: '' as string,
    endDate: '' as string,
    chartOption: {
        dataset: {
            dimensions: ['period', 'attended', 'absent'],
            source: [] as any[],
        },
        title: {
            text: t('citizens.developmentGraph.title'),
            left: 'center',
            top: 10,
            textStyle: { fontSize: 18, fontWeight: 'bold' },
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
            formatter: (params: any) => {
                let result = `<div style="font-weight:bold;margin-bottom:8px;">${params[0].name}</div>`
                params.forEach((p: any, i: number) => {
                    const val = p.value[i + 1] ?? p.value[1]
                    result += `<div style="display:flex;justify-content:space-between;align-items:center;margin:4px 0;">
                        <span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:8px;"></span>${p.seriesName}:</span>
                        <span style="margin-left:16px;font-weight:bold;">${val}</span>
                    </div>`
                })
                return result
            },
        },
        legend: { bottom: 60, icon: 'roundRect' },
        xAxis: {
            type: 'category',
            axisLabel: { interval: 'auto' as any, rotate: 0, fontSize: 11 },
        },
        yAxis: {
            minInterval: 1,
            name: t('citizens.developmentGraph.sessions'),
            nameTextStyle: { fontSize: 14, padding: [0, 0, 0, -50] },
            splitLine: { lineStyle: { type: 'dashed' } },
        },
        dataZoom: [
            { type: 'inside', xAxisIndex: 0, start: 0, end: 100 },
            {
                type: 'slider', xAxisIndex: 0, show: true, start: 0, end: 100,
                left: 70, right: 70,
                bottom: 10, height: 25,
                handleIcon: 'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z',
                handleSize: '80%', textStyle: { fontSize: 12 },
            },
        ] as any[],
        grid: { left: 50, right: 20, top: '15%', bottom: '22%', containLabel: true },
        series: [
            {
                type: 'line',
                name: t('citizens.developmentGraph.presence'),
                encode: { x: 'period', y: 'attended' },
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 3, color: '#22C55E' },
                itemStyle: { color: '#22C55E' },
                areaStyle: {
                    opacity: 0.3,
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(34, 197, 94, 0.5)' },
                            { offset: 1, color: 'rgba(34, 197, 94, 0.1)' },
                        ],
                    },
                },
                emphasis: { focus: 'series' },
            },
            {
                type: 'line',
                name: t('citizens.developmentGraph.absence'),
                encode: { x: 'period', y: 'absent' },
                smooth: true,
                symbol: 'none',
                lineStyle: { width: 2, color: '#EF4444' },
                itemStyle: { color: '#EF4444' },
                emphasis: { focus: 'series' },
            },
        ],
    },
})

const protocolOptions = computed(() =>
    state.protocols.map((p) => ({ value: p.uuid, label: p.name }))
)

const selectedProtocolModel = computed({
    get: (): null | undefined => (state.selectedProtocolUuid || null) as null | undefined,
    set: (val: any) => { state.selectedProtocolUuid = val ?? '' },
})

// Auto-derive granularity from the selected protocol's date span
function deriveGroupBy(startDate: string, endDate: string): string {
    const days = moment(endDate).diff(moment(startDate), 'days')
    if (days <= 92) return 'daily'
    if (days <= 731) return 'weekly'
    return 'monthly'
}

watch(() => state.selectedProtocolUuid, (val) => {
    if (!val) return
    const protocol = state.protocols.find((p) => p.uuid === val)
    if (protocol?.start_date && protocol?.end_date) {
        state.startDate = protocol.start_date
        state.endDate = protocol.end_date
        state.groupBy = deriveGroupBy(protocol.start_date, protocol.end_date)
    }
    fetchGraphData()
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
        }
    } catch (error: any) {
        state.error = error
        state.chartOption.dataset.source = []
    }

    state.isLoading = false
}
</script>
