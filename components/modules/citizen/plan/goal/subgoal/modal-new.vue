<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.newSubgoal')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenPlanGoalSubgoalForm formType="create" :selectedSubgoal="state.formSubgoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveSubgoal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { subgoalService } from '@/components/api/SubgoalService'
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
    }
})
const emit = defineEmits(['close', 'refreshGoals'])

const state = reactive({
    error: [],
    isPageLoading: false,
    formSubgoal: {
        id: '',
        uuid: '',
        name: '',
        completion_date: '',
        date_completed: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshGoals() {
    emit('refreshGoals')
}

async function saveSubgoal(subgoalDetails: any) {
    state.isPageLoading = true
    try {
        const params = {
            goal_uuid: props.selectedGoal.uuid,
            name: subgoalDetails.name,
            completion_date: subgoalDetails.completion_date,
        }
        const response = await subgoalService.saveSubgoal(params)
        if (response?.data) {
            refreshGoals()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.alert.subgoalSuccessfullyAdded')}.`)
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