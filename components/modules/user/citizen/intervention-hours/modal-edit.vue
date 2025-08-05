<template>
    <div>
        <Modal size="xs" :title="$t('citizens.interventionHours.editInterventionHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenInterventionHoursForm formType="update"
                        :selectedInterventionHours="props.selectedInterventionHours" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="updateInterventionHours" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { interventionHoursService } from '@/components/api/user/InterventionHoursService'
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
    selectedInterventionHours: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshInterventionHours'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false
})

function closeModal() {
    emit('close')
}

function refreshInterventionHours() {
    emit('refreshInterventionHours')
}

async function updateInterventionHours(interventionHoursDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const interventionHoursUuid = props?.selectedInterventionHours.uuid
        const params = {
            date_time_start: interventionHoursDetails.date_time_start,
            date_time_end: interventionHoursDetails.date_time_end,
            note: interventionHoursDetails.note,
        }
        const response = await interventionHoursService.updateInterventionHours(interventionHoursUuid, params)
        if (response?.data) {
            refreshInterventionHours()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.interventionHours.form.alert.interventionHoursSuccessfullyUpdated')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>