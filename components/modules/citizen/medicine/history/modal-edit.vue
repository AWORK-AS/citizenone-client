<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.history.editMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenMedicineHistoryForm formType="update" :selectedMedicine="props.selectedMedicine"
                        :selectedMedicineHistory="props.selectedMedicineHistory" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateMedicineHistory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { medicineHistoryService } from '@/components/api/MedicineHistoryService'
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
    selectedMedicineHistory: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshMedicineHistories'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshMedicineHistories() {
    emit('refreshMedicineHistories')
}

async function updateMedicineHistory(medicineHistoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const medicineHistoryUuid = medicineHistoryDetails.uuid
        const params = {
            date: medicineHistoryDetails.date,
            quantity: medicineHistoryDetails.quantity.replace(',', '.'),
            type: medicineHistoryDetails.type,
        }
        const response = await medicineHistoryService.updateMedicineHistory(medicineHistoryUuid, params)
        if (response?.data) {
            refreshMedicineHistories()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>