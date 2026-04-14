<template>
    <div>
        <Modal size="lg" :title="$t('dutySchedules.distributionOfShiftTypes')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="flex flex-col md:flex-row gap-x-1 flex-wrap font-medium">
                            <p class="text-sm">
                                {{ $t('dutySchedules.typeOfShifts') }}:
                            </p>
                            <button class="w-fit text-xs text-primary hover:text-primary-700 hover:underline"
                                @click="state.modal.isDepartmentSickLeaveDateRangeOpen = true">
                                ({{ formatDateTimeToReadable(state.formFilter.date_time_start) }} -
                                {{ formatDateTimeToReadable(state.formFilter.date_time_end) }})
                            </button>
                        </div>
                        <div>
                            <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-x-4 text-sm">
                                <div class="flex items-center justify-between gap-x-2"
                                    v-for="(shiftPercentage, index) in state.shiftPercentage?.data" :key="index">
                                    <div class="flex items-center gap-x-2">
                                        <div class="w-3 h-3 rounded-sm"
                                            :style="{ backgroundColor: shiftPercentage?.color }">
                                        </div>
                                        <span>
                                            {{ language.locale.value === 'en' ? shiftPercentage?.en_name :
                                                shiftPercentage?.dk_name }}
                                        </span>
                                    </div>
                                    <p class="text-xs">{{ shiftPercentage?.percentage }}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-4 flex justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
                <ModulesUserDutyScheduleModalShiftDistributionFilter
                    :isModalOpen="state.modal.isDepartmentSickLeaveDateRangeOpen" :formFilter="state.formFilter"
                    @close="state.modal.isDepartmentSickLeaveDateRangeOpen = false"
                    @filterDistribution="filterShiftDistribution" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useDepartmentStore } from '@/store/department'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { formatDateTimeToReadable } = useDatetimeFormatter()
const departmentStore = useDepartmentStore()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    formFilter: {
        date_time_end: moment().endOf('isoWeek').hour(17).minute(0).second(0).millisecond(0),
        date_time_start: moment().startOf('isoWeek').hour(8).minute(0).second(0).millisecond(0),
        employee_uuid: '',
    } as any,
    isPageLoading: false,
    modal: {
        isDepartmentSickLeaveDateRangeOpen: false,
    },
    shiftPercentage: {} as any,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        fetchDutySchedulePercentage()
    }
})

async function fetchDutySchedulePercentage() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            date_time_start: moment(state.formFilter.date_time_start).format('YYYY-MM-DD HH:mm'),
            date_time_end: moment(state.formFilter.date_time_end).format('YYYY-MM-DD HH:mm'),
            department: departmentStore.getSelectedDepartmentName,
            employee_uuid: state.formFilter.employee_uuid,
        }
        const response = await dutyScheduleService.getDutyScheduleAbsencePercentage(params)
        if (response) {
            state.shiftPercentage = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function filterShiftDistribution(formShiftDistribution: any) {
    state.formFilter.date_time_start = formShiftDistribution.date_time_start
    state.formFilter.date_time_end = formShiftDistribution.date_time_end
    state.formFilter.employee_uuid = formShiftDistribution.employee_uuid
    fetchDutySchedulePercentage()
}
</script>