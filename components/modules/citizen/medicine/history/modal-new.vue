<template>
    <div>
        <Modal size="xs" :title="customPagesStore.getCustomPagesName?.giveMedicine" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenMedicineHistoryForm formType="create" :selectedMedicine="props.selectedMedicine"
                        :selectedMedicineHistory="state.formMedicineHistory" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveMedicineHistory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { medicineHistoryService } from '@/components/api/MedicineHistoryService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const customPagesStore = useCustomPagesStore() as any
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

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formMedicineHistory: {
        date: moment().format('YYYY-MM-DD'),
        quantity: '',
        type: '',
        evaluator_uuid: '',
        evaluation_frequency: [],
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
        let params = {}
        const selectedMedicineUuid = props.selectedMedicine?.uuid
        if (props.selectedMedicine?.is_pn_medicine) {
            params = {
                medicine_uuid: selectedMedicineUuid,
                date: medicineHistoryDetails.date,
                quantity: medicineHistoryDetails.quantity.replace(',', '.'),
                type: medicineHistoryDetails.type,
                evaluator_uuid: medicineHistoryDetails.evaluator,
                evaluation_frequency: JSON.stringify(medicineHistoryDetails.evaluation_frequency),
            }
        } else {
            params = {
                medicine_uuid: selectedMedicineUuid,
                date: medicineHistoryDetails.date,
                quantity: medicineHistoryDetails.quantity.replace(',', '.'),
                type: medicineHistoryDetails.type,
            }
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