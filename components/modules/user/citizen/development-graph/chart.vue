<template>
    <div class="space-y-4">
        <!-- Protocol Selector -->
        <div>
            <select
                v-model="state.selectedProtocolUuid"
                class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                @change="fetchGraphData">
                <option value="">{{ $t('citizens.developmentGraph.selectProtocol') }}</option>
                <option v-for="protocol in state.protocols" :key="protocol.uuid" :value="protocol.uuid">
                    {{ protocol.name }}
                </option>
            </select>
        </div>

        <!-- Filters: Granularity + Date Range -->
        <div class="flex flex-wrap items-center gap-3">
            <!-- Granularity Toggle -->
            <div class="flex gap-1">
                <button
                    v-for="option in granularityOptions"
                    :key="option.value"
                    class="rounded px-3 py-1.5 text-xs font-medium transition-colors"
                    :class="state.groupBy === option.value
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                    @click="changeGroupBy(option.value)">
                    {{ $t(option.label) }}
                </button>
            </div>

            <!-- Date Range -->
            <div class="flex items-center gap-2">
                <flat-pickr
                    v-model="state.startDate"
                    :config="datePickerConfig"
                    class="block w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    :placeholder="$t('citizens.developmentGraph.startDate')"
                    @on-change="fetchGraphData" />
                <span class="text-gray-500">—</span>
                <flat-pickr
                    v-model="state.endDate"
                    :config="datePickerConfig"
                    class="block w-36 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    :placeholder="$t('citizens.developmentGraph.endDate')"
                    @on-change="fetchGraphData" />
            </div>
        </div>

        <!-- Chart Area -->
        <LoadingSpinner :isActive="state.isLoading">
            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <div v-if="!state.isLoading && state.selectedProtocolUuid && state.chartOption.dataset.source.length === 0 && !state.error?.message"
                class="py-10 text-center text-sm text-gray-500">
                {{ $t('citizens.developmentGraph.noData') }}
            </div>

            <div v-if="!state.selectedProtocolUuid && !state.isLoading"
                class="py-10 text-center text-sm text-gray-400">
                {{ $t('citizens.developmentGraph.selectProtocol') }}
            </div>

            <VChart
                v-if="state.chartOption.dataset.source.length > 0"
                :option="state.chartOption"
                style="height: 350px; width: 100%;" />
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

const datePickerConfig = {
    dateFormat: 'Y-m-d',
    allowInput: true,
}

const state = reactive({
    error: {} as Error,
    isLoading: false,
    protocols: [] as any[],
    selectedProtocolUuid: '',
    groupBy: 'monthly',
    startDate: moment().startOf('month').format('YYYY-MM-DD'),
    endDate: moment().format('YYYY-MM-DD'),
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
        xAxis: { type: 'category' },
        yAxis: { minInterval: 1 },
        series: [
            {
                type: 'bar',
                name: t('citizens.developmentGraph.presence'),
                itemStyle: { color: '#22C55E' },
            },
            {
                type: 'bar',
                name: t('citizens.developmentGraph.absence'),
                itemStyle: { color: '#EF4444' },
            },
        ],
    },
})

onMounted(() => {
    fetchProtocols()
})

async function fetchProtocols() {
    try {
        const response = await protocolService.getProtocolsByCitizen(props.citizenUuid, {})
        if (response) {
            state.protocols = response?.data ?? response
        }
    } catch (error: any) {
        state.error = error
    }
}

function changeGroupBy(value: string) {
    state.groupBy = value
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
            state.chartOption.dataset.source = response?.data ?? []
        }
    } catch (error: any) {
        state.error = error
        state.chartOption.dataset.source = []
    }

    state.isLoading = false
}
</script>
