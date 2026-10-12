<template>
    <Modal size="sm" :title="$t('protocols.attendanceExport.title')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <LoadingSpinner :isActive="state.isDownloading">
                <form class="space-y-4" @submit.prevent="download">
                    <Alert type="danger" :text="errorMessage" v-if="errorMessage" />
                    <p class="text-sm text-gray-600">{{ $t('protocols.attendanceExport.help') }}</p>

                    <div>
                        <p class="text-sm font-medium text-gray-700 mb-2">{{ $t('protocols.attendanceExport.period') }}</p>
                        <div class="flex flex-wrap gap-2 mb-3">
                            <FormButton type="button" buttonStyle="action" buttonSize="xs" @click="pickThisMonth">
                                {{ $t('protocols.attendanceExport.thisMonth') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="action" buttonSize="xs" @click="pickLastMonth">
                                {{ $t('protocols.attendanceExport.lastMonth') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="action" buttonSize="xs" @click="pickThisYear">
                                {{ $t('protocols.attendanceExport.thisYear') }}
                            </FormButton>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div class="space-y-1">
                                <FormLabel for="attendance_start_date" :label="$t('protocols.form.startDate')" />
                                <FormDateField id="attendance_start_date" name="attendance_start_date"
                                    v-model="state.form.start_date" />
                                <FormError :error="state.error?.errors?.start_date?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="attendance_end_date" :label="$t('protocols.form.endDate')" />
                                <FormDateField id="attendance_end_date" name="attendance_end_date"
                                    v-model="state.form.end_date" />
                                <FormError :error="state.error?.errors?.end_date?.[0]" />
                            </div>
                        </div>
                    </div>

                    <div class="space-y-1">
                        <FormLabel for="attendance_departments" :label="$t('protocols.attendanceExport.departments')" />
                        <FormSelectMultiple id="attendance_departments" name="attendance_departments" appendToBody
                            :options="state.departmentOptions" v-model="state.form.department_uuids" />
                        <p class="text-xs text-gray-500">{{ $t('protocols.attendanceExport.allDepartmentsHint') }}</p>
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="attendance_protocols" :label="$t('protocols.attendanceExport.protocols')" />
                        <FormSelectMultiple id="attendance_protocols" name="attendance_protocols" appendToBody
                            :options="state.protocolOptions" v-model="state.form.protocol_uuids" />
                    </div>
                    <div class="space-y-1">
                        <FormLabel for="attendance_citizens" :label="$t('protocols.form.citizens')" />
                        <FormSelectMultiple id="attendance_citizens" name="attendance_citizens" appendToBody
                            :options="state.citizenOptions" v-model="state.form.citizen_uuids" />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                        <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                            {{ $t('cancel') }}
                        </FormButton>
                        <FormButton type="submit" buttonStyle="primary" class="w-full" data-testid="attendance-download">
                            <Icon name="ph:download-simple" class="size-4" aria-hidden="true" />
                            {{ $t('protocols.attendanceExport.download') }}
                        </FormButton>
                    </div>
                </form>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import moment from 'moment'
import { citizenProtocolService } from '@/components/api/user/CitizenProtocolService'
import { citizenService } from '@/components/api/user/CitizenService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { protocolService } from '@/components/api/user/ProtocolService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    error: {
        type: Object,
        required: false,
    },
})
const emit = defineEmits(['close'])

const departmentStore = useDepartmentStore()
const DATE_FORMAT = 'YYYY-MM-DD'

const state = reactive({
    isDownloading: false,
    error: {} as Error,
    departments: [] as any[],
    departmentOptions: [] as any[],
    protocolOptions: [] as any[],
    citizenOptions: [] as any[],
    form: {
        start_date: moment().startOf('month').format(DATE_FORMAT),
        end_date: moment().format(DATE_FORMAT),
        department_uuids: [] as string[],
        protocol_uuids: [] as string[],
        citizen_uuids: [] as string[],
    },
})

const errorMessage = computed(() => state.error?.message ?? '')

function pickThisMonth() {
    state.form.start_date = moment().startOf('month').format(DATE_FORMAT)
    state.form.end_date = moment().format(DATE_FORMAT)
}

function pickLastMonth() {
    const lastMonth = moment().subtract(1, 'month')
    state.form.start_date = lastMonth.clone().startOf('month').format(DATE_FORMAT)
    state.form.end_date = lastMonth.clone().endOf('month').format(DATE_FORMAT)
}

function pickThisYear() {
    state.form.start_date = moment().startOf('year').format(DATE_FORMAT)
    state.form.end_date = moment().format(DATE_FORMAT)
}

// Opens fresh each time, starting from the department chosen in the header switcher.
watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return
    state.error = {} as Error
    pickThisMonth()
    state.form.protocol_uuids = []
    state.form.citizen_uuids = []
    loadOptions()
})

async function loadOptions() {
    const [departments, protocols, citizens] = await Promise.all([
        departmentService.getAllDepartments({}).catch(() => null),
        protocolService.getProtocolList().catch(() => null),
        citizenService.getAllCitizens({}).catch(() => null),
    ])

    state.departments = departments?.data ?? []
    state.departmentOptions = state.departments.map((department: any) => ({ value: department.uuid, label: department.name }))
    state.protocolOptions = (protocols?.data ?? []).map((protocol: any) => ({ value: protocol.uuid, label: protocol.name }))
    state.citizenOptions = (citizens?.data ?? []).map((citizen: any) => ({
        value: citizen.uuid,
        label: `${citizen.firstname} ${citizen.lastname ?? ''}`.trim(),
    }))

    const selected = state.departments.find((department: any) => department.name === departmentStore.getSelectedDepartmentName)
    state.form.department_uuids = selected ? [selected.uuid] : []
}

async function download() {
    state.error = {} as Error
    state.isDownloading = true
    try {
        // PHP reads a list from repeated `name[]` keys.
        const params: Record<string, any> = {
            start_date: state.form.start_date,
            end_date: state.form.end_date,
        }
        if (state.form.department_uuids.length) params['department_uuids[]'] = state.form.department_uuids
        if (state.form.protocol_uuids.length) params['protocol_uuids[]'] = state.form.protocol_uuids
        if (state.form.citizen_uuids.length) params['citizen_uuids[]'] = state.form.citizen_uuids

        const blob = await citizenProtocolService.exportAttendance(params)
        if (!blob) return

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `attendance_${state.form.start_date}_${state.form.end_date}.xlsx`
        link.click()
        setTimeout(() => URL.revokeObjectURL(url), 60000)
        closeModal()
    } catch (error: any) {
        state.error = error
    } finally {
        // Also when no file came back: the early return above must not leave the spinner on.
        state.isDownloading = false
    }
}

function closeModal() {
    emit('close')
}
</script>
