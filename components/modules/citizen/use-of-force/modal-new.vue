<template>
    <div>
        <Modal size="md" :title="$t('citizens.useOfForce.reportUseOfForce')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenUseOfForceForm formType="create" :selectedUseOfForce="state.formUseOfForce"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveUseOfForce" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useOfForceService } from '@/components/api/UseOfForceService'
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
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    formUseOfForce: {
        title: '',
        date: '',
        description: '',
        is_draft: false,
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

async function saveUseOfForce(useOfForceDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: useOfForceDetails.citizen_uuid,
            title: useOfForceDetails.title,
            date: useOfForceDetails.date,
            description: useOfForceDetails.description,
            is_draft: useOfForceDetails.is_draft,
        }
        const response = await useOfForceService.saveUseOfForce(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.useOfForce.alert.savedSuccessfully')}.`)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>