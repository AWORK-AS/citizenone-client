<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.citizensOrigin') }}
        </h3>
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.citizensOrigin?.data?.length === 0">
            {{ $t('dailyOverview.noDataToDisplay') }}
        </div>
        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm divide-y overflow-scroll min-h-96 max-h-96"
            v-else>
            <div v-for="(citizen, index) in state.citizensOrigin?.data" :key="index">
                <div class="flex gap-x-2 pl-4 pr-3 py-4 cursor-pointer hover:bg-gray-100"
                    @click="navigateTo(`/citizens/${citizen?.uuid}/journals`)">
                    <img :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                        class="rounded-full w-12 h-12 object-cover" />
                    <div>
                        <p class="text-sm font-medium text-primary">
                            {{ citizen?.firstname + ' ' + citizen?.lastname }}
                        </p>
                        <p class="text-xxs text-muted-400 mt-1">
                            {{ citizen?.email }}
                        </p>
                        <p class="flex items-center gap-x-1 text-xs text-muted-400 mt-1">
                            <Icon name="ph:map-pin-area" class="h-4 w-4" aria-hidden="true" />
                            <span v-if="citizen?.origin">
                                {{ citizen?.origin?.name }}
                            </span>
                            <span v-else>
                                {{ citizen?.foreign_city?.name }}
                            </span>
                        </p>
                    </div>
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
    citizensOrigin: [] as any,
    isPageLoading: false,
    error: {} as Error,
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizensOrigin()
    }
})

onMounted(() => {
    fetchCitizensOrigin()
})

async function fetchCitizensOrigin() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await dailyOverviewService.getCitizensOrigin(params)
        if (response) {
            state.citizensOrigin = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>