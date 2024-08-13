<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.editSchedule')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex items-center justify-end mb-3">
                        <FormButton type="button" buttonStyle="danger" class="rounded-md"
                            @click="state.modal.isDeleteDutyScheduleOpen = true">
                            {{ $t('dutySchedules.deleteSchedule') }}
                        </FormButton>
                    </div>
                    <ModulesDutyScheduleForm formType="update" :selectedSchedule="props.selectedSchedule"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateSchedule" />
                </LoadingSpinner>
                <DialogConfirmation :isModalOpen="state.modal.isDeleteDutyScheduleOpen"
                    :message="`${$t('dutySchedules.confirmation.deleteConfirmation')}?`"
                    @close="state.modal.isDeleteDutyScheduleOpen = false" @confirm="deleteSchedule" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { dutyScheduleService } from '@/components/api/DutyScheduleService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedSchedule: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshSchedules'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isDeleteDutyScheduleOpen: false
    }
})

watch(() => props.isModalOpen, () => {
    state.error = {}
})

function closeModal() {
    emit('close')
}

function refreshSchedules() {
    emit('refreshSchedules')
}

async function updateSchedule(scheduleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const scheduleUuid = scheduleDetails.uuid
        const params = {
            title: scheduleDetails.title,
            description: scheduleDetails.description,
            date_time_start: scheduleDetails.date_time_start,
            date_time_end: scheduleDetails.date_time_end,
            is_private: scheduleDetails.is_private,
            user_uuid: scheduleDetails.user_uuid,
        }
        const response = await dutyScheduleService.updateDutySchedule(scheduleUuid, params)
        if (response?.data) {
            refreshSchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.alert.successfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function deleteSchedule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const scheduleUuid = props.selectedSchedule.uuid
        const response = await dutyScheduleService.deleteDutySchedule(scheduleUuid + 123)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            refreshSchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>