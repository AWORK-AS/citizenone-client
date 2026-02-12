<template>
    <div class="comp-time-graph">
        <LoadingSpinner  :isActive="state.isPageLoading">
            <div class="graph-container" v-if="state.compensatoryReport.length > 0">
                <!-- Summary Stats -->
                <div class="summary-stats">
                    <div class="stat-card border-l-8 border-primary">
                        <div class="stat-label">{{ $t('dutySchedules.normHours.graph.totalNormHours') }}</div>
                        <div class="stat-value">{{ currentBalance?.cumulativeNorm.toFixed(2) }} {{ $t('dutySchedules.normHours.graph.hours') }}</div>
                    </div>
                    <div class="stat-card border-l-8 border-secondary">
                        <div class="stat-label">{{ $t('dutySchedules.normHours.graph.totalWorkedHours') }}</div>
                        <div class="stat-value">{{ currentBalance?.cumulativeWorked.toFixed(2) }} {{ $t('dutySchedules.normHours.graph.hours') }}</div>
                    </div>
                    <div class="stat-card border-l-8 border-amber-500"
                        :class="{ positive: !currentBalance?.isPositive, negative: currentBalance?.isPositive }">
                        <div class="stat-label">{{ $t('dutySchedules.normHours.graph.compensatoryTimeBalance') }}</div>
                        <div class="stat-value">
                            {{ Math.abs(currentBalance?.compTimeBalance || 0).toFixed(2) }} {{ $t('dutySchedules.normHours.graph.hours') }}
                            <span class="balance-indicator">
                                {{ !currentBalance?.isPositive ? `(${ $t('dutySchedules.normHours.graph.credit') })` : `(${ $t('dutySchedules.normHours.graph.deficit') })` }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Chart -->
                <VChart :option="chartOption" autoresize class="chart" />
            </div>
        </LoadingSpinner>
    </div>
</template>

<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService';
import type { Error } from '@/types'
import tailwindConfig from '~/tailwind.config';
import resolveConfig from 'tailwindcss/resolveConfig'
import { 
    blue, 
    green, 
    amber, 
    red, 
    gray 
} from 'tailwindcss/colors'
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n()
const colors = resolveConfig(tailwindConfig).theme?.colors as Record<string, any>

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
    cumulative_norm: number
    cumulative_worked: number
    cumulative_comp_used: number
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

async function fetchCompensatoryReport() {
    state.isPageLoading = true
    try {
        const params = {}
        const response = await dutyScheduleService.getCompensatoryReport(props.selectedEmployee.uuid, params)
        state.compensatoryReport = response.data
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
            const date = new Date(params[0].value[0]).toLocaleDateString(locale.value === 'da' ? 'da-DK' : 'en-US', {
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
            <span style="margin-left: 16px; font-weight: bold;">${value} ${t('dutySchedules.normHours.graph.hours')}</span>
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
                return date.toLocaleDateString(locale.value === 'da' ? 'da-DK' : 'en-US', { month: 'short', day: 'numeric' })
            },
        },
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
.comp-time-graph {
    width: 100%;
}

.graph-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
}

.stat-card {
    padding: 1rem 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    /* border-left: 4px solid #5470c6; */
}

.stat-card.positive {
    border-left-color: #91cc75;
    background: #f0f9f4;
}

.stat-card.negative {
    border-left-color: #ee6666;
    background: #fff5f5;
}

.stat-label {
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #333;
}

.balance-indicator {
    font-size: 0.875rem;
    font-weight: normal;
    color: #666;
    margin-left: 0.5rem;
}

.chart {
    width: 100%;
    height: 500px;
    min-height: 400px;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #999;
}

@media (max-width: 768px) {
    .comp-time-graph {
        padding: 1rem;
    }

    .summary-stats {
        grid-template-columns: 1fr;
    }

    .chart {
        height: 400px;
    }

    .stat-value {
        font-size: 1.25rem;
    }
}
</style>