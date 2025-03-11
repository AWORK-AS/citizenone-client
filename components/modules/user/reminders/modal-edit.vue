<template>
    <div>
        <Modal size="sm" :title="$t('reminder.editReminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserRemindersForm formType="update" :selectedReminder="props.selectedReminder"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateReminder" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { reminderService } from '@/components/api/user/ReminderService'
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
    selectedReminder: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshReminders'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshReminders() {
    emit('refreshReminders')
}

async function updateReminder(reminderDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const reminderUuid = props.selectedReminder?.uuid
        const params = {
            employee_uuid: reminderDetails.employee,
            title: reminderDetails.title,
            date_time: reminderDetails.date_time,
            repeat: reminderDetails.repeat,
            notes: reminderDetails.notes,
        };
        const response = await reminderService.updateReminder(reminderUuid, params)
        if (response?.data) {
            refreshReminders()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('reminder.form.alert.reminderSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>