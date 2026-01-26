<template>
    <div>
        <Modal size="xs" :title="`${$t('filterDate.filterDate')}`" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="filterDailyOverview" class="mt-3">
                        <div class="space-y-3">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div class="space-y-1">
                                <div class="flex justify-end">
                                    <div class="flex items-center space-x-3">
                                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-700"
                                            @click="setToday">
                                            {{ $t('filterDate.setToday') }}
                                        </span>
                                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-700"
                                            @click="setNext7Days">
                                            {{ $t('filterDate.setNext7Days') }}
                                        </span>
                                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-700"
                                            @click="setCustom">
                                            {{ $t('filterDate.custom') }}
                                        </span>
                                    </div>
                                </div>
                                <FormDateRangeField name="date_range" :placeholder="$t('filterDate.filterDate')"
                                    v-model="state.filter.date_range" />
                                <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md w-full">
                                    {{ $t('filter') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { dailyOverviewService } from '@/components/api/user/DailyOverviewService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import type { Error } from '@/types'
import { useI18n } from "vue-i18n"

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    dateRange: {
        type: Object,
        required: true,
    }
})

const { t } = useI18n()
const emit = defineEmits(['close', 'filterDate'])

const state = reactive({
    error: {} as Error,
    filter: {
        type: 'today', // custom | next_7_days | today
        date_range: [] as any,
    },
    isPageLoading: false,
    formDateRange: {
        start_date: props.dateRange?.formDateRange?.start_date,
        end_date: props.dateRange?.formDateRange?.end_date,
    },
})

watch(() => props.isModalOpen, (isModalOpen) => {
    if (isModalOpen) {
        const startDate = moment(props?.dateRange?.formDateRange?.start_date).format('YYYY-MM-DD')
        const endDate = moment(props?.dateRange?.formDateRange?.end_date).format('YYYY-MM-DD')
        state.error = {}
        state.filter.date_range = [startDate, endDate]
    }
})

watch(() => props.dateRange?.formDateRange, (formDateRange) => {
    if (formDateRange) {
        const startDate = moment(formDateRange?.start_date).format('YYYY-MM-DD')
        const endDate = moment(formDateRange?.end_date).format('YYYY-MM-DD')
        state.error = {}
        state.filter.date_range = [startDate, endDate]
    }
})

watch(() => state.filter.date_range, (dates: any) => {
    state.formDateRange.start_date = dates?.[0]
    state.formDateRange.end_date = dates?.[1]
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function setToday() {
    state.filter.type = 'today'
    const today = moment().format('YYYY-MM-DD')
    state.filter.date_range = [today, today]
}

function setNext7Days() {
    state.filter.type = 'next_7_days'
    const firstDayOfTheWeek = moment().add(1, 'week').startOf('isoWeek').format('YYYY-MM-DD')
    const lastDayOfTheWeek = moment().add(1, 'week').endOf('isoWeek').format('YYYY-MM-DD')
    state.filter.date_range = [firstDayOfTheWeek, lastDayOfTheWeek]
}

function setCustom() {
    state.filter.type = 'custom'
}

async function filterDailyOverview() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            const params = {} as any
            if (state.filter.type === 'today') {
                params.filter_type = 'today'
            } else if (state.filter.type === 'next_7_days') {
                params.filter_type = 'next_7_days'
            } else {
                params.filter_type = 'custom'
                params.overview_date_start = state.formDateRange.start_date
                params.overview_date_end = state.formDateRange.end_date
            }
            const response = await dailyOverviewService.updateDateFilter(params)
            if (response.data) {
                emit('filterDate', state.formDateRange)
                closeModal()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>
