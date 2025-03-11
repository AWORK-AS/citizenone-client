<template>
    <div>
        <Modal size="sm" :title="$t('reminders.newReminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserRemindersForm formType="create" :selectedReminder="state.formReminder"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveReminder" />
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
})

const emit = defineEmits(['close', 'refreshReminders'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formReminder: {
        employee: '',
        title: '',
        date_time: '',
        repeat: '',
        notes: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshReminders() {
    emit('refreshReminders')
}

async function saveReminder(reminderDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            employee_uuid: reminderDetails.employee,
            title: reminderDetails.title,
            date_time: reminderDetails.date_time,
            repeat: reminderDetails.repeat,
            notes: reminderDetails.notes,
        };
        const response = await reminderService.saveReminder(params)
        if (response?.data) {
            refreshReminders()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('reminders.form.alert.reminderSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>