<template>
    <div>
        <Modal size="xs" :title="`${$t('events.newEvent')}`" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserCitizenCalendarForm formType="create" :selectedSchedule="state.formSchedule"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveSchedule" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { myCalendarService } from '@/components/api/user/MyCalendarService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useUserStore } from '@/store/user'

const userStore = useUserStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshSchedules'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    formSchedule: {
        id: '',
        uuid: '',
        title: '',
        description: '',
        date_time_start: '',
        date_time_end: '',
        unit_uuid: '',
        is_private: false,
        send_invitation: false,
        recurring: {
            is_recurring: false,
            recurring: '',
            recurring_until: '',
            frequency: '',
            every: '',
            weekly_on: [],
            monthly_on_the_enabled: false,
            monthly_each: [],
            monthly_on_the_sequence: '',
            monthly_on_the_day: '',
            yearly_in_months: [],
            yearly_on_the_enabled: false,
            yearly_on_the_sequence: '',
            yearly_on_the_day: '',
            is_apply_to_all: false,
        },
    },
})

function closeModal() {
    emit('close')
}

function refreshSchedules() {
    emit('refreshSchedules')
}

async function saveSchedule(scheduleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            calendar_type: 'citizens',
            citizens_uuid: [citizenUuid],
            title: scheduleDetails.title,
            description: scheduleDetails.description,
            date_time_start: scheduleDetails.date_time_start,
            date_time_end: scheduleDetails.date_time_end,
            unit_uuid: scheduleDetails.unit_uuid,
            is_private: scheduleDetails.is_private,
            send_invitation: scheduleDetails.send_invitation,
        } as any
        if (scheduleDetails.recurring.recurring === 'custom') {
            params.frequency = scheduleDetails.recurring.frequency
            params.every = scheduleDetails.recurring.every
            if (scheduleDetails.recurring.frequency === 'weekly') {
                params.weekly_on = scheduleDetails.recurring.weekly_on
            } else if (scheduleDetails.recurring.frequency === 'monthly') {
                params.monthly_on_the_enabled = scheduleDetails.recurring.monthly_on_the_enabled
                if (!scheduleDetails.recurring.monthly_on_the_enabled) {
                    params.monthly_each = scheduleDetails.recurring.monthly_each
                } else {
                    params.monthly_on_the_sequence = scheduleDetails.recurring.monthly_on_the_sequence
                    params.monthly_on_the_day = scheduleDetails.recurring.monthly_on_the_day
                }
            } else if (scheduleDetails.recurring.frequency === 'yearly') {
                params.yearly_in_months = scheduleDetails.recurring.yearly_in_months
                if (scheduleDetails.recurring.yearly_on_the_enabled) {
                    params.yearly_on_the_sequence = scheduleDetails.recurring.yearly_on_the_sequence
                    params.yearly_on_the_day = scheduleDetails.recurring.yearly_on_the_day
                }
            }
        }
        const response = await myCalendarService.saveSchedule(params)
        if (response?.data) {
            refreshSchedules()
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('events.alert.successfullyAdded')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>