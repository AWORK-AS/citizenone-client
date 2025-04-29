<template>
    <div class="mt-2" v-if="props?.week?.slots?.length > 0 && isCurrentUser()">
        <p class="text-xxs">
            {{ $t('dutySchedules.scheduleSlots.opportunityForAShift') }}
        </p>
        <div class="space-y-2 mt-1">
            <div v-for="(slot, index) in props?.week?.slots" :key="index" :class="[
                slot?.shift_type === 'regular_shift', 'bg-shifts-regular',
                slot?.shift_type === 'awake_night_shift', 'bg-shifts-awake_night',
                slot?.shift_type === 'sleeping_night_shift', 'bg-shifts-sleeping_night',
                slot?.shift_type === 'vacation_leave', 'bg-shifts-vacation',
                slot?.shift_type === 'sick_leave', 'bg-shifts-sickleave',
                'rounded-md p-1 cursor-pointer'
            ]" @click="confirmSlotRequest(slot)">
                <div class="border border-white rounded-md p-2 text-white">
                    {{ slot?.time_in + ' - ' + slot?.time_out }}
                </div>
            </div>
        </div>
        <ModulesUserDutyScheduleScheduleSlotsRequestAvailableSlotConfirmation
            :isModalOpen="state.modal.isRequestScheduleSlotOpen"
            :message="$t('dutySchedules.scheduleSlots.confirmation.requestConfirmation') + '?'"
            @close="state.modal.isRequestScheduleSlotOpen = false" @confirm="requestScheduleSlot" />
    </div>
</template>

<script setup lang="ts">
import { scheduleGrabberService } from '@/components/api/user/ScheduleGrabberService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'

const props = defineProps({
    employee: {
        type: Object,
        required: true,
    },
    week: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['isPageLoading', 'error'])
const userStore = useUserStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    modal: {
        isRequestScheduleSlotOpen: false
    },
    selectedSlot: [] as any
})

function isCurrentUser() {
    return userStore?.getUser?.uuid === props?.employee?.uuid
}

function confirmSlotRequest(slot: any) {
    state.selectedSlot = slot
    state.modal.isRequestScheduleSlotOpen = true
}

async function requestScheduleSlot() {
    emit('error', {})
    emit('isPageLoading', true)
    try {
        const params = {
            slot_uuid: state.selectedSlot?.uuid
        }
        const response = await scheduleGrabberService.requestScheduleSlot(params)
        if (response) {
            state.modal.isRequestScheduleSlotOpen = false
            successAlert(`${t('alert.success')}!`, `${t('dutySchedules.scheduleSlots.alert.requestForThisScheduleSlotHasBennSuccessfullySent')}.`)
        }
    } catch (error: any) {
        emit('error', error)
    }
    emit('isPageLoading', false)
}
</script>