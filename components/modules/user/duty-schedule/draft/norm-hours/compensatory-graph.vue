<template>
    <div>
        <LoadingSpinner :isActive="state.isPageLoading">
            <!-- Error Message -->
            <div v-if="state.error?.message" class="mb-4">
                <Alert type="danger" :text="state.error.message" />
            </div>
            
            <!-- No Data Message -->
            <div v-else-if="!state.isPageLoading && state.compensatoryReport.length === 0" class="text-center py-8">
                <p class="text-gray-500">{{ $t('noDataAvailable') }}</p>
            </div>
            
            <div class="space-y-5" v-else-if="state.compensatoryReport.length > 0">
                <!-- Summary Stats -->
                <div class="flex items-center gap-x-1" v-if="props.selectedEmployee?.norm_period">
                    <h3 class="text-sm font-medium text-gray-900">
                        {{ props.selectedEmployee?.norm_period?.name }} {{
                            props.selectedEmployee?.norm_period?.period }}
                    </h3>
                </div>
                <div class="flex flex-wrap items-center gap-5">
                    <div class="grow bg-gray-50 p-4 rounded-md border-l-8 border-primary">
                        <div class="text-sm text-gray-500">
                            {{ $t('dutySchedules.normHours.graph.totalNormHours') }}
                        </div>
                        <div class="mt-1 text-base font-semibold text-black">
                            {{ formatNumber(locale, currentBalance?.cumulativeNorm) }} {{
                                $t('dutySchedules.normHours.graph.hours') }}
                        </div>
                    </div>
                    <div class="grow bg-gray-50 p-4 rounded-md border-l-8 border-secondary">
                        <div class="text-sm text-gray-500">
                            {{ $t('dutySchedules.normHours.graph.totalWorkedHours') }}
                        </div>
                        <div class="mt-1 text-base font-semibold text-black">
                            {{ formatNumber(locale, currentBalance?.cumulativeWorked) }} {{
                                $t('dutySchedules.normHours.graph.hours') }}
                        </div>
                    </div>
                    <div class="grow stat-card bg-gray-50 p-4 rounded-md border-l-8 border-amber-500"
                        :class="{ positive: !currentBalance?.isPositive, negative: currentBalance?.isPositive }">
                        <div class="text-sm text-gray-500">
                            {{ $t('dutySchedules.normHours.graph.compensatoryTimeBalance') }}
                        </div>
                        <div class="mt-1 text-base font-semibold text-black">
                            {{ formatNumber(locale, Math.abs(currentBalance?.compTimeBalance || 0)) }} {{
                                $t('dutySchedules.normHours.graph.hours') }}
                            <span class="balance-indicator">
                                {{ !currentBalance?.isPositive ? `(${$t('dutySchedules.normHours.graph.credit')})` :
                                    `(${$t('dutySchedules.normHours.graph.deficit')})` }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Chart -->
                <VChart :option="chartOption" autoresize class="chart" style="height: 500px;" />
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { draftScheduleService } from '@/components/api/user/DraftScheduleService';
import type { Error } from '@/types'
import {
    amber
} from 'tailwindcss/colors'
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n()
const { formatNumber } = useNumberFormatter()

const props = defineProps({
    selectedEmployee: {
        type: Object,
        required: true,
    },
})

interface CompTimeData {
    date: string
    daily_norm_hours: number
    daily_worked_hours: number
    daily_comp_used_hours: number
    daily_extra_hours: number
    cumulative_norm: number
    cumulative_worked: number
    cumulative_comp_used: number
    cumulative_extra_hours: number
    comp_time_balance: number
}

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    compensatoryReport: [] as CompTimeData[],
})

onMounted(() => {
    fetchCompensatoryReport()
})

watch(() => props.selectedEmployee, (newEmployee) => {
    if (newEmployee?.uuid) {
        fetchCompensatoryReport()
    }
}, { deep: true })

