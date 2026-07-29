<template>
    <div>
        <Modal size="lg" :title="$t('mileageLog.newTrip')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserMileageLogForm formType="create" :citizenOptions="state.citizenOptions"
                        :error="state.error" @closeModal="closeModal" @submitForm="saveMileageLog" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { mileageLogService } from '@/components/api/user/MileageLogService'
import { citizenService } from '@/components/api/user/CitizenService'
import { splitStopsForApi } from '@/composables/tripDistance'
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
const emit = defineEmits(['close', 'refreshMileageLog'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    citizenOptions: [] as any,
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchCitizenOptions()
    }
})

async function fetchCitizenOptions() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.citizenOptions = response.data.map((citizen: any) => ({
                value: citizen.uuid,
                label: `${citizen.firstname} ${citizen.lastname ?? ''}`,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

function closeModal() {
    emit('close')
}

function refreshMileageLog() {
    emit('refreshMileageLog')
}

async function saveMileageLog(tripDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const { stops, ...routeFields } = splitStopsForApi(tripDetails.stops)
        const params = {
            date_time_start: moment(tripDetails.date_time_start).format('YYYY-MM-DD H:mm'),
            note: tripDetails.note,
            citizen_uuid: tripDetails.citizen_uuid,
            ...routeFields,
            stops,
        }
        const response = await mileageLogService.saveMileageLog(params)
        if (response?.data) {
            refreshMileageLog()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('mileageLog.form.alert.tripSuccessfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
