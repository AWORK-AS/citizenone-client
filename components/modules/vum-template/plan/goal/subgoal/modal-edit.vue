<template>
    <div>
        <Modal size="md" :title="$t('plansandgoals.VUMTemplates.editSubgoal')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesVumTemplatePlanGoalSubgoalForm formType="update" :selectedSubgoal="props.selectedSubgoal"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateSubgoal" />
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
    selectedSubgoal: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshTemplates'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshTemplates() {
    emit('refreshTemplates')
}

async function updateSubgoal(subgoalDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const subgoalUuid = subgoalDetails.uuid
        const params = {
            name: subgoalDetails.name,
            description: subgoalDetails.description,
        }
        const response = await subgoalTemplateService.updateTemplate(subgoalUuid, params)
        if (response?.data) {
            refreshTemplates()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.VUMTemplates.form.alert.templateSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>