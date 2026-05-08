<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.history.giveMedicine')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicineHistoryForm formType="create" :selectedMedicine="props.selectedMedicine"
                        :selectedMedicineHistory="state.formMedicineHistory" :error="state.error" @error="setError"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveMedicineHistory" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
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
const emit = defineEmits(['close', 'refreshMedicines', 'refreshMedicineHistories'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formMedicineHistory: {
        date: moment().format('YYYY-MM-DD'),
        dosages: [],
        evaluator_uuid: '',
    },
})

function closeModal() {
    emit('close')
}

function setError(error: any) {
    state.error = error
}

function refreshMedicines() {
    emit('refreshMedicines')
}

function refreshMedicineHistories() {
    emit('refreshMedicineHistories')
}

async function saveMedicineHistory(medicineHistoryDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const selectedMedicineUuid = props.selectedMedicine?.uuid
        const dates = medicineHistoryDetails.selectedDates?.length > 0
            ? medicineHistoryDetails.selectedDates
            : [medicineHistoryDetails.date]

        for (const date of dates) {
            let params = {}
            if (props.selectedMedicine?.is_pn_medicine) {
                params = {
                    medicine_uuid: selectedMedicineUuid,
                    date,
                    dosage: medicineHistoryDetails.dosage,
                    type: medicineHistoryDetails.type,
                    evaluator_uuid: medicineHistoryDetails.evaluator,
                    evaluation_frequency: medicineHistoryDetails.evaluation_frequency,
                    comment: medicineHistoryDetails.comment,
                }
            } else {
                params = {
                    medicine_uuid: selectedMedicineUuid,
                    date,
                    dosages: medicineHistoryDetails.dosages,
                }
            }
            await medicineHistoryService.saveMedicineHistory(params)
        }

        refreshMedicines()
        refreshMedicineHistories()
        closeModal()
        successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.form.alert.successfullyAdded')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>