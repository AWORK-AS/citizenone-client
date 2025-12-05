<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.editSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleFormShift formType="update" :error="props.error"
                        :selectedEmployee="props.selectedEmployee" :selectedShift="state.formShift"
                        @close="closeModal()" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @saveShift="updateShift" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
    selectedEmployeeSchedule: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'updateShift', 'resetEditShiftError'])
const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShift: {
        shift_type: '',
        is_sleeping_sick_leave: false,
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        recurring: {
            is_recurring: false,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
            is_apply_to_all: false,
        },
        citizens: [] as any,
        schedule_tag_uuid: [] as any,
        department_uuid: [] as any,
        use_compensatory_time: false,
        note: '',
        do_no_count_sick_leave: false,
    },
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        emit('resetEditShiftError')
    }
})

watch(() => props.selectedEmployeeSchedule, (selectedEmployeeSchedule: any) => {
    if (selectedEmployeeSchedule) {
        state.formShift.shift_type = selectedEmployeeSchedule?.shift_type?.uuid
        state.formShift.is_sleeping_sick_leave = selectedEmployeeSchedule?.is_sleeping_sick_leave ? true : false
        state.formShift.date_time_start = moment(selectedEmployeeSchedule?.date_time_start).format('YYYY-MM-DD H:mm')
        state.formShift.date_time_end = moment(selectedEmployeeSchedule?.date_time_end).format('YYYY-MM-DD H:mm')
        state.formShift.citizens = []
        selectedEmployeeSchedule?.citizen_schedules?.forEach((citizenSchedule: any) => {
            state.formShift.citizens.push(citizenSchedule.citizen.uuid)
        })
        state.formShift.schedule_tag_uuid = []
        state.formShift.department_uuid = []
        selectedEmployeeSchedule?.tags?.forEach((tag: any) => {
            state.formShift.schedule_tag_uuid.push(tag.uuid)
        })
        selectedEmployeeSchedule?.departments?.forEach((department: any) => {
            state.formShift.department_uuid.push(department.uuid)
        })
        state.formShift.note = selectedEmployeeSchedule?.note
        state.formShift.do_no_count_sick_leave = selectedEmployeeSchedule?.do_no_count_sick_leave
        state.formShift.recurring.is_recurring = selectedEmployeeSchedule?.recurring.is_recurring
    }
})

function closeModal() {
    emit('close')
}

async function updateShift(shiftDetails: any) {
    emit('updateShift', shiftDetails)
}
</script>