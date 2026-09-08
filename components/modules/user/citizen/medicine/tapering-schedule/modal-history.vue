<template>
    <div>
        <Modal size="2xl" :title="$t('citizens.medicineJournals.taperingSchedule.viewSchedule')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div v-if="state.isLoading" class="flex justify-center py-8">
                        <Icon name="ph:spinner" class="size-6 text-primary animate-spin" />
                    </div>
                    <div v-else-if="!state.schedules?.data?.length"
                        class="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center py-10 text-sm text-gray-400">
                        {{ $t('citizens.medicineJournals.taperingSchedule.noSchedulesRecorded') }}
                    </div>
                    <div v-else class="space-y-4">
                        <div v-for="(schedule, scheduleIndex) in state.schedules?.data" :key="scheduleIndex"
                            class="rounded-xl border border-gray-200 overflow-hidden">
                            <div class="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                <div class="flex items-center gap-3">
                                    <span :class="[
                                        'text-xs px-2 py-0.5 rounded-full font-medium',
                                        statusBadgeClass(schedule.status)
                                    ]">
                                        {{ $t(`citizens.medicineJournals.taperingSchedule.status${statusLabel(schedule.status)}`) }}
                                    </span>
                                    <p v-if="schedule.reason" class="text-xs text-gray-500 italic">
                                        "{{ schedule.reason }}"
                                    </p>
                                </div>
                                <div class="flex items-center gap-2">
                                    <span class="text-xs text-gray-400">
                                        {{ schedule.created_by?.firstname }} {{ schedule.created_by?.lastname }}
                                    </span>
                                    <button type="button"
                                        class="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                                        @click="confirmScheduleDeletion(schedule)">
                                        <Icon name="ph:trash" class="size-3.5" />
                                    </button>
                                </div>
                            </div>
                            <div class="px-4 py-3 space-y-2">
                                <div v-for="(step, stepIndex) in schedule.steps" :key="stepIndex"
                                    class="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                    <div class="flex items-center gap-2">
                                        <Icon :name="step.status === 'applied' ? 'ph:check-circle' : 'ph:clock'"
                                            :class="step.status === 'applied' ? 'text-green-500' : 'text-gray-400'"
                                            class="size-4 shrink-0" />
                                        <div>
                                            <p class="text-xs font-medium text-gray-700">
                                                {{ $t('citizens.medicineJournals.taperingSchedule.stepNumber') }}
                                                {{ step.step_number }} — {{ formatDateToReadable(step.effective_date) }}
                                            </p>
                                            <p class="text-xs text-gray-500">
                                                <span v-if="step.strength">{{ step.strength }}</span>
                                                <span v-if="step.max_daily_dose"> · {{ step.max_daily_dose }}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button v-if="step.status !== 'applied'" type="button"
                                        class="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 shrink-0"
                                        @click="confirmStepDeletion(schedule, step)">
                                        <Icon name="ph:x" class="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogConfirmation :isModalOpen="state.modal.isDeleteScheduleOpen"
                    :message="$t('citizens.medicineJournals.taperingSchedule.confirmDeleteSchedule') + '?'"
                    @close="state.modal.isDeleteScheduleOpen = false" @confirm="deleteSchedule" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteStepOpen"
                    :message="$t('citizens.medicineJournals.taperingSchedule.confirmDeleteStep') + '?'"
                    @close="state.modal.isDeleteStepOpen = false" @confirm="deleteStep" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { medicineTaperingScheduleService } from '@/components/api/user/MedicineTaperingScheduleService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
    selectedMedicine: { type: Object, required: true },
})

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const emit = defineEmits(['close', 'refreshMedicines'])

const state = reactive({
    schedules: [] as any,
    error: {} as Error,
    isLoading: false,
    modal: {
        isDeleteScheduleOpen: false,
        isDeleteStepOpen: false,
    },
    selectedSchedule: {} as any,
    selectedStep: {} as any,
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchSchedules()
    }
})

function closeModal() {
    emit('close')
}

function statusLabel(status: string) {
    return status === 'in_progress' ? 'InProgress' : status.charAt(0).toUpperCase() + status.slice(1)
}

function statusBadgeClass(status: string) {
    if (status === 'completed') return 'bg-green-100 text-green-700'
    if (status === 'in_progress') return 'bg-amber-100 text-amber-700'
    return 'bg-gray-100 text-gray-600'
}

async function fetchSchedules() {
    state.error = {} as Error
    state.isLoading = true
    try {
        const response = await medicineTaperingScheduleService.getTaperingSchedules(props.selectedMedicine?.uuid)
        if (response) state.schedules = response
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function confirmScheduleDeletion(schedule: any) {
    state.selectedSchedule = schedule
    state.modal.isDeleteScheduleOpen = true
}

async function deleteSchedule() {
    state.error = {} as Error
    state.isLoading = true
    try {
        await medicineTaperingScheduleService.deleteTaperingSchedule(props.selectedMedicine?.uuid, state.selectedSchedule.uuid)
        fetchSchedules()
        emit('refreshMedicines')
        successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.taperingSchedule.alert.successfullyDeleted')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

function confirmStepDeletion(schedule: any, step: any) {
    state.selectedSchedule = schedule
    state.selectedStep = step
    state.modal.isDeleteStepOpen = true
}

async function deleteStep() {
    state.error = {} as Error
    state.isLoading = true
    try {
        await medicineTaperingScheduleService.deleteTaperingScheduleStep(
            props.selectedMedicine?.uuid,
            state.selectedSchedule.uuid,
            state.selectedStep.uuid
        )
        fetchSchedules()
        emit('refreshMedicines')
        successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.taperingSchedule.alert.successfullyDeletedStep')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

defineExpose({ fetchSchedules })
</script>
