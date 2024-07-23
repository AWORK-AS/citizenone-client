<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.form.editMedicine')" :show="props.isModalOpen"
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
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

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
        const MedicineUuid = medicineDetails.uuid
        const params = {
            name: medicineDetails.name,
            date_given: medicineDetails.date_given,
            description: medicineDetails.description,
        }
        const response = await medicineJournalService.updateMedicine(MedicineUuid, params)
        if (response?.data) {
            refreshMedicines()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.alert.successfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>