<template>
    <div>
        <Modal size="sm" :title="$t('citizens.nursingAreas.consentCompetenceOrCapacity.newConsentCompetenceOrCapacity')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenNursingAreasConsentCompetenceCapacityForm formType="create"
                        :selectedConsentCompetenceCapacity="state.formConsentCompetenceCapacity" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveConsentCompetenceCapacity" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { consentCompetenceCapacityService } from '@/components/api/user/ConsentCompetenceCapacityService'
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
    selectedConsentCompetenceCapacity: {
        type: Object,
        required: true,
    }
})
const emit = defineEmits(['close', 'refreshConsentCompetenceCapacities'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formConsentCompetenceCapacity: {
        id: '',
        uuid: '',
        date: '',
        consent_competence_capacity: '',
    },
})

function closeModal() {
    emit('close')
}

function refreshConsentCompetenceCapacities() {
    emit('refreshConsentCompetenceCapacities')
}

async function saveConsentCompetenceCapacity(consentCompetenceCapacityDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            date: consentCompetenceCapacityDetails.date,
            consent_competence_capacity: consentCompetenceCapacityDetails.consent_competence_capacity,
        }
        const response = await consentCompetenceCapacityService.saveConsentCompetenceCapacity(params)
        if (response?.data) {
            refreshConsentCompetenceCapacities()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.nursingAreas.consentCompetenceOrCapacity.form.alert.consentCompetenceOrCapacitySuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>