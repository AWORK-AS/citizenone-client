<template>
    <LoadingSpinner :isActive="state.isPageLoading">
        <h3 class="text-primary text-base font-medium py-2">
            {{ $t('overview.scheduleSlots') }}
        </h3>

        <Alert type="danger" :text="state?.error?.message"
            v-if="state.error?.message && state.error.message.length > 0" />

        <div>
            <div :class="[
                state.scheduleSlots?.data?.length === 0 ? 'flex items-center justify-center' : 'divide-y overflow-scroll',
                'bg-white shadow-md rounded-md border-l-8 border-primary mt-2 text-sm min-h-96 max-h-96'
            ]">
                <div class="space-y-2 pl-4 pr-5 py-5">
                    <div v-for="(slot, index) in state.scheduleSlots?.data" :key="index"
                        class="rounded-md p-1 cursor-pointer" :style="{ backgroundColor: slot?.shift?.color }"
                        @click="confirmSlotRequest(slot)">
                        <div class="border border-white rounded-md p-2 text-white">
                            <div class="flex items-center gap-x-1">
                                <p>
                                    {{ language.locale.value === 'en' ? slot?.shift?.en_name : slot?.shift?.dk_name }}
                                </p>
                                ({{ formatDateTimeToReadable(slot?.date_time_start) + ' - ' +
                                    formatDateTimeToReadable(slot?.date_time_end) }})
                            </div>
                            <div class="text-sm" v-if="slot?.departments?.length > 0">
                                {{ $t('dutySchedules.scheduleSlots.table.departments') }}:
                                <span v-for="(department, departmentIndex) in slot?.departments" :key="departmentIndex">
                                    {{ department?.name }}<span v-if="departmentIndex < slot?.departments.length - 1">,
                                    </span><span v-else>.</span>
                                </span>
                            </div>
                            <div v-for="(job_title, index) in slot?.job_titles" :key="index">
                                <span>{{ job_title?.title }}</span>
                                <div class="flex gap-1">
                                    <div v-for="(speciality, index) in job_title?.specialties" :key="index">
                                        <p class="truncate text-xxs bg-primary text-white p-1 rounded-md">
                                            {{ speciality?.job_specialty?.title }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                {{ $t('dutySchedules.scheduleSlots.table.availableShifts') }}:
                                {{ slot?.available_slots }}
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="state.scheduleSlots?.data?.length === 0">
                    <p class="mt-10 text-center">
                        {{ $t('theresNoDataAvailableToDisplay') }}.
                    </p>
                </div>
            </div>
            <ModulesUserDutyScheduleScheduleSlotsRequestAvailableSlotConfirmation
                :isModalOpen="state.modal.isRequestScheduleSlotOpen"
                :message="$t('dutySchedules.scheduleSlots.confirmation.requestConfirmation') + '?'"
                @close="state.modal.isRequestScheduleSlotOpen = false" @confirm="requestScheduleSlot" />
        </div>
    </LoadingSpinner>
</template>

<script setup lang="ts">
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { scheduleGrabberService } from '@/components/api/user/ScheduleGrabberService'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    dateRange: {
        type: Object,
        required: false,
    } as any,
})

const departmentStore = useDepartmentStore()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
let currentTablePage = 1

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isRequestScheduleSlotOpen: false
    },
    scheduleSlots: [] as any,
    selectedSlot: [] as any
})

watch(() => props.dateRange, () => {
    fetchScheduleSlots()
}, { deep: true })

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchScheduleSlots()
    }
})

onMounted(() => {
    fetchScheduleSlots()
})

async function fetchScheduleSlots() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            date_start: props.dateRange.start_date,
            date_end: props.dateRange.end_date,
            page: currentTablePage,
        }
        const response = await dailyOverviewService.getScheduleSlots(params)
        if (response) {
            state.scheduleSlots = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmSlotRequest(slot: any) {
    state.selectedSlot = slot
    state.modal.isRequestScheduleSlotOpen = true
}

async function requestScheduleSlot() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            slot_uuid: state.selectedSlot?.uuid
        }
        const response = await scheduleGrabberService.requestScheduleSlot(params)
        if (response) {
            state.modal.isRequestScheduleSlotOpen = false
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleSlots.alert.requestForThisScheduleSlotHasBennSuccessfullySent')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>