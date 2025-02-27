<template>
    <div>
        <Modal size="xs" :title="$t('plansandgoals.VUMTemplates.newTemplate')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserVumTemplateForm formType="create" :selectedTemplate="state.formTemplate"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @nameModal="closeModal" @submitForm="saveTemplate" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planGoalSubgoalTemplateService } from '@/components/api/PlanGoalSubgoalTemplateService'
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
})
const emit = defineEmits(['close', 'refreshTemplates'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formTemplate: {
        name: '',
        is_active: true,
    },
})

function closeModal() {
    emit('close')
}

function refreshTemplates() {
    emit('refreshTemplates')
}

async function saveTemplate(templateDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: templateDetails.name,
            is_active: templateDetails.is_active,
        }
        const response = await planGoalSubgoalTemplateService.saveTemplate(params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('plansandgoals.VUMTemplates.form.alert.newTemplateSuccessfullySaved')}.`)
            refreshTemplates()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>