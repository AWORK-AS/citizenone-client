<template>
    <div>
        <Modal size="sm" :title="$t('dutySchedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="warning"
                    :text="locale === 'en' ? props.selectedEmployee?.average_weekly_work_time?.message_en : props.selectedEmployee?.average_weekly_work_time?.message_dk"
                    v-if="props.selectedEmployee?.average_weekly_work_time?.severity && props.selectedEmployee?.average_weekly_work_time?.severity !== 'info'" />
                
                <!-- Inline shift warnings -->
                <div v-if="props.shiftWarnings && props.shiftWarnings.length > 0" 
                    class="mb-4 rounded-md bg-yellow-50 border border-yellow-200 p-4">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <Icon name="heroicons:exclamation-triangle" class="h-5 w-5 text-yellow-400" aria-hidden="true" />
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-yellow-800">
                                {{ $t('dutySchedules.shiftWarning.warningsFound') }}
                            </h3>
                            <div class="mt-2 text-sm text-yellow-700">
                                <ul class="list-disc space-y-1 pl-5">
                                    <li v-for="(item, index) in props.shiftWarnings" :key="index">
                                        {{ locale === 'en' ? item?.message_en : item?.message_dk }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <LoadingSpinner :isActive="props.isModalLoading || state.isPageLoading">
                    <ModulesUserDutyScheduleFormShift formType="create" :error="props.error"
                        :selectedEmployee="props.selectedEmployee" :selectedShift="state.formShift"
                        @dateTimeChange="dateTimeChange" @close="closeModal()"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @saveShift="saveShift" />
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
    shiftWarnings: {
        type: Object,
        required: false,
        default: () => [],
    },
})

const emit = defineEmits(['close', 'saveShift', 'resetNewShiftError', 'resetShiftWarnings', 'dateTimeChange'])
const { locale } = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formShift: {
        shift_type: '',
        is_sleeping_sick_leave: false,
        do_not_count_weekends: false,
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
        emit('resetShiftWarnings')
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