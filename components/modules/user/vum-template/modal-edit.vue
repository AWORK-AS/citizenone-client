<template>
    <div>
        <Modal size="xs" :title="$t('plansandgoals.VUMTemplates.editTemplate')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserVumTemplateForm formType="update" :selectedTemplate="props.selectedTemplate"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateTemplate" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planGoalSubgoalTemplateService } from '@/components/api/user/PlanGoalSubgoalTemplateService'
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
    selectedTemplate: {
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

async function updateTemplate(templateDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const templateUuid = templateDetails.uuid
        const params = {
            name: templateDetails.name,
            is_active: templateDetails.is_active,
        }
        const response = await planGoalSubgoalTemplateService.updateTemplate(templateUuid, params)
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