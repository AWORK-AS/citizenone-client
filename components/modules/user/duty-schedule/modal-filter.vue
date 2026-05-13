<template>
    <div>
        <Modal size="sm" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <form @submit.prevent="submitForm()" id="calendarFilterForm">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="space-y-3">
                        <div class="space-y-1">
                            <FormLabel for="department_uuids" :label="$t('dutySchedules.filter.departments')" />
                            <FormSelectMultiple id="department_uuids" :options="state.options.departments"
                                v-model="state.formFilter.department_uuids" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="employee_uuids" :label="$t('dutySchedules.filter.employees')" />
                            <FormSelectMultiple id="employee_uuids" :options="state.options.employees"
                                v-model="state.formFilter.employee_uuids" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="employment_status" :label="$t('dutySchedules.filter.employmentStatus')" />
                            <FormSelectMultiple id="employment_status" :options="state.options.employment_status"
                                v-model="state.formFilter.employment_status" />
                        </div>
                        <div class="space-y-1">
                            <div class="flex items-center justify-between">
                                <FormLabel :label="$t('dutySchedules.timeRange')" />
                                <button type="button"
                                    v-if="state.formFilter.time_from || state.formFilter.time_to"
                                    @click="state.formFilter.time_from = ''; state.formFilter.time_to = ''"
                                    class="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                                    <Icon name="ph:x-circle" class="h-3.5 w-3.5" />
                                    {{ $t('clear') }}
                                </button>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <FormLabel for="time_from" :label="$t('dutySchedules.filter.timeFrom')" />
                                    <FormTimeField id="time_from" name="time_from"
                                        :placeholder="$t('dutySchedules.filter.timeFrom')"
                                        v-model:value="state.formFilter.time_from" />
                                </div>
                                <div>
                                    <FormLabel for="time_to" :label="$t('dutySchedules.filter.timeTo')" />
                                    <FormTimeField id="time_to" name="time_to"
                                        :placeholder="$t('dutySchedules.filter.timeTo')"
                                        v-model:value="state.formFilter.time_to" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormButton type="button" buttonStyle="cancel" @click="closeModal()">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="submit" buttonStyle="primary">
                                {{ $t('filter') }}
                            </FormButton>
                        </div>
                    </div>
                </form>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const { t } = useI18n()
const emit = defineEmits(['close', 'setFilter'])

const state = reactive({
    error: {} as Error,
    formFilter: {
        department_uuids: [],
        employment_status: [],
        employee_uuids: [],
        time_from: '',
        time_to: '',
    },
    isPageLoading: false,
    options: {
        departments: [],
        employees: [],
        employment_status: [
            { value: 'permanent', label: `${t('employees.employmentStatus.permanent')}` },
            { value: 'temporary', label: `${t('employees.employmentStatus.temporary')}` },
            { value: 'substitute', label: `${t('employees.employmentStatus.substitute')}` },
        ],
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchAllDepartments()
        fetchAllUsers()
    }
})

function closeModal() {
    emit('close')
}

async function fetchAllDepartments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await departmentService.getAllDepartments(params)
        if (response) {
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.name,
                })
            )
            state.options.departments = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await userService.getAllUsers(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                })
            )
            state.options.employees = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function submitForm() {
    emit('setFilter', state.formFilter)
    closeModal()
}
</script>

<style>
#calendarFilterForm .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>