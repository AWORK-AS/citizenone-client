<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.history.giveMedicine')"
            :show="props.isModalOpen && !state.modal.isPnWarningOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicineHistoryForm formType="create" :selectedMedicine="props.selectedMedicine"
                        :selectedMedicineHistory="state.formMedicineHistory" :error="state.error" @error="setError"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="(details: any) => saveMedicineHistory(details)"
                        @confirmationDialogToggle="(value: boolean) => state.modal.isChildConfirmationOpen = value" />
                </LoadingSpinner>
            </template>
        </Modal>
        <DialogConfirmation :isModalOpen="state.modal.isPnWarningOpen" :message="state.pnWarningMessage"
            @close="cancelPnWarning" @confirm="confirmPnWarning" />
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
    modal: {
        isPnWarningOpen: false,
        // Tracked so closeModal() can ignore the outer Modal's own outside-click
        // "close" while the form's nested daily-dose confirmation is open - two
        // stacked HeadlessUI Dialogs otherwise fight, and a click landing on the
        // confirmation (which sits outside the outer Dialog's panel) would
        // silently close this whole modal before the confirmed save runs.
        isChildConfirmationOpen: false,
    },
    pnWarningMessage: '',
    pendingSave: null as any,
})

function closeModal() {
    if (state.modal.isChildConfirmationOpen) return
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

async function saveMedicineHistory(medicineHistoryDetails: any, startIndex = 0, force = false) {
    state.error = {}
    state.isPageLoading = true
    try {
        const selectedMedicineUuid = props.selectedMedicine?.uuid
        const dates = medicineHistoryDetails.selectedDates?.length > 0
            ? medicineHistoryDetails.selectedDates
            : [medicineHistoryDetails.date]

        for (let i = startIndex; i < dates.length; i++) {
            const date = dates[i]
            let params: any = {}
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
                if (force) {
                    params.force = true
                }
            } else {
                params = {
                    medicine_uuid: selectedMedicineUuid,
                    date,
                    dosages: medicineHistoryDetails.dosages,
                }
            }

            const response = await medicineHistoryService.saveMedicineHistory(params)

            if (response?.warning) {
                state.pnWarningMessage = response.message
                state.pendingSave = { medicineHistoryDetails, index: i }
                state.modal.isPnWarningOpen = true
                state.isPageLoading = false
                return
            }
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

function confirmPnWarning() {
    if (!state.pendingSave) return
    const { medicineHistoryDetails, index } = state.pendingSave
    state.pendingSave = null
    saveMedicineHistory(medicineHistoryDetails, index, true)
}

function cancelPnWarning() {
    state.pendingSave = null
    state.modal.isPnWarningOpen = false
}
</script>
