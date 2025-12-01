<template>
    <div>
        <Modal size="xs" :title="isAdmin(userStore.getUser?.role) ?
            $t('dutySchedules.extraHours.newExtraHours') :
            $t('dutySchedules.extraHours.newExtraHoursRequest')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleExtraHoursForm formType="create"
                        :selectedExtraHoursRequest="state.formExtraHours" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveScheduleSlot" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { extraHoursService } from '@/components/api/user/ExtraHoursService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedEmployee: {
        type: Object,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshExtraHours', 'refreshDutySchedules', 'closeModal'])

const state = reactive({
    error: {} as Error,
    formExtraHours: {
        employee_uuid: '',
        date: '',
        extra_hours_type: '',
        extra_hours: '',
        note: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshExtraHours() {
    emit('refreshExtraHours')
}

async function saveScheduleSlot(extraHoursDetails: any) {
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid,
            date: extraHoursDetails.date,
            extra_hours_type: extraHoursDetails.type,
            extra_hours: extraHoursDetails.hours,
            note: extraHoursDetails.note,
        }
        const response = await extraHoursService.saveExtraHour(params)
        if (response) {
            if (isAdmin(userStore.getUser?.role)) {
                successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.form.alert.extraHoursSuccessfullyAdded')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.form.alert.extraHoursRequestSuccessfullyAdded')}.`)
            }
            refreshExtraHours()
            emit('refreshDutySchedules')
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
}

function isAdmin(role: any) {
    return role && role === 'Admin'
}
</script>