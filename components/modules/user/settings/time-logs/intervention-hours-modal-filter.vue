<template>
    <div>
        <Modal size="sm" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="submitForm()" id="calendarFilterForm">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="space-y-3">
                            <div class="space-y-1">
                                <FormLabel for="department_uuids" :label="$t('citizens.interventionHours.filter.departments')" />
                                <FormSelectMultiple id="department_uuids" :options="state.options.departments"
                                    v-model="state.formFilter.department_uuids" />
                            </div>
                            <div class="space-y-1" v-if="!props.type || props.type !== 'employee'">
                                <FormLabel for="employee_uuids" :label="$t('citizens.interventionHours.filter.employees')" />
                                <FormSelectMultiple id="employee_uuids" :options="state.options.employees"
                                    v-model="state.formFilter.employee_uuids" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="citizen_uuids" :label="$t('citizens.interventionHours.filter.citizens')" />
                                <FormSelectMultiple id="citizen_uuids" :options="state.options.citizens"
                                    v-model="state.formFilter.citizen_uuids" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="employment_status" :label="$t('citizens.interventionHours.filter.type')" />
                                <FormSelect id="employment_status" :options="state.options.employment_status"
                                    v-model="state.formFilter.employment_status" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="date_range" :label="$t('citizens.interventionHours.filter.filterDate')" />
                                <FormDateRangeField name="date_range"
                                    v-model="state.formFilter.date_range" />
                            </div>
                        </div>
                        <div class="mt-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormButton type="button" buttonStyle="cancel" class="rounded-md" @click="closeModal()">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="submit" buttonStyle="primary" class="rounded-md">
                                    {{ $t('filter') }}
                                </FormButton>
                            </div>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/user/UserService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { citizenService } from '~/components/api/user/CitizenService'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    type: {
        type: String,
        required: false,
    }
})
const { t } = useI18n()
const emit = defineEmits(['close', 'setFilter'])

const state = reactive({
    error: {} as Error,
    formFilter: {
        department_uuids: [],
        employment_status: [],
        employee_uuids: [],
        citizen_uuids: [],
        date_range: [] as any,
    },
    isPageLoading: false,
    options: {
        departments: [],
        employees: [],
        citizens: [],
        employment_status: [
            { value: '', label: t('citizens.interventionHours.filter.allTypes') },
            { value: 'work', label: t('citizens.interventionHours.filter.work') },
            { value: 'transport', label: t('citizens.interventionHours.filter.transport') },
        ],
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchAllDepartments()
        fetchAllUsers()
        fetchAllCitizens()
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

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {}
        const response = await citizenService.getAllCitizens(params)
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + (user?.lastname ?? ''),
                })
            )
            state.options.citizens = options
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