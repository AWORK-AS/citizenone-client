<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.dosageChange.recordDosageChange')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicineDosageChangeForm :selectedMedicine="props.selectedMedicine"
                        :error="state.error" @error="setError" @closeModal="closeModal"
                        @submitForm="saveDosageChange" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { medicineDosageChangeService } from '@/components/api/user/MedicineDosageChangeService'
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
const emit = defineEmits(['close', 'refreshMedicines', 'refreshDosageChanges'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function setError(error: any) {
    state.error = error
}

async function saveDosageChange(dosageChangeDetails: any) {
    state.error = {} as Error
    state.isPageLoading = true
    try {
        await medicineDosageChangeService.saveDosageChange(props.selectedMedicine?.uuid, dosageChangeDetails)
        emit('refreshMedicines')
        emit('refreshDosageChanges')
        closeModal()
        successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.dosageChange.alert.successfullyAdded')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
