<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="warning"
                    :text="locale === 'en' ? props.selectedEmployee?.average_weekly_work_time?.message_en : props.selectedEmployee?.average_weekly_work_time?.message_dk"
                    v-if="props.selectedEmployee?.average_weekly_work_time?.severity && props.selectedEmployee?.average_weekly_work_time?.severity !== 'info'" />
                <LoadingSpinner :isActive="props.isModalLoading || state.isPageLoading">
                    <ModulesUserDutyScheduleFormShift formType="create" :error="props.error"
                        :selectedEmployee="props.selectedEmployee" :selectedShift="state.formShift"
                        @dateTimeChange="dateTimeChange" @close="closeModal()"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @saveShift="saveShift" />

                    <ModulesUserDutyScheduleModalShiftWarning :isModalOpen="props.showWarningDialog"
                        :warnings="props.shiftWarnings" @close="emit('closeWarningDialog')" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    isModalLoading: {
        type: Boolean,
        required: true,
        default: false,
    },
    selectedDate: {
        type: String,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
    showWarningDialog: {
        type: Boolean,
        required: false,
        default: false,
    },
    shiftWarnings: {
        type: Object,
        required: false,
        default: () => [],
    },
})

const emit = defineEmits(['close', 'saveShift', 'resetNewShiftError', 'dateTimeChange', 'closeWarningDialog'])
const { locale } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShift: {
        shift_type: '',
        is_sleeping_sick_leave: false,
        do_not_count_weekends: false,
        is_mark_as_leave: false,
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
        citizens: [],
        schedule_tag_uuid: [],
        department_uuid: [],
        use_compensatory_time: false,
        note: '',
        do_not_count_sick_leave: false,
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

function dateTimeChange(employeeUuid: string, newDateTimeStart: string, newDateTimeEnd: string) {
    emit('dateTimeChange', employeeUuid, newDateTimeStart, newDateTimeEnd)
}

async function saveShift(shiftDetails: any) {
    emit('saveShift', shiftDetails)
}
</script>