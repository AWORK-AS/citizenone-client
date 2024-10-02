<template>
    <div>
        <Modal size="xs" :title="$t('citizens.medicineJournals.history.giveMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenMedicineHistoryForm formType="create"
                        :selectedMedicineHistory="state.formMedicineHistory" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveMedicineHistory" />
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
    }
})
const emit = defineEmits(['close', 'refreshMedicineHistories'])
const selectedMedicineUuid = props.selectedMedicine?.uuid

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formMedicineHistory: {
        date: '',
        quantity: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshMedicineHistories() {
    emit('refreshMedicineHistories')
}

async function saveMedicineHistory(medicineHistoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            medicine_uuid: selectedMedicineUuid,
            date: medicineHistoryDetails.date,
            quantity: medicineHistoryDetails.quantity,
        }
        const response = await medicineHistoryService.saveMedicineHistory(params)
        if (response?.data) {
            refreshMedicineHistories()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>