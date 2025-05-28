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
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        citizens: [],
        in_meeting: false,
        use_compensatory_time: false,
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
        state.formShift.date_time_start = moment(`${moment(selectedEmployeeSchedule?.date).format('YYYY-MM-DD')} ${selectedEmployeeSchedule?.time_in}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD H:mm')
        state.formShift.date_time_end = moment(`${moment(selectedEmployeeSchedule?.date).format('YYYY-MM-DD')} ${selectedEmployeeSchedule?.time_out}`, 'YYYY-MM-DD HH:mm').format('YYYY-MM-DD H:mm')
        state.formShift.in_meeting = selectedEmployeeSchedule?.in_meeting
        state.formShift.citizens = []
        selectedEmployeeSchedule?.citizen_schedules?.forEach((citizenSchedule: any) => {
            state.formShift.citizens.push(citizenSchedule.citizen.uuid)
        })
    }
})

function closeModal() {
    emit('close')
}

async function updateShift(shiftDetails: any) {
    emit('updateShift', shiftDetails)
}
</script>