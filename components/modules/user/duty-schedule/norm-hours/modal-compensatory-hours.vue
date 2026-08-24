<template>
    <div>
        <Modal size="lg" :title="$t('dutySchedules.normHours.compensatoryHoursThisYear')"
            :show="props.isModalOpen && !state.modal.isPayoutOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message" class="mb-3"
                        v-if="state.error?.message && state.error.message.length > 0" />
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
                                {{ $t('dutySchedules.normHours.compensatoryHoursThisPeriod') }}
                                ({{ formatDateToReadable(state.dateRange.formDateRange.start_date) }} -
                                {{ formatDateToReadable(state.dateRange.formDateRange.end_date) }}):
                            </p>
                            <p :class="[
                                state.compensatoryHours?.data?.current_compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                                'text-sm'
                            ]">
                                {{
                                    formatNumber(language.locale.value,
                                        state.compensatoryHours?.data?.current_compensatory_hours || 0)
                                }}
                            </p>
                        </div>
                        <div class="flex items-center gap-x-1" v-if="carryOverEnabled">
                            <p class="text-sm">
                                {{ $t('dutySchedules.normHours.compensatoryHourFromPreviousYear') }}<template
                                    v-if="previousPeriod">
                                    ({{ formatDateToReadable(previousPeriod.start_date) }} -
                                    {{ formatDateToReadable(previousPeriod.end_date) }})</template>:
                            </p>
                            <p :class="[
                                state.compensatoryHours?.data?.previous_compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                                'text-sm'
                            ]">
                                {{
                                    formatNumber(language.locale.value,
                                        state.compensatoryHours?.data?.previous_compensatory_hours || 0)
                                }}
                            </p>
                        </div>
                        <div class="flex items-center gap-x-1" v-if="carryOverEnabled">
                            <p class="text-sm">
                                {{ $t('dutySchedules.normHours.totalCompensatoryHours') }}:
                            </p>
                            <p :class="[
                                state.compensatoryHours?.data?.total_compensatory_hours > 0 ? 'text-green-700' : 'text-red-700',
                                'text-sm'
                            ]">
                                {{
                                    formatNumber(language.locale.value,
                                        state.compensatoryHours?.data?.total_compensatory_hours || 0)
                                }}
                            </p>
                        </div>
                    </div>
                    <div class="mt-5 flex justify-end gap-x-3">
                        <FormButton v-if="canRegisterPayout" buttonStyle="action"
                            @click="state.modal.isPayoutOpen = true">
                            {{ $t('dutySchedules.normHours.payout.button') }}
                        </FormButton>
                        <FormButton buttonStyle="cancel" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
                <ModulesUserDutyScheduleNormHoursModalDateRange :isModalOpen="state.modal.isDateRangeOpen"
                    :dateRange="state.dateRange" @close="state.modal.isDateRangeOpen = false"
                    @filterDate="filterCompensatoryHours" />
            </template>
        </Modal>
        <ModulesUserDutyScheduleNormHoursModalRegisterPayout :isModalOpen="state.modal.isPayoutOpen"
            :selectedEmployee="props.selectedEmployee" @close="state.modal.isPayoutOpen = false"
            @success="fetchCompensatoryVacationHours" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { useNumberFormatter } from '@/composables/numberFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
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
const userStore = useUserStore() as any
const { formatDateToReadable } = useDatetimeFormatter()
const { formatNumber } = useNumberFormatter()
const { isAtLeast, can } = usePermissions()

const canRegisterPayout = computed(() => isAtLeast('Admin') || can('register_time_account_payout'))

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
        isPayoutOpen: false,
    },
    compensatoryHours: {} as any,
})

// Carry-over is measured over the whole preceding norm period, which cannot be
// derived here: for a custom norm period it is the employee's prior cycle (e.g.
// 1 May 2025 – 30 Apr 2026) and the frontend has no norm-period data per employee.
// Render only the window the backend says it used, and show no range at all rather
// than guess if the response omits it.
const previousPeriod = computed(() => {
    const data = state.compensatoryHours?.data
    if (!data?.previous_period_start || !data?.previous_period_end) return null
    return { start_date: data.previous_period_start, end_date: data.previous_period_end }
})

// With transfer_norm_hours_enabled off the backend returns no carry-over at all, so
// the previous and total rows would just restate the current period as "0,00".
const carryOverEnabled = computed(() => !!userStore.getUser?.company?.transfer_norm_hours_enabled)

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        fetchCompensatoryVacationHours()
    }
})

watch(() => props.selectedEmployee, (selectedEmployee) => {
    // Guard on the two dates, not just on norm_period being present: the relation can
    // serialize without usable accessors, and moment(undefined) silently resolves to
    // *today* — which would query a one-day range instead of the norm period, with no
    // error anywhere. A null accessor is just as bad: it formats to "Invalid date".
    const normPeriod = selectedEmployee?.norm_period
    if (normPeriod?.period_start && normPeriod?.period_end) {
        state.dateRange.formDateRange.start_date = moment(normPeriod.period_start).format('YYYY-MM-DD')
        state.dateRange.formDateRange.end_date = moment(normPeriod.period_end).format('YYYY-MM-DD')
        fetchCompensatoryVacationHours()
    }
})

function filterCompensatoryHours(formDateRange: any) {
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
            state.compensatoryHours = response
        }
    } catch (error: any) {
        state.error = error
        // The endpoint now 404s employee_not_found for a uuid outside the caller's
        // company; keeping the previous payload would show one employee's figures
        // under another's name.
        state.compensatoryHours = {}
    }
    state.isPageLoading = false
}
</script>