<template>
    <div>
        <Modal size="xs" :title="$t('medicationAllergies.newMedicationAllergy')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserMedicationAllergyModalForm formType="create"
                        :selectedMedicationAllergy="state.formMedicationAllergy" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveMedicationAllergy" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { medicationAllergyService } from '@/components/api/user/MedicationAllergyService'
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
const emit = defineEmits(['close', 'refreshMedicationAllergies'])

const state = reactive({
    error: {} as Error,
    formMedicationAllergy: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshMedicationAllergies() {
    emit('refreshMedicationAllergies')
}

async function saveMedicationAllergy(medicationAllergyDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: medicationAllergyDetails.name,
        }
        const response = await medicationAllergyService.saveMedicationAllergy(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('medicationAllergies.form.alert.newMedicationAllergySuccessfullySaved')}.`)
            refreshMedicationAllergies()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>