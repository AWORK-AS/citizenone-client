<template>
    <div>
        <Modal size="xs" :title="hasScheduleManageAccess ?
            $t('dutySchedules.extraHours.newExtraHours') :
            $t('dutySchedules.extraHours.newExtraHoursRequest')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDutyScheduleExtraHoursForm formType="create"
                        :selectedExtraHoursRequest="state.formExtraHours" :error="state.error"
                        :isModalLoading="state.isPageLoading"
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
import { usePermissions } from '@/composables/usePermissions'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const { isAtLeast, can } = usePermissions()
const hasScheduleManageAccess = computed(() => isAtLeast('Admin') || can('update_schedule'))

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
        extra_hours_tags: [],
        extra_hours: '',
        note: '',
    },
    isPageLoading: false,
})

function closeModal() {
    if (state.isPageLoading) return
    emit('close')
}

function refreshExtraHours() {
    emit('refreshExtraHours')
}

async function saveScheduleSlot(extraHoursDetails: any) {
    state.isPageLoading = true
    try {
        const params = {
            user_uuid: props.selectedEmployee?.uuid,
            date: extraHoursDetails.date,
            extra_hours_type: extraHoursDetails.type,
            extra_hours_tags_uuid: extraHoursDetails.extra_hours_tags,
            extra_hours: extraHoursDetails.hours,
            note: extraHoursDetails.note,
            department_uuids: extraHoursDetails.department_uuids,
        }
        const response = await extraHoursService.saveExtraHour(params)
        if (response) {
            if (hasScheduleManageAccess.value) {
                successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.form.alert.extraHoursSuccessfullyAdded')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('dutySchedules.extraHours.form.alert.extraHoursRequestSuccessfullyAdded')}.`)
            }
            refreshExtraHours()
            emit('refreshDutySchedules')
            state.isPageLoading = false
            closeModal()
            return
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

</script>