async function fetchCompensatoryReport() {
    state.isPageLoading = true
    try {
        const params = {}
        const response = await draftScheduleService.getCompensatoryReport(props.selectedEmployee.uuid, params)
        if (response) {
            state.compensatoryReport = response.data
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isPageLoading = false
    }
}

const chartOption = computed(() => ({
    title: {
        text: t('dutySchedules.normHours.graph.compensatoryTimeOverview'),
        left: 'center',
        top: 10,
        textStyle: {
            fontSize: 18,
            fontWeight: 'bold',
        },
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross',
            label: {
                backgroundColor: '#6a7985',
            },
        },
        formatter: (params: any) => {
            const date = new Date(params[0].value[0]).toLocaleDateString(locale.value === 'dk' ? 'da-DK' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            let result = `<div style="font-weight: bold; margin-bottom: 8px;">${date}</div>`

            params.forEach((param: any) => {
                const value = param.value[1].toFixed(2)
                const color = param.color
                result += `
          <div style="display: flex; justify-content: space-between; align-items: center; margin: 4px 0;">
            <span>
              <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-right: 8px;"></span>
              ${param.seriesName}:
            </span>
            <span style="margin-left: 16px; font-weight: bold;">${formatNumber(locale.value, value)} ${t('dutySchedules.normHours.graph.hours')}</span>
          </div>
        `
            })

            return result
        },
    },
    legend: {
        data: [t('dutySchedules.normHours.graph.normHours'), t('dutySchedules.normHours.graph.workedHours'), t('dutySchedules.normHours.graph.compensatoryTimeBalance')],
        bottom: 60,
        icon: 'roundRect',
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '20%',
        top: '15%',
        containLabel: true,
    },
    xAxis: {
        type: 'time',
        boundaryGap: false,
        axisLabel: {
            formatter: (value: number) => {
                const date = new Date(value)
                return date.toLocaleDateString(locale.value === 'dk' ? 'da-DK' : 'en-US', { month: 'short', day: 'numeric' })
            },
        },
        axisPointer: {
            show: true,
            label: {
                formatter: (params: any) => {
                    // params.value is the timestamp of the current hover position
                    const date = new Date(params.value);
                    return date.toLocaleDateString(locale.value === 'dk' ? 'da-DK' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                },
                backgroundColor: '#6a7985',
            }
        }
    },
    yAxis: {
        type: 'value',
        name: t('dutySchedules.normHours.graph.hours'),
        nameTextStyle: {
            fontSize: 14,
            padding: [0, 0, 0, -50],
        },
        axisLabel: {
            formatter: `{value} ${t('dutySchedules.normHours.graph.hours')}`,
        },
        axisPointer: {
            show: true,
            label: {
                formatter: (params: any) => {
                    return `${formatNumber(locale.value, params.value)} ${t('dutySchedules.normHours.graph.hours')}`
                },
                backgroundColor: '#6a7985',
            }
        },
        splitLine: {
            lineStyle: {
                type: 'dashed',
            },
        },
    },
    dataZoom: [
        {
            type: 'slider',
            start: 0,
            end: 100,
            bottom: 10,
            height: 25,
            handleIcon:
                'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z',
            handleSize: '80%',
            textStyle: {
                fontSize: 12,
            },
        },
        {
            type: 'inside',
            start: 0,
            end: 100,
        },
    ],
    series: [
        {
            name: t('dutySchedules.normHours.graph.normHours'),
            type: 'line',
            data: state.compensatoryReport.map((d) => [d.date, d.cumulative_norm]),
            smooth: true,
            symbol: 'none',
            lineStyle: {
                width: 2,
                color: '#205E77',
            },
            itemStyle: {
                color: '#205E77',
            },
            emphasis: {
                focus: 'series',
            },
        },
        {
            name: t('dutySchedules.normHours.graph.workedHours'),
            type: 'line',
            data: state.compensatoryReport.map((d) => [d.date, d.cumulative_worked]),
            smooth: true,
            symbol: 'none',
            lineStyle: {
                width: 2,
                color: '#41ADD8',
            },
            itemStyle: {
                color: '#41ADD8',
            },
            emphasis: {
                focus: 'series',
            },
        },
        {
            name: t('dutySchedules.normHours.graph.compensatoryTimeBalance'),
            type: 'line',
            data: state.compensatoryReport.map((d) => [d.date, d.comp_time_balance]),
            smooth: true,
            symbol: 'none',
            lineStyle: {
                width: 3,
                color: amber[500],
            },
            itemStyle: {
                color: amber[500],
            },
            areaStyle: {
                opacity: 0.3,
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                        { offset: 0, color: 'rgba(250, 200, 88, 0.5)' },
                        { offset: 1, color: 'rgba(250, 200, 88, 0.1)' },
                    ],
                },
            },
            emphasis: {
                focus: 'series',
            },
            markLine: {
                silent: true,
                symbol: 'none',
                data: [
                    {
                        yAxis: 0,
                        lineStyle: {
                            color: '#999',
                            type: 'dashed',
                            width: 1,
                        },
                        label: {
                            show: false,
                        },
                    },
                ],
            },
        },
    ],
}))

// Current balance summary
const currentBalance = computed(() => {
    if (state.compensatoryReport.length === 0) return null
    const latest = state.compensatoryReport[state.compensatoryReport.length - 1]
    return {
        compTimeBalance: latest.comp_time_balance,
        cumulativeNorm: latest.cumulative_norm,
        cumulativeWorked: latest.cumulative_worked,
        isPositive: latest.comp_time_balance < 0, // Negative balance means worked extra
    }
})

</script>

<style scoped>
.stat-card.positive {
    border-left-color: #91cc75;
    background: #f0f9f4;
}

.stat-card.negative {
    border-left-color: #ee6666;
    background: #fff5f5;
}

.balance-indicator {
    font-size: 0.875rem;
    font-weight: normal;
    color: #666;
    margin-left: 0.5rem;
}
</style>
