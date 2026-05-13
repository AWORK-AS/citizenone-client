<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('overview.gender.gender') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div
            class="bg-white shadow-md rounded-md border-l-8 border-primary mt-2 text-sm space-y-2 pr-5 pt-6 pb-6 pl-6 mr-1">
            <div class="space-y-1">
                <div class="flex items-center justify-between">
                    <p class="text-sm">
                        {{ $t('overview.gender.male') }}
                    </p>
                    <p class="text-sm">
                        {{ state.citizensGender?.data?.male }}
                    </p>
                </div>
                <div class="flex items-center justify-between">
                    <p class="text-sm">
                        {{ $t('overview.gender.female') }}
                    </p>
                    <p class="text-sm">
                        {{ state.citizensGender?.data?.female }}
                    </p>
                </div>
                <div class="flex items-center justify-between">
                    <p class="text-sm">
                        {{ $t('overview.gender.willNotDisclose') }}
                    </p>
                    <p class="text-sm">
                        {{ state.citizensGender?.data?.will_not_disclose }}
                    </p>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const departmentStore = useDepartmentStore()

const state = reactive({
    citizensGender: [] as any,
    isPageLoading: false,
    error: {} as Error,
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizensGender()
    }
})

onMounted(() => {
    fetchCitizensGender()
})

async function fetchCitizensGender() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await dailyOverviewService.getCitizensGender(params)
        if (response) {
            state.citizensGender = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>