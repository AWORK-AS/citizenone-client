<template>
    <div>
        <Modal size="md" :title="$t('plansandgoals.forCompletion.extendDeadline')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenPlanGoalForm formType="update" :selectedGoal="props.selectedGoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateGoal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { goalService } from '@/components/api/user/GoalService'
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
    selectedGoal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshGoals'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshGoals() {
    emit('refreshGoals')
}

async function updateGoal(goalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const goalUuid = goalDetails.uuid
        const params = {
            name: goalDetails.name,
            description: goalDetails.description,
            enable_reminder: goalDetails.enable_reminder,
            completion_date: goalDetails.completion_date,
            date_completed: goalDetails.date_completed,
            score: goalDetails.score,
        }
        const response = await goalService.updateGoal(goalUuid, params)
        if (response?.data) {
            refreshGoals()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.goalSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>