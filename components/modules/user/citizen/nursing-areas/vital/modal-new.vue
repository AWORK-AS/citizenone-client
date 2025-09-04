<template>
    <div>
        <Modal size="md" :title="$t('citizens.nursingAreas.vitals.newVitals')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingAreasVitalForm formType="create" :selectedVitals="state.formVitals"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveVital" />
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
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedVitals: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshVitals'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formVitals: {
        id: '',
        uuid: '',
        date: '',
        blood_pressure: '',
        pulse: '',
        weight: '',
        blood_sugar: '',
        temperature: '',
        additional_fields: [],
    },
})

function closeModal() {
    emit('close')
}

function refreshVitals() {
    emit('refreshVitals')
}

async function saveVital(vitalsDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            date: vitalsDetails.date,
            blood_pressure: vitalsDetails.blood_pressure,
            pulse: vitalsDetails.pulse,
            weight: vitalsDetails.weight,
            blood_sugar: vitalsDetails.blood_sugar,
            temperature: vitalsDetails.temperature,
            additional_fields: vitalsDetails.additional_fields,
        }
        const response = await vitalService.saveVital(params)
        if (response?.data) {
            refreshVitals()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.vitals.form.alert.vitalsSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>