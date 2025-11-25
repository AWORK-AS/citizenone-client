<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.extraHours.editExtraHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleExtraHoursForm formType="update"
                        :selectedExtraHoursRequest="props.selectedExtraHoursRequest" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateScheduleSlot" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { extraHoursService } from '@/components/api/user/ExtraHoursService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedExtraHoursRequest: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshExtraHours'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshExtraHours() {
    emit('refreshExtraHours')
}

async function updateScheduleSlot(extraHoursDetails: any) {
    try {
        const extraHoursUuid = props.selectedExtraHoursRequest?.uuid
        const params = {
            date: extraHoursDetails.date,
            extra_hours_type: extraHoursDetails.type,
            extra_hours: extraHoursDetails.hours,
            note: extraHoursDetails.note,
        }
        const response = await extraHoursService.updateExtraHour(extraHoursUuid, params)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.form.alert.extraHoursSuccessfullyUpdated')}.`)
            refreshExtraHours()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
}
</script>