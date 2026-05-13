<template>
    <div>
        <Modal size="xs" :title="$t('dosageForms.newDosageForm')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDosageFormModalForm formType="create" :selectedDosageForm="state.formDosageForm"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDosageForm" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { dosageFormService } from '@/components/api/user/DosageFormService'
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
const emit = defineEmits(['close', 'refreshDosageForms'])

const state = reactive({
    error: {} as Error,
    formDosageForm: {
        en_name: '',
        dk_name: '',
        no_name: '',
        sv_name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshDosageForms() {
    emit('refreshDosageForms')
}

async function saveDosageForm(dosageFormDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            en_name: dosageFormDetails.en_name,
            dk_name: dosageFormDetails.dk_name,
            no_name: dosageFormDetails.no_name,
            sv_name: dosageFormDetails.sv_name,
        }
        const response = await dosageFormService.saveDosageForm(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('dosageForms.form.alert.newDosageFormSuccessfullySaved')}.`)
            refreshDosageForms()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>