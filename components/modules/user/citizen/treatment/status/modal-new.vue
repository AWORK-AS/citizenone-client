<template>
    <div>
        <Modal size="sm" :title="$t('citizens.treatments.statuses.newStatus')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenTreatmentStatusForm formType="create" :selectedStatus="state.formStatus"
                        :careArea="props.selectedTreatment?.area_type" :statusTemplate="statusTemplate"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveStatus" @fetchPreviousStatus="fetchPreviousStatus" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { statusService } from '@/components/api/user/StatusService'
import { useAlert } from '@/composables/alert'
import { useStatusPrefill } from '@/composables/statusPrefill'
import { useI18n } from "vue-i18n"
import { defaultCareNoteTemplate } from '@/composables/careNoteTemplate'
import type { Error } from '@/types'

const { successAlert, warningAlert } = useAlert()
const { fetchLastStatusFields } = useStatusPrefill()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedTreatment: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close', 'refreshStatuses'])

const statusTemplate = computed(() =>
    props.selectedTreatment?.template?.status_template || defaultCareNoteTemplate(t)
)

function emptyForm() {
    return {
        date: moment().format('YYYY-MM-DD'),
        score: '',
        status: statusTemplate.value,
    }
}

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formStatus: emptyForm(),
})

// Start from a fresh template every time the modal opens or the case changes.
watch(() => [props.isModalOpen, props.selectedTreatment?.uuid], () => {
    if (props.isModalOpen) {
        state.error = {}
        state.formStatus = emptyForm()
    }
})

async function fetchPreviousStatus() {
    state.isPageLoading = true
    const prefill = await fetchLastStatusFields(props.selectedTreatment?.uuid, ['date', 'score', 'status'])
    if (prefill) {
        state.formStatus = { ...state.formStatus, ...prefill }
    } else {
        warningAlert(t('alert.warning'), t('alert.noPreviousStatusFound'))
    }
    state.isPageLoading = false
}

function closeModal() {
    emit('close')
}

function refreshStatuses() {
    emit('refreshStatuses')
}

async function saveStatus(statusDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            model_uuid: props.selectedTreatment?.uuid,
            date: statusDetails.date,
            score: statusDetails.score,
            status: statusDetails.status,
        }
        const response = await statusService.saveStatus(params)
        if (response?.data) {
            refreshStatuses()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.treatments.statuses.alert.statusSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>