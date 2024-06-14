<template>
    <div>
        <Modal size="md" :title="$t('plansandgoals.editGoal')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenPlanGoalForm formType="update" :selectedGoal="props.selectedGoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateGoal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { goalService } from '@/components/api/GoalService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

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
    error: [],
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshGoals() {
    emit('refreshGoals')
}

async function updateGoal(goalDetails: any) {
    state.isPageLoading = true
    try {
        const goalUuid = goalDetails.uuid
        const params = {
            name: goalDetails.name,
            completion_date: goalDetails.completion_date,
            date_completed: goalDetails.date_completed,
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

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>