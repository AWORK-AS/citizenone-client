<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleFormShift formType="create" :error="props.error"
                        :selectedEmployee="props.selectedEmployee" :selectedShift="state.formShift"
                        @close="closeModal()" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @saveShift="saveShift" />
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
    selectedDate: {
        type: String,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'saveShift', 'resetNewShiftError'])
const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShift: {
        shift_type: '',
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        citizens: [],
        schedule_tag_uuid: [],
        department_uuid: [],
        use_compensatory_time: false,
        note: '',
    },
})

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        emit('resetNewShiftError')
        state.formShift.date_time_start = moment(props.selectedDate).startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm')
        state.formShift.date_time_end = moment(props.selectedDate).startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm')
    }
})

function closeModal() {
    emit('close')
}

async function saveShift(shiftDetails: any) {
    emit('saveShift', shiftDetails)
}
</script>