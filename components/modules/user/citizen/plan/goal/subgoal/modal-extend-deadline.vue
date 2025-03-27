<template>
    <div>
        <Modal size="md" :title="$t('plansandgoals.editSubgoal')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenPlanGoalSubgoalForm formType="update" :selectedSubgoal="props.selectedSubgoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateSubgoal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { subgoalService } from '@/components/api/user/SubgoalService'
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
    selectedSubgoal: {
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

async function updateSubgoal(subgoalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const subgoalUuid = subgoalDetails.uuid
        const params = {
            name: subgoalDetails.name,
            description: subgoalDetails.description,
            completion_date: subgoalDetails.completion_date,
            date_completed: subgoalDetails.date_completed,
            score: subgoalDetails.score,
        }
        const response = await subgoalService.updateSubgoal(subgoalUuid, params)
        if (response?.data) {
            refreshGoals()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.subgoalSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>