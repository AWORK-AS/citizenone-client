<template>
    <div>
        <Modal size="lg" :title="$t('plansandgoals.graph')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div>
                            <VChart id="myChart" :option="state.chartOption" />
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planGoalSubgoalService } from '@/components/api/user/PlanGoalSubgoalService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedData: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshData'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    chartOption: {
        dataset: {
            dimensions: ['label', 'level'],
            source: [] as any,
        },
        tooltip: {
            trigger: 'item', // Triggers the tooltip on item hover
            axisPointer: {
                type: 'shadow', // Display shadow pointer for bar charts
            },
        },
        xAxis: { type: 'category' },
        yAxis: {},
        series: [
            {
                type: 'bar',
                itemStyle: {
                    color: '#205E77', // Change the color of the bars to blue
                },
            }
        ],
    }
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (newValue: any) => {
    if (newValue) {
        fetchPlanGoalSubgoalGraph()
    }
})

async function fetchPlanGoalSubgoalGraph() {
    state.error = {}
    state.isPageLoading = true
    try {
        const planGoalSubgoalUuid = props.selectedData?.uuid
        const response = await planGoalSubgoalService.getPlanGoalSubgoalGraph(planGoalSubgoalUuid)
        if (response) {
            state.chartOption.dataset.source = []
            response?.data?.forEach((data: any) => {
                state.chartOption.dataset.source.push({
                    label: formatDateToReadable(data?.date),
                    level: parseInt(data?.level)
                })
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>