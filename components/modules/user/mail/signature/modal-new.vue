<template>
    <div>
        <Modal size="md" :title="$t('mail.settings.signatures.newSignature')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserMailSignatureForm formType="create" :selectedSignature="state.formSignature"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveSignature" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { signatureService } from '@/components/api/user/SignatureService'
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
const emit = defineEmits(['close', 'refreshSignatures'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formSignature: {
        name: '',
        signature: '',
        is_default: false,
    },
})

function closeModal() {
    emit('close')
}

function refreshSignatures() {
    emit('refreshSignatures')
}

async function saveSignature(signatureDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: signatureDetails.name,
            signature: signatureDetails.signature,
            is_default: signatureDetails.is_default,
        }
        const response = await signatureService.saveSignature(params)
        if (response?.data) {
            refreshSignatures()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('mail.settings.signatures.form.alert.newEmailSignatureSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>