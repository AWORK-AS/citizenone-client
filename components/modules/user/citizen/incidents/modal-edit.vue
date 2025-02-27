<template>
    <div>
        <Modal size="md" :title="$t('citizens.incidents.editIncident')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenIncidentsForm formType="create" :selectedIncident="props.selectedIncident"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="updateIncident" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { incidentService } from '@/components/api/user/IncidentService'
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
    selectedIncident: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshIncidents'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshIncidents() {
    emit('refreshIncidents')
}

async function updateIncident(incidentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const incidentUuid = incidentDetails.uuid
        const params = {
            title: incidentDetails.title,
            date: incidentDetails.date,
            description: incidentDetails.description,
            risk_level: incidentDetails.risk_level,
            is_draft: incidentDetails.is_draft,
        }
        const response = await incidentService.updateIncident(incidentUuid, params)
        if (response?.data) {
            successAlert(`${t('alert.success')}!`, `${t('citizens.incidents.alert.updatedSuccessfully')}.`)
            closeModal()
            refreshIncidents()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>