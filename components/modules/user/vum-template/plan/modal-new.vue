<template>
    <div>
        <Modal size="sm" :title="$t('plansandgoals.VUMTemplates.newPlan')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserVumTemplatePlanForm formType="create" :selectedTemplate="state.formTemplate"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @nameModal="closeModal" @submitForm="saveTemplate" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { planTemplateService } from '@/components/api/user/PlanTemplateService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const router = useRouter()
const templateUuid = router?.currentRoute?.value?.params?.template_uuid
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
        description: '',
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
            template_uuid: templateUuid,
            name: templateDetails.name,
            description: templateDetails.description,
        }
        const response = await planTemplateService.saveTemplate(params)
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