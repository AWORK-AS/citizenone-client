<template>
    <div>
        <Modal size="md" :title="$t('citizens.incidents.incidentRegistration')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesCitizenIncidentsForm formType="create" :selectedIncident="state.formIncident"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveIncident" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { incidentService } from '@/components/api/IncidentService'
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
})
const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    formIncident: {
        title: '',
        date: '',
        description: '',
        is_draft: false,
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

async function saveIncident(incidentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: incidentDetails.citizen_uuid,
            title: incidentDetails.title,
            date: incidentDetails.date,
            description: incidentDetails.description,
            risk_level: incidentDetails.risk_level,
            is_draft: incidentDetails.is_draft,
        }
        const response = await incidentService.saveIncident(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.incidents.alert.savedSuccessfully')}.`)
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>