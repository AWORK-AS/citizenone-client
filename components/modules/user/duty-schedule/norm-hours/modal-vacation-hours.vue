<template>
    <div>
        <Modal size="lg" :title="$t('dutySchedules.normHours.availableVacationHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex items-center gap-x-1">
                        <p class="text-sm">
                            {{ $t('dutySchedules.normHours.date') }}
                        </p>
                        <button class="text-sm text-primary hover:text-primary-700 hover:underline"
                            @click="state.modal.isDateRangeOpen = true">
                            {{ formatDateToReadable(state.dateRange.formDateRange.start_date) }} -
                            {{ formatDateToReadable(state.dateRange.formDateRange.end_date) }}
                        </button>
                    </div>
                    <div class="mt-5 space-y-1">
                        <div class="flex items-center gap-x-1">
                            <p class="text-sm">
                                {{ $t('dutySchedules.normHours.vacationHoursThisYear') }}
                                ({{ formatDateToReadable(state.dateRange.formDateRange.start_date) }} -
                                {{ formatDateToReadable(state.dateRange.formDateRange.end_date) }}):
                            </p>
                            <p :class="[
                                state.vacationHours?.data?.current_vacation_hours > 0 ? 'text-green-700' : 'text-red-700',
                                'text-sm'
                            ]">
                                {{
                                    formatNumber(language.locale.value,
                                        state.vacationHours?.data?.current_vacation_hours || 0)
                                }}
                            </p>
                        </div>
                        <div class="flex items-center gap-x-1">
                            <p class="text-sm">
                                {{ $t('dutySchedules.normHours.vacationHoursFromPreviousYear') }}
                                ({{
                                    formatDateToReadable(moment(state.dateRange.formDateRange.start_date).subtract(1,
                                        'year').startOf('year').format('YYYY-MM-DD'))
                                }} -
                                {{
                                    formatDateToReadable(moment(state.dateRange.formDateRange.start_date).subtract(1,
                                        'year').endOf('year').format('YYYY-MM-DD'))
                                }}):
                            </p>
                            <p :class="[
                                state.vacationHours?.data?.previous_vacation_hours > 0 ? 'text-green-700' : 'text-red-700',
                                'text-sm'
                            ]">
                                {{
                                    formatNumber(language.locale.value,
                                        state.vacationHours?.data?.previous_vacation_hours || 0)
                                }}
                            </p>
                        </div>
                        <div class="flex items-center gap-x-1">
                            <p class="text-sm">
                                {{ $t('dutySchedules.normHours.totalVacationHours') }}:
                            </p>
                            <p :class="[
                                state.vacationHours?.data?.total_vacation_hours > 0 ? 'text-green-700' : 'text-red-700',
                                'text-sm'
                            ]">
                                {{
                                    formatNumber(language.locale.value,
                                        state.vacationHours?.data?.total_vacation_hours || 0)
                                }}
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 flex justify-end">
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                    <ModulesUserDutyScheduleNormHoursModalDateRange :isModalOpen="state.modal.isDateRangeOpen"
                        :dateRange="state.dateRange" @close="state.modal.isDateRangeOpen = false"
                        @filterDate="filterVacationHours" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close'])
const language = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()

const state = reactive({
    error: {} as Error,
    dateRange: {
        formDateRange: {
            start_date: moment().startOf('year').format('YYYY-MM-DD'),
            end_date: moment().endOf('year').format('YYYY-MM-DD'),
        },
    },
    isPageLoading: false,
    modal: {
        isDateRangeOpen: false,
    },
    vacationHours: {} as any,
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        fetchCompensatoryVacationHours()
    }
})

watch(() => props.selectedEmployee, (selectedEmployee) => {
    if (selectedEmployee.norm_period) {
        state.dateRange.formDateRange.start_date = moment(selectedEmployee.norm_period.period_start).format('YYYY-MM-DD')
        state.dateRange.formDateRange.end_date = moment(selectedEmployee.norm_period.period_end).format('YYYY-MM-DD')
        fetchCompensatoryVacationHours()
    }
})

function filterVacationHours(formDateRange: any) {
    state.dateRange.formDateRange.start_date = formDateRange.start_date
    state.dateRange.formDateRange.end_date = formDateRange.end_date
    fetchCompensatoryVacationHours()
}

async function fetchCompensatoryVacationHours() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            user_uuid: props.selectedEmployee.uuid,
            start_date: state.dateRange.formDateRange.start_date,
            end_date: state.dateRange.formDateRange.end_date,
        }
        const response = await dutyScheduleService.getCompensatoryVacationHours(params)
        if (response) {
            state.vacationHours = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>