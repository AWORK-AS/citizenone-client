<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.notifications.newNotification')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenPlanNotificationForm formType="create"
                        :selectedNotification="state.formNotification" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveNotification" />
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
    selectedData: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshNotifications'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formNotification: {
        date_time: '',
        user_uuid: [],
        note: '',
        recurring: {
            is_recurring: false,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
        },
    },
})

function closeModal() {
    emit('close')
}

function refreshNotifications() {
    emit('refreshNotifications')
}

async function saveNotification(notificationDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            plan_goal_subgoal_uuid: props.selectedData?.uuid,
            date_time: notificationDetails.date_time,
            user_uuid: notificationDetails.user,
            note: notificationDetails.note,
            is_recurring: notificationDetails.is_recurring,
            recurring: notificationDetails.recurring,
            recurring_until: notificationDetails.recurring_until,
        } as any
        if (notificationDetails.recurring.recurring === 'custom') {
            params.frequency = notificationDetails.recurring.frequency
            params.every = notificationDetails.recurring.every
            if (notificationDetails.recurring.frequency === 'weekly') {
                params.weekly_on = notificationDetails.recurring.weekly_on
            } else if (notificationDetails.recurring.frequency === 'monthly') {
                if (!notificationDetails.recurring.monthly_on_the_enabled) {
                    params.monthly_each = notificationDetails.recurring.monthly_each
                } else {
                    params.monthly_on_the_sequence = notificationDetails.recurring.monthly_on_the_sequence
                    params.monthly_on_the_day = notificationDetails.recurring.monthly_on_the_day
                }
            } else if (notificationDetails.recurring.frequency === 'yearly') {
                params.yearly_in_months = notificationDetails.recurring.yearly_in_months
                if (notificationDetails.recurring.yearly_on_the_enabled) {
                    params.yearly_on_the_sequence = notificationDetails.recurring.yearly_on_the_sequence
                    params.yearly_on_the_day = notificationDetails.recurring.yearly_on_the_day
                }
            }
        }
        const response = await planGoalSubgoalNotificationService.saveNotification(params)
        if (response?.data) {
            refreshNotifications()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.notifications.form.alert.notificationSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>