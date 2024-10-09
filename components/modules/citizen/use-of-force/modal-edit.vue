<template>
    <div>
        <Modal size="md" :title="$t('citizens.useOfForce.editUseOfForce')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenUseOfForceForm formType="create" :selectedUseOfForce="props.selectedUseOfForce"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateUseOfForce" />
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
    selectedUseOfForce: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshUseOfForce'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshUseOfForce() {
    emit('refreshUseOfForce')
}

async function updateUseOfForce(useOfForceDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const useOfForceUuid = useOfForceDetails.uuid
        const params = {
            title: useOfForceDetails.title,
            date: useOfForceDetails.date,
            description: useOfForceDetails.description,
            is_draft: useOfForceDetails.is_draft,
        }
        const response = await useOfForceService.updateUseOfForce(useOfForceUuid, params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.useOfForce.alert.updatedSuccessfully')}.`)
            closeModal()
            refreshUseOfForce()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>