<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.notifications.editNotification')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenPlanNotificationForm formType="update"
                        :selectedNotification="props.selectedNotification" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateNotification" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { planGoalSubgoalNotificationService } from '@/components/api/user/PlanGoalSubgoalNotificationService'
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
    selectedNotification: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshNotifications'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshNotifications() {
    emit('refreshNotifications')
}

async function updateNotification(notificationDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const notificationUuid = props.selectedNotification.uuid
        const params = {
            date_time: notificationDetails.date_time,
            user_uuid: notificationDetails.user,
            note: notificationDetails.note,
            is_recurring: notificationDetails.is_recurring,
            recurring: notificationDetails.recurring,
            recurring_until: notificationDetails.recurring_until,
        }
        const response = await planGoalSubgoalNotificationService.updateNotification(notificationUuid, params)
        if (response?.data) {
            refreshNotifications()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.notifications.form.alert.notificationSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>