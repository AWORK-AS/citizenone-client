<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.newGoal')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenPlanGoalForm formType="create" :selectedGoal="state.formGoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveGoal" />
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
    selectedPlan: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshGoals'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formGoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
        date_completed: '',
        score: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshGoals() {
    emit('refreshGoals')
}

async function saveGoal(goalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            plan_uuid: props.selectedPlan.uuid,
            name: goalDetails.name,
            description: goalDetails.description,
            completion_date: goalDetails.completion_date,
            score: goalDetails.score,
        }
        const response = await goalService.saveGoal(params)
        if (response?.data) {
            refreshGoals()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.goalSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>