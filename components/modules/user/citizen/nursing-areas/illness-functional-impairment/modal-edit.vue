<template>
    <div>
        <Modal size="md"
            :title="$t('citizens.nursingAreas.consentCompetenceOrCapacity.editConsentCompetenceOrCapacity')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingAreasIllnessFunctionalImpairmentForm formType="update"
                        :selectedIllnessFunctionalImpairment="props.selectedIllnessFunctionalImpairment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateIllnessFunctionalImpairment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { illnessFunctionalImpairmentService } from '@/components/api/user/IllnessFunctionalImpairmentService'
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
    selectedIllnessFunctionalImpairment: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshConsentCompetenceCapacities'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshConsentCompetenceCapacities() {
    emit('refreshConsentCompetenceCapacities')
}

async function updateIllnessFunctionalImpairment(illnessFunctionalImpairmentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const illnessFunctionalImpairmentUuid = illnessFunctionalImpairmentDetails.uuid
        const params = {
            date: illnessFunctionalImpairmentDetails.date,
            illness_functional_impairment: illnessFunctionalImpairmentDetails.illness_functional_impairment,
        } as any
        if (illnessFunctionalImpairmentDetails.healthcare_provider) {
            params.healthcare_provider = illnessFunctionalImpairmentDetails.healthcare_provider
        } else {
            params.our_contact_person_uuid = illnessFunctionalImpairmentDetails.our_contact_person_uuid
        }
        const response = await illnessFunctionalImpairmentService.updateIllnessFunctionalImpairment(illnessFunctionalImpairmentUuid, params)
        if (response?.data) {
            refreshConsentCompetenceCapacities()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.illnessAndFunctionalImpairment.form.alert.illnessAndFunctionalImpairmentSucessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>