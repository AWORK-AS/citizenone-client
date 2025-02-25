<template>
    <div>
        <Modal size="sm" :title="$t('reminder.newReminder')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesRemindersForm formType="create" :selectedReminder="state.formStatus" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveStatus" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { reminderService } from '@/components/api/ReminderService'
import { reminderUserService } from '@/components/api/ReminderUserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any

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
    formStatus: {
        employee_uuid: '',
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

async function saveStatus(statusDetails: any) {
    state.error = {}
    state.isPageLoading = true
    let reminder_uuid = ''
    try {
        let params = {
            employee_uuid: statusDetails.employee_uuid,
            title: statusDetails.title,
            date_time: statusDetails.date_time,
            repeat: statusDetails.repeat,
            notes: statusDetails.notes,
        };
        const response = await reminderService.saveReminder(params)
        if (response?.data) {
            reminder_uuid = response.data.uuid
            refreshReminders()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('reminder.form.alert.taskSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function saveReminderUser(employee_uuid: string[], reminder_uuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            employee_uuid: employee_uuid,
            reminder_uuid: reminder_uuid,
        };
        const response = await reminderUserService.saveReminderUser(params)
        if (response?.data) {
            refreshReminders()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('reminder.form.alert.taskSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>