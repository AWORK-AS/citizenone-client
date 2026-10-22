<template>
    <div>
        <Modal size="xs" :title="$t('citizens.interventionHours.newInterventionHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenInterventionHoursForm formType="create"
                        :selectedInterventionHours="state.formInterventionHours" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveInterventionHours" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import moment from 'moment'
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
    // From a booking ("Registrér tid"): its citizen and its times. Without
    // them the form is the citizen page's own, as before.
    citizenUuid: {
        type: String,
        default: '',
    },
    presetStart: {
        type: String,
        default: '',
    },
    presetEnd: {
        type: String,
        default: '',
    },
})
const router = useRouter()
const routeCitizenUuid = router?.currentRoute?.value?.params?.uuid
const emit = defineEmits(['close', 'refreshInterventionHours'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formInterventionHours: {
        date_time_start: moment().startOf('day').add(8, 'hours').format('YYYY-MM-DD H:mm'),
        date_time_end: moment().startOf('day').add(17, 'hours').format('YYYY-MM-DD H:mm'),
        note: '',
    },
})

// Opened from a booking: start from its times every time, as a new object so
// the form takes them.
watch(() => [props.isModalOpen, props.presetStart, props.presetEnd], () => {
    if (props.isModalOpen && props.presetStart) {
        state.formInterventionHours = {
            date_time_start: moment(props.presetStart).format('YYYY-MM-DD H:mm'),
            date_time_end: moment(props.presetEnd || props.presetStart).format('YYYY-MM-DD H:mm'),
            note: '',
        }
    }
}, { immediate: true })

function closeModal() {
    emit('close')
}

function refreshInterventionHours() {
    emit('refreshInterventionHours')
}

async function saveInterventionHours(interventionHoursDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: props.citizenUuid || routeCitizenUuid,
            date_time_start: interventionHoursDetails.date_time_start,
            date_time_end: interventionHoursDetails.date_time_end,
            note: interventionHoursDetails.note,
            // Only when the hour-type picker showed (careHourTypes.hourTypePayload).
            ...(interventionHoursDetails.contract_hour_type_uuid
                ? { contract_hour_type_uuid: interventionHoursDetails.contract_hour_type_uuid }
                : {}),
        }
        const response = await interventionHoursService.saveInterventionHours(params)
        if (response?.data) {
            refreshInterventionHours()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('citizens.interventionHours.form.alert.interventionHoursSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>