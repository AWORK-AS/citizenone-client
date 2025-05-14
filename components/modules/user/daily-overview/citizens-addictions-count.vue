<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <div class="overflow-scroll min-h-52 max-h-52">
            <div v-for="(addiction, index) in state.citizenAddictionsCount?.data" :key="index"
                class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 pr-5 pt-4 pb-4 pl-6 mr-1">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-x-2">
                        <p class="text-sm">
                            {{ index }}
                        </p>
                    </div>
                    <p class="text-sm">
                        {{ state.citizenAddictionsCount?.data[index] }}
                    </p>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import type { Error } from '@/types'
import { useDepartmentStore } from '@/store/department'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    },
})

const departmentStore = useDepartmentStore()

const state = reactive({
    citizenAddictionsCount: [] as any,
    isPageLoading: false,
    error: {} as Error,
})

// watch(() => props.dateRange, () => {
//     fetchCitizenAddictionsCount()
// }, { deep: true })

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizenAddictionsCount()
    }
})

onMounted(() => {
    fetchCitizenAddictionsCount()
})

async function fetchCitizenAddictionsCount() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        // if (props.dateRange) {
        //     params.end_date = props.dateRange.end_date
        //     params.start_date = props.dateRange.start_date
        // }
        const response = await dailyOverviewService.getCitizensAddictionsCount(params)
        if (response) {
            state.citizenAddictionsCount = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>