<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('dailyOverview.dailyMedicineOverview.dailyMedicineOverview') }}
        </h3>

        <div class="border-2 border-gray-300 border-dashed rounded-md flex items-center justify-center min-h-96 max-h-96 text-sm mt-2"
            v-if="state.medicines?.data?.length === 0">
            {{ $t('dailyOverview.noMedicinesToShow') }}
        </div>

        <div class="bg-white shadow-md rounded-md border-l-8 border-secondary mt-2 text-sm divide-y overflow-scroll min-h-96 max-h-96"
            v-else>
            <div v-for="(medicine, index) in state.medicines?.data" :key="index"
                class="pl-4 pr-3 py-5 cursor-pointer hover:bg-gray-100" @click="viewMedicineHistory(medicine)">
                <div>
                    <div>
                        <div>
                            <div class="flex items-center gap-x-2">
                                <img :src="medicine?.citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${medicine?.citizen?.firstname + ' ' + medicine?.citizen?.lastname}`"
                                    :class="[
                                        medicine?.citizen.latest_risk_assessment === null && 'border-secondary',
                                        medicine?.citizen.latest_risk_assessment?.assessment === 'no risk' && 'border-green-700',
                                        medicine?.citizen.latest_risk_assessment?.assessment === 'increased risk' && 'border-yellow-500',
                                        medicine?.citizen.latest_risk_assessment?.assessment === 'acute increased risk' && 'border-red-600',
                                        'rounded-full w-12 h-12 object-cover border-2'
                                    ]" />
                                <span>{{ medicine?.citizen?.firstname + ' ' + medicine?.citizen?.lastname }}</span>
                            </div>
                            <Badge type="primary" class="flex items-center w-fit mt-1" v-if="medicine?.is_pn_medicine">
                                <p class="text-xxs px-2">
                                    {{ $t('citizens.medicineJournals.table.pnMedicine') }}
                                </p>
                            </Badge>
                            <div class="mt-1">
                                <Badge type="primary" class="w-fit" v-if="medicine.is_self_administered">
                                    <p class="text-xxs">
                                        {{
                                            $t('citizens.medicineJournals.form.selfAdminister')
                                        }}
                                    </p>
                                </Badge>
                            </div>
                            <h3 class="text-base font-semibold">
                                {{ language.locale.value === 'en' ? medicine?.medicine?.en_name
                                    : medicine?.medicine?.dk_name }}
                            </h3>
                            <div class="text-xxs flex flex-wrap gap-x-1 gap-y-3 py-1"
                                v-if="medicine.due_dates?.length > 0">
                                <Tooltip v-for="(due_date, dueDateIndex) in medicine.due_dates" :key="dueDateIndex"
                                    :text="(() => {
                                        switch (due_date?.status) {
                                            case 'delivered':
                                                return $t('dailyOverview.dailyMedicineOverview.delivered');
                                            case 'deviated':
                                                return $t('dailyOverview.dailyMedicineOverview.deviated');
                                            case 'given':
                                                return $t('dailyOverview.dailyMedicineOverview.given');
                                            default:
                                                return $t('dailyOverview.dailyMedicineOverview.notGiven');
                                        }
                                    })()">
                                    <span :class="[
                                        due_date?.status === null && 'bg-secondary',
                                        due_date?.status === 'delivered' && 'bg-primary',
                                        due_date?.status === 'deviated' && 'bg-red-600',
                                        due_date?.status === 'given' && 'bg-green-700',
                                        'px-2 py-1 text-white rounded-md'
                                    ]">
                                        {{ formatDateToReadable(due_date?.date) }} @
                                        {{ due_date?.time }}
                                    </span>
                                </Tooltip>
                            </div>
                            <p class="text-xxs mt-0.5" v-if="medicine?.user?.firstname && medicine?.user?.lastname">
                                {{ $t('dailyOverview.createdBy') }}
                                {{ medicine?.user?.firstname + ' ' + medicine?.user?.lastname }}
                            </p>
                        </div>
                    </div>
                </div>
                <div class="mt-2 px-1 space-y-1">
                    <div class="text-xxs flex flex-wrap gap-1" v-if="medicine.time?.length > 0">
                        <span v-for="(time, index) in JSON.parse(medicine.time)" :key=index
                            class="bg-primary px-2 py-1 text-white rounded-md">
                            {{ medicine?.daily_dose }} @
                            {{ time }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        <ModulesUserCitizenMedicineHistoryModalHistory :isModalOpen="state.modal.isViewMedicineOpen"
            :selectedMedicine="state.selectedMedicine" @close="state.modal.isViewMedicineOpen = false" />
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    },
})

const { formatDateToReadable } = useDatetimeFormatter()
const departmentStore = useDepartmentStore()
const language = useI18n()

const state = reactive({
    isPageLoading: false,
    error: {} as Error,
    medicines: [] as any,
    modal: {
        isViewMedicineOpen: false,
    },
    selectedMedicine: {} as any,
})

watch(() => props.dateRange, () => {
    fetchCitizensMedicines()
}, { deep: true })

watch(() => state.modal.isViewMedicineOpen, (isViewMedicineOpen: boolean) => {
    if (!isViewMedicineOpen) {
        fetchCitizensMedicines()
    }
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchCitizensMedicines()
    }
})

onMounted(() => {
    fetchCitizensMedicines()
})

async function fetchCitizensMedicines() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params: any = {
            department: departmentStore.getSelectedDepartmentName
        }

        if (props.dateRange) {
            params.end_date = props.dateRange.end_date
            params.start_date = props.dateRange.start_date
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

function viewMedicineHistory(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isViewMedicineOpen = true
}
</script>