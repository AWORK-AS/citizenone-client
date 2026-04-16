<template>
    <div>
        <Modal size="lg" :title="$t('dutySchedules.newSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <div class="flex flex-col md:flex-row gap-x-1 flex-wrap font-medium">
                            <p>
                                {{ $t('dutySchedules.typeOfShifts') }}:
                            </p>
                            <button class="w-fit text-xs text-primary hover:text-primary-700 hover:underline"
                                @click="state.modal.isDepartmentSickLeaveDateRangeOpen = true">
                                ({{ formatDateToReadable(state.shiftDateRange.formDateRange.start_date) }} -
                                {{ formatDateToReadable(state.shiftDateRange.formDateRange.end_date) }})
                            </button>
                        </div>
                        <div>
                            <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-x-4 text-sm">
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
                <ModulesUserDutyScheduleModalShiftDateRange
                    :isModalOpen="state.modal.isDepartmentSickLeaveDateRangeOpen" :dateRange="state.shiftDateRange"
                    @close="state.modal.isDepartmentSickLeaveDateRangeOpen = false"
                    @filterDate="filterShiftTypesByDateRange" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { draftScheduleService } from '@/components/api/user/DraftScheduleService'
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
const { formatDateToReadable } = useDatetimeFormatter()
const departmentStore = useDepartmentStore()
const language = useI18n()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isDepartmentSickLeaveDateRangeOpen: false,
    },
    shiftDateRange: {
        formDateRange: {
            start_date: moment().startOf('week').add(1, 'day'),
            end_date: moment().startOf('week').add(7, 'day'),
        },
    } as any,
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
            start_date: moment(state.shiftDateRange.formDateRange.start_date).format('YYYY-MM-DD'),
            end_date: moment(state.shiftDateRange.formDateRange.end_date).format('YYYY-MM-DD'),
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await draftScheduleService.getDraftDutyScheduleAbsencePercentage(params)
        if (response) {
            state.shiftPercentage = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function filterShiftTypesByDateRange(formDateRange: any) {
    state.shiftDateRange.formDateRange.start_date = formDateRange?.[0]
    state.shiftDateRange.formDateRange.end_date = formDateRange?.[1]
    fetchDutySchedulePercentage()
}
</script>