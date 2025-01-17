<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.VUMTemplates.newSubgoal')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesVumTemplatePlanGoalSubgoalForm formType="create" :selectedSubgoal="state.formSubgoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveSubgoal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { subgoalTemplateService } from '@/components/api/SubgoalTemplateService'
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
    }
})
const emit = defineEmits(['close', 'refreshTemplates'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formSubgoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
        completion_date: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshTemplates() {
    emit('refreshTemplates')
}

async function saveSubgoal(subgoalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            goal_template_uuid: props.selectedGoal.uuid,
            name: subgoalDetails.name,
            description: subgoalDetails.description,
            completion_date: subgoalDetails.completion_date,
        }
        const response = await subgoalTemplateService.saveTemplate(params)
        if (response?.data) {
            refreshTemplates()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.VUMTemplates.form.alert.newTemplateSuccessfullySaved')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>