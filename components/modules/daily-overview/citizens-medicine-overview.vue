<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.dailyMedicineOverview.dailyMedicineOverview') }}
        </h3>

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.medicines?.data?.length === 0">
            {{ $t('dailyOverview.noMedicinesToShow') }}
        </div>

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm space-y-2 divide-y overflow-scroll min-h-96 max-h-96 pr-5 pt-4 pb-4 pl-6 mr-1"
            v-else>
            <div v-for="(medicine, index) in state.medicines?.data" :key="index" class="py-3">
                <Badge type="primary" class="w-fit">
                    <p class="text-xs px-2">
                        {{ medicine?.citizen?.firstname + ' ' + medicine?.citizen?.lastname }}
                    </p>
                </Badge>
                <p class="text-xs py-1" v-if="medicine?.user?.firstname && medicine?.user?.lastname">
                    {{ $t('dailyOverview.createdBy') }}
                    {{ medicine?.user?.firstname + ' ' + medicine?.user?.lastname }}
                </p>
                <div class="px-1 space-y-1">
                    <h3 class="text-base font-semibold">
                        {{ medicine?.medicine }}
                    </h3>
                    <div class="text-xxs flex flex-wrap gap-1" v-if="medicine.time?.length > 0">
                        <span v-for="(time, index) in JSON.parse(medicine.time)" :key=index
                            class="bg-primary px-2 py-1 text-white rounded-md">
                            {{ medicine?.daily_dose }} @
                            {{ time }}
                        </span>
                    </div>
                    <div class="text-xxs flex flex-wrap gap-1" v-if="medicine.due_dates?.length > 0">
                        <span v-for="(due_date, index) in medicine.due_dates" :key=index
                            class="bg-primary px-2 py-1 text-white rounded-md">
                            {{ formatDateToReadable(due_date) }}
                        </span>
                    </div>
                </div>
            </div>
            <div v-for="(medicine, index) in state.medicines?.data" :key="index" class="py-3">
                <Badge type="primary" class="w-fit">
                    <p class="text-xs px-2">
                        {{ medicine?.citizen?.firstname + ' ' + medicine?.citizen?.lastname }}
                    </p>
                </Badge>
                <p class="text-xs py-1" v-if="medicine?.user?.firstname && medicine?.user?.lastname">
                    {{ $t('dailyOverview.createdBy') }}
                    {{ medicine?.user?.firstname + ' ' + medicine?.user?.lastname }}
                </p>
                <div class="px-1 space-y-1">
                    <h3 class="text-base font-semibold">
                        {{ medicine?.medicine }}
                    </h3>
                    <div class="text-xxs flex flex-wrap gap-1" v-if="medicine.time?.length > 0">
                        <span v-for="(time, index) in JSON.parse(medicine.time)" :key=index
                            class="bg-primary px-2 py-1 text-white rounded-md">
                            {{ medicine?.daily_dose }} @
                            {{ time }}
                        </span>
                    </div>
                    <div class="text-xxs flex flex-wrap gap-1" v-if="medicine.due_dates?.length > 0">
                        <span v-for="(due_date, index) in medicine.due_dates" :key=index
                            class="bg-primary px-2 py-1 text-white rounded-md">
                            {{ formatDateToReadable(due_date) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    endDate: {
        type: String,
        required: false,
    },
    startDate: {
        type: String,
        required: false,
    },
})

const { formatDateToReadable } = useDatetimeFormatter()
const departmentStore = useDepartmentStore()

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    medicines: [] as any,
    searchFilter: {
        end_date: props.endDate,
        start_date: props.startDate
    }
})

watch(() => props.startDate, (date: any) => {
    if (date != null) {
        state.searchFilter.start_date = date
        fetchCitizens()
    }
})

watch(() => props.endDate, (date: any) => {
    if (date != null) {
        state.searchFilter.end_date = date
        fetchCitizens()
    }
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizens()
    }
})

onMounted(() => {
    fetchCitizens()
})

async function fetchCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (state.searchFilter.end_date && state.searchFilter.start_date) {
            params.date = {
                end_date: state.searchFilter.end_date,
                start_date: state.searchFilter.start_date
            }
        }
        const response = await dailyOverviewService.getCitizenDailyMedicineOverview(params)
        if (response) {
            state.medicines = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>