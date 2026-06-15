<template>
    <div>
        <Modal size="md" :title="$t('employment.agreements.newAgreement')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmploymentAgreementModalForm :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveAgreement" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: { type: Boolean, required: true },
})
const emit = defineEmits(['close', 'created'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    state.error = {}
    emit('close')
}

async function saveAgreement(formData: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employmentService.saveAgreement(formData)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('employment.agreements.form.alert.newAgreementSuccessfullySaved')}.`)
            emit('created', response.data)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
