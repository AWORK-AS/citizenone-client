<template>
    <div>
        <Modal size="md" :title="$t('citizens.medicineJournals.taperingSchedule.buildSchedule')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenMedicineTaperingScheduleForm :selectedMedicine="props.selectedMedicine"
                        :error="state.error" @error="setError" @closeModal="closeModal"
                        @submitForm="saveTaperingSchedule" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { medicineTaperingScheduleService } from '@/components/api/user/MedicineTaperingScheduleService'
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
const emit = defineEmits(['close', 'refreshMedicines', 'refreshTaperingSchedules'])

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

async function saveTaperingSchedule(scheduleDetails: any) {
    state.error = {} as Error
    state.isPageLoading = true
    try {
        await medicineTaperingScheduleService.saveTaperingSchedule(props.selectedMedicine?.uuid, scheduleDetails)
        emit('refreshMedicines')
        emit('refreshTaperingSchedules')
        closeModal()
        successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.taperingSchedule.alert.successfullyCreated')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
