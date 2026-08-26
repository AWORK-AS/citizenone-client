<template>
    <div>
        <Modal size="lg" :title="$t('dutySchedules.leaveRequests.table.confirmation.approveAudience.title')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <p class="text-sm text-gray-600">
                            {{ $t('dutySchedules.leaveRequests.table.confirmation.approveLeaveRequestConfirmation') }}?
                        </p>
                        <div class="space-y-1">
                            <FormLabel for="audience_type"
                                :label="$t('dutySchedules.leaveRequests.table.confirmation.approveAudience.audienceLabel')" />
                            <FormSelect id="audience_type" :options="state.audienceOptions"
                                v-model="state.audienceType" :searchable="false" :canClear="false" />
                        </div>
                        <div class="space-y-1" v-if="state.audienceType === 'job_title'">
                            <FormLabel for="job_title_uuid"
                                :label="$t('dutySchedules.scheduleSlots.form.jobTitle')" />
                            <FormSelectMultiple id="job_title_uuid" :options="state.options.jobTitles"
                                v-model="state.jobTitleUuid" />
                            <FormError
                                :error="state.validationError.jobTitle ? $t('dutySchedules.leaveRequests.table.confirmation.approveAudience.jobTitleRequired') : ''" />
                        </div>
                        <div class="space-y-1" v-if="state.audienceType === 'job_title'">
                            <FormLabel for="job_specialty_uuid"
                                :label="$t('dutySchedules.scheduleSlots.form.jobSpecialty')" />
                            <FormSelectMultiple id="job_specialty_uuid" :options="state.options.jobSpecialties"
                                v-model="state.jobSpecialtyUuid" />
                        </div>
                        <div class="space-y-1" v-if="state.audienceType === 'employee'">
                            <FormLabel for="user_uuid"
                                :label="$t('dutySchedules.leaveRequests.table.confirmation.approveAudience.employeeLabel')" />
                            <FormSelect id="user_uuid" :options="state.options.employees" v-model="state.userUuid" />
                            <FormError
                                :error="state.validationError.employee ? $t('dutySchedules.leaveRequests.table.confirmation.approveAudience.employeeRequired') : ''" />
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal"
                                :disabled="state.isLoading">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="success" @click="submit" :disabled="state.isLoading">
                                {{ $t('dutySchedules.leaveRequests.table.actions.approve') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { jobTitleService } from '@/components/api/user/JobTitleService'
import { jobSpecialtyService } from '@/components/api/user/JobSpecialtyService'
import { employeeService } from '@/components/api/user/EmployeeService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'confirm'])

const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    isLoading: false,
    audienceType: 'everyone',
    jobTitleUuid: [] as string[],
    jobSpecialtyUuid: [] as string[],
    userUuid: null as string | null,
    validationError: {
        jobTitle: false,
        employee: false,
    },
    audienceOptions: [] as any,
    options: {
        jobTitles: [] as any,
        jobSpecialties: [] as any,
        employees: [] as any,
    },
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.audienceType = 'everyone'
        state.jobTitleUuid = []
        state.jobSpecialtyUuid = []
        state.userUuid = null
        state.validationError = { jobTitle: false, employee: false }
        state.audienceOptions = [
            { value: 'everyone', label: t('dutySchedules.leaveRequests.table.confirmation.approveAudience.everyone') },
            { value: 'job_title', label: t('dutySchedules.leaveRequests.table.confirmation.approveAudience.jobTitleSpecialty') },
            { value: 'employee', label: t('dutySchedules.leaveRequests.table.confirmation.approveAudience.employee') },
        ]
        fetchJobTitles()
        fetchEmployees()
    }
})

watch(() => state.jobTitleUuid, () => {
    fetchJobSpecialties(state.jobTitleUuid)
})

async function fetchJobTitles() {
    try {
        const response = await jobTitleService.getAllJobTitles()
        if (response) {
            state.options.jobTitles = response.data.map((item: any) => ({ value: item.uuid, label: item.title }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchJobSpecialties(jobTitleUuid: string[]) {
    try {
        const response = await jobSpecialtyService.getAllJobSpecialties({ job_title_uuids: JSON.stringify(jobTitleUuid) })
        if (response) {
            state.options.jobSpecialties = response.data.map((item: any) => ({ value: item.uuid, label: item.title }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchEmployees() {
    try {
        const response = await employeeService.getEmployees({})
        if (response?.data) {
            state.options.employees = response.data.map((item: any) => ({
                value: item.uuid,
                label: `${item.firstname} ${item.lastname ?? ''}`,
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

function closeModal() {
    if (state.isLoading) return
    emit('close')
}

function submit() {
    state.validationError.jobTitle = state.audienceType === 'job_title' && state.jobTitleUuid.length === 0
    state.validationError.employee = state.audienceType === 'employee' && !state.userUuid

    if (state.validationError.jobTitle || state.validationError.employee) {
        return
    }

    emit('confirm', {
        audience_type: state.audienceType,
        job_title_uuid: state.audienceType === 'job_title' ? state.jobTitleUuid : [],
        job_specialty_uuid: state.audienceType === 'job_title' ? state.jobSpecialtyUuid : [],
        user_uuid: state.audienceType === 'employee' ? state.userUuid : null,
    })
}
</script>
