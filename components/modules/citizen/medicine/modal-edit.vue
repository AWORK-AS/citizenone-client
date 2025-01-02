<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.editMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenMedicineForm formType="update" :selectedMedicine="props.selectedMedicine"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateMedicine" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { medicineJournalService } from '@/components/api/MedicineJournalService'
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
    selectedMedicine: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshMedicines'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshMedicines() {
    emit('refreshMedicines')
}

async function updateMedicine(medicineDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const medicineUuid = medicineDetails.uuid
        let params = new FormData()
        if (medicineDetails.image) {
            params.append('image', medicineDetails.image)
        }
        params.append('dosage_uuid', medicineDetails.dosage_uuid)
        params.append('medicine', medicineDetails.medicine)
        params.append('strength', medicineDetails.strength)
        params.append('daily_dose', medicineDetails.daily_dose.replace(',', '.'))
        params.append('active_ingredients', medicineDetails.active_ingredients)
        params.append('description', medicineDetails.description)
        params.append('schedule_frequency', medicineDetails.schedule_frequency)
        params.append('time', JSON.stringify(medicineDetails.time))
        const response = await medicineJournalService.updateMedicine(medicineUuid, params)
        if (response?.data) {
            refreshMedicines()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.form.alert.successfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>