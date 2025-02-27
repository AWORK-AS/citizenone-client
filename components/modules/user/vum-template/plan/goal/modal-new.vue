<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.VUMTemplates.newGoal')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserVumTemplatePlanGoalForm formType="create" :selectedGoal="state.formGoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveGoal" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { goalTemplateService } from '@/components/api/GoalTemplateService'
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
const emit = defineEmits(['close', 'refreshTemplates'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formGoal: {
        id: '',
        uuid: '',
        name: '',
        description: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshTemplates() {
    emit('refreshTemplates')
}

async function saveGoal(goalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            plan_template_uuid: props.selectedPlan.uuid,
            name: goalDetails.name,
            description: goalDetails.description,
        }
        const response = await goalTemplateService.saveTemplate(params)
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