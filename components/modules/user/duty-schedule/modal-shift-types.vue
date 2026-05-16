<template>
    <div>
        <Modal size="lg" :title="modalTitle" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="flex flex-col md:flex-row gap-x-1 flex-wrap font-medium">
                            <Icon name="ph:sliders-horizontal" class="w-4 h-4" />
                            <button class="w-fit text-xs text-primary hover:text-primary-700 hover:underline"
                                @click="state.modal.isDepartmentSickLeaveDateRangeOpen = true">
                                ({{ formatDateTimeToReadable(state.formFilter.date_time_start) }} -
                                {{ formatDateTimeToReadable(state.formFilter.date_time_end) }})
                            </button>
                        </div>
                        <p class="text-sm">
                            {{ $t('dutySchedules.typeOfShifts') }}:
                        </p>
                        <div>
                            <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-x-4 text-sm">
                                <div class="flex items-center justify-between gap-x-2"
                                    v-for="(shiftDistribution, index) in state.shiftDistributions?.data" :key="index">
                                    <div class="flex items-center gap-x-2">
                                        <div class="w-3 h-3 rounded-sm"
                                            :style="{ backgroundColor: shiftDistribution?.shift_type?.color }">
                                        </div>
                                        <span>
                                            {{ language.locale.value === 'en' ? shiftDistribution?.shift_type?.en_name : language.locale.value === 'no' ? shiftDistribution?.shift_type?.no_name : language.locale.value === 'sv' ? shiftDistribution?.shift_type?.sv_name : shiftDistribution?.shift_type?.dk_name }}
                                        </span>
                                    </div>
                                    <p class="text-xs">
                                        <span>
                                            {{ formatNumber(language.locale.value, shiftDistribution?.hours_worked) }}
                                        </span>
                                        <span>
                                            ({{ formatNumber(language.locale.value, shiftDistribution?.percentage) }}%)
                                        </span>
                                    </p>
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
                    :selectedEmployee="state.selectedEmployee"
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
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: false,
    },
})

const emit = defineEmits(['close'])
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const departmentStore = useDepartmentStore()
const { t } = useI18n()
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
    selectedEmployee: null as any,
    shiftDistributions: {} as any,
})


watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen && !props.selectedEmployee) {
        fetchDutySchedulePercentage()
    }
})

watch(() => props.selectedEmployee, (selectedEmployee) => {
    if (selectedEmployee) {
        state.selectedEmployee = selectedEmployee
        state.formFilter.employee_uuid = selectedEmployee?.uuid
        fetchDutySchedulePercentage()
    }
})

function closeModal() {
    emit('close')
}

const modalTitle = computed(() => {
    return state.selectedEmployee?.value === 'all-employees' ||
        state.selectedEmployee === null
        ? t('dutySchedules.distributionOfShiftTypes')
        : `${t('dutySchedules.distributionOfShiftTypes')} (${state.selectedEmployee?.firstname + ' ' + (state.selectedEmployee?.lastname ?? '')})`
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
        const response = await dutyScheduleService.getShiftTypesDistribution(params)
        if (response) {
            state.shiftDistributions = response
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
    state.selectedEmployee = formShiftDistribution.employee
    fetchDutySchedulePercentage()
}
</script>