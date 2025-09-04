<template>
    <div>
        <Modal size="md" :title="$t('citizens.nursingAreas.vitals.editVitals')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingAreasVitalForm formType="update" :selectedVitals="props.selectedVitals"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateVital" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { vitalService } from '@/components/api/user/VitalService'
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
    selectedVitals: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshVitals'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshVitals() {
    emit('refreshVitals')
}

async function updateVital(vitalsDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const vitalUuid = vitalsDetails.uuid
        const params = {
            date: vitalsDetails.date,
            blood_pressure: vitalsDetails.blood_pressure,
            pulse: vitalsDetails.pulse,
            weight: vitalsDetails.weight,
            blood_sugar: vitalsDetails.blood_sugar,
            temperature: vitalsDetails.temperature,
            additional_fields: vitalsDetails.additional_fields,
        }
        const response = await vitalService.updateVital(vitalUuid, params)
        if (response?.data) {
            refreshVitals()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.vitals.form.alert.vitalsSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>