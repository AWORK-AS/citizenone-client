<template>
    <div>
        <Modal size="xs" :title="$t('dutySchedules.download.download')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-3">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <form @submit.prevent="handleDownload()" id="formDownloadSchedule">
                            <div class="space-y-3">
                                <fieldset>
                                    <RadioGroup v-model="state.formDownload.mode"
                                        class="mt-6 grid grid-cols-1 gap-y-6 md:grid-cols-2 md:gap-x-4">
                                        <RadioGroupOption as="template" v-for="mode in state.options.downloadModeLists"
                                            :key="mode.id" :value="mode" :aria-label="mode.title"
                                            v-slot="{ active, checked }">
                                            <div
                                                :class="[active ? 'border-primary ring-1 ring-primary' : 'border-gray-300', 'relative flex cursor-pointer rounded-full border bg-white p-4 shadow-xs focus:outline-hidden']">
                                                <span class="flex flex-1">
                                                    <span class="flex flex-col">
                                                        <p class="block text-sm font-medium text-gray-900">
                                                            <span v-if="mode.title === 'current_view'">
                                                                {{ $t('dutySchedules.download.filter.currentView') }}
                                                            </span>
                                                            <span v-if="mode.title === 'filtered_view'">
                                                                {{ $t('dutySchedules.download.filter.filteredView') }}
                                                            </span>
                                                        </p>
                                                    </span>
                                                </span>
                                                <Icon name="ph:check-circle"
                                                    :class="[!checked ? 'invisible' : '', 'size-5 text-primary']"
                                                    aria-hidden="true" />
                                                <span
                                                    :class="[active ? 'border' : 'border-1', checked ? 'border-primary' : 'border-transparent', 'pointer-events-none absolute -inset-px rounded-full']"
                                                    aria-hidden="true" />
                                            </div>
                                        </RadioGroupOption>
                                    </RadioGroup>
                                </fieldset>
                                <div class="space-y-1">
                                    <FormLabel for="date" :label="$t('dutySchedules.download.date')" />
                                    <FormDateRangeField id="date" name="date_range"
                                        :placeholder="$t('dutySchedules.download.filter.filterDate')"
                                        v-model="state.filter.date_range" />
                                    <FormError :error="v$?.filter.date_range?.$errors[0]?.$message.toString()" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="download_type" :label="$t('dutySchedules.download.downloadType')" />
                                    <FormSelect id="download_type" name="download_type"
                                        :options="state.options.downloadType"
                                        v-model="state.formDownload.download_type" />
                                    <FormError
                                        :error="v$?.formDownload?.download_type?.$errors[0]?.$message.toString()" />
                                </div>
                                <div class="space-y-1">
                                    <div class="flex justify-between items-center py-0.5">
                                        <p class="text-sm text-gray-600">
                                            {{ customPagesStore.getCustomPagesName?.department ??
                                                $t('dutySchedules.download.department') }}
                                        </p>
                                        <span class="text-xs cursor-pointer text-tertiary hover:text-tertiary-800"
                                            @click="state.modal.isAddDepartmentOpen = true">
                                            {{ $t('departments.addNewDepartment') }}
                                        </span>
                                    </div>
                                    <FormSelectMultiple id="departments" :options="state.options.departments"
                                        v-model="state.formDownload.departments" />
                                    <FormError
                                        :error="v$?.formDownload?.departments?.$errors[0]?.$message.toString()" />
                                    <FormError :error="state?.error?.errors?.departments_uuid?.[0]" />
                                </div>
                                <div class="space-y-1">
                                    <FormLabel for="delimiter"
                                        :label="$t('dutySchedules.download.delimiter.delimiter')" />
                                    <FormSelect id="delimiter" name="delimiter" :options="state.options.delimiters"
                                        v-model="state.formDownload.delimiter" />
                                    <FormError :error="v$?.formDownload?.delimiter?.$errors[0]?.$message.toString()" />
                                </div>
                                <div class="space-y-3" v-if="state.formDownload.mode.title === 'filtered_view'">
                                    <div class="space-y-1">
                                        <FormLabel for="employee_uuids" :label="$t('dutySchedules.filter.employees')" />
                                        <FormSelectMultiple id="employee_uuids" :options="state.options.employees"
                                            v-model="state.formDownload.employee_uuids" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="employment_status"
                                            :label="$t('dutySchedules.filter.employmentStatus')" />
                                        <FormSelectMultiple id="employment_status"
                                            :options="state.options.employment_status"
                                            v-model="state.formDownload.employment_status" />
                                    </div>
                                    <div class="space-y-1">
                                        <div class="w-fit flex items-center cursor-pointer"
                                            @click="state.formDownload.show_leaves_only = !state.formDownload.show_leaves_only">
                                            <FormCheckbox :value="state.formDownload.show_leaves_only" />
                                            {{ $t('dutySchedules.download.downloadOnlyLeaveTypes') }}
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <div class="w-fit flex items-center cursor-pointer"
                                        @click="state.formDownload.archived_employees_only = !state.formDownload.archived_employees_only">
                                        <FormCheckbox :value="state.formDownload.archived_employees_only" />
                                        {{ $t('dutySchedules.download.archivedEmployeesOnly') }}
                                    </div>
                                </div>
                            </div>
                            <div class="mt-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full">
                                        {{ $t('dutySchedules.download.download') }}
                                    </FormButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </LoadingSpinner>
                <ModulesUserDepartmentModalNew :isModalOpen="state.modal.isAddDepartmentOpen"
                    @close="state.modal.isAddDepartmentOpen = false" @refreshDepartments="fetchDepartments" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import { departmentService } from '@/components/api/user/DepartmentService'
import { dutyScheduleService } from '@/components/api/user/DutyScheduleService'
import { userService } from '@/components/api/user/UserService'
import { useDepartmentStore } from '@/store/department'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { saveAs } from 'file-saver'

const props = defineProps({
    filter: {
        type: Object,
        required: required,
    },
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedDate: {
        type: String,
        required: true,
    }
})
const { t } = useI18n()
const emit = defineEmits(['close'])
const customPagesStore = useCustomPagesStore() as any
const departmentStore = useDepartmentStore() as any

const state = reactive({
    error: {} as Error,
    filter: {
        date_range: [] as any,
    },
    isPageLoading: false,
    formDownload: {
        mode: 'current_view', // current_view | filtered_view
        departments: [],
        delimiter: '',
        employee_uuids: [],
        employment_status: [],
        download_type: '',
        date_start: '',
        date_end: '',
        show_leaves_only: false,
        archived_employees_only: false,
    } as any,
    modal: {
        isAddDepartmentOpen: false,
    },
    options: {
        departments: [],
        delimiters: [
            { value: 'comma', label: `${t('dutySchedules.download.delimiter.comma')}` },
            { value: 'semicolon', label: `${t('dutySchedules.download.delimiter.semicolon')}` },
        ],
        downloadModeLists: [
            { id: 1, title: 'current_view' },
            { id: 2, title: 'filtered_view' },
        ],
        employees: [],
        employment_status: [
            { value: 'permanent', label: `${t('employees.employmentStatus.permanent')}` },
            { value: 'temporary', label: `${t('employees.employmentStatus.temporary')}` },
            { value: 'substitute', label: `${t('employees.employmentStatus.substitute')}` },
        ],
        downloadType: [
            { value: 'csv', label: 'Download hours in csv' },
            { value: 'excel', label: 'Download hours in excel' },
            { value: 'overview', label: 'Download duty schedule overview' }
        ]
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.formDownload.download_type = ''
        state.formDownload.departments = []
        state.options.downloadType[0].label = `${t('dutySchedules.download.downloadHoursInCSV')}`
        state.options.downloadType[1].label = `${t('dutySchedules.download.downloadHoursInExcel')}`
        state.options.downloadType[2].label = `${t('dutySchedules.download.downloadOverview')}`
        state.formDownload.show_leaves_only = false
        state.formDownload.date_start = moment(props.selectedDate).startOf('isoWeek').format('YYYY-MM-DD')
        state.formDownload.date_end = moment(props.selectedDate).endOf('isoWeek').format('YYYY-MM-DD')
        state.filter.date_range = [
            moment(props.selectedDate).startOf('isoWeek').format('YYYY-MM-DD'),
            moment(props.selectedDate).endOf('isoWeek').format('YYYY-MM-DD'),
        ]
        fetchDepartments()
        fetchAllUsers()
        state.formDownload.mode = state.options.downloadModeLists.find((item: any) => item.title === 'current_view')
    }
})

watch(() => state.formDownload.mode, (mode: any) => {
    if (mode.title === 'filtered_view') {
        state.formDownload.departments = props.filter.department_uuids
        state.formDownload.employment_status = props.filter.employment_status
        state.formDownload.employee_uuids = props.filter.employee_uuids
    }
})

const rules = computed(() => {
    return {
        filter: {
            date_range: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
        formDownload: {
            departments: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            download_type: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

watch(() => state.filter.date_range, (dates: any) => {
    state.formDownload.date_start = dates?.[0]
    state.formDownload.date_end = dates?.[1]
})

async function handleDownload() {
    v$.value.$validate()
    if (!v$.value.$error) {
        downloadDutySchedule()
    }
}

async function fetchDepartments() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
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

            if (!['All departments', 'Alle afdelinger'].includes(departmentStore.getSelectedDepartmentName)) {
                state.formDownload.departments.push(departmentStore.getSelectedDepartment?.uuid)
            }
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

async function downloadDutySchedule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department_uuid: Array(state.formDownload.departments),
            download_type: state.formDownload.download_type,
            date_start: state.formDownload.date_start,
            date_end: state.formDownload.date_end,
            show_leaves_only: state.formDownload.show_leaves_only,
            archived_employees_only: state.formDownload.archived_employees_only,
            delimiter: state.formDownload.delimiter,
        } as any
        if (state.formDownload.employment_status) {
            params.employment_status = Array(state.formDownload.employment_status)
        }
        if (state.formDownload.employee_uuids?.length > 0) {
            params.employee_uuids = Array(state.formDownload.employee_uuids)
        }
        const response = await dutyScheduleService.downloadDutySchedules(params)
        if (response) {
            if (response) {
                if (state.formDownload.download_type === 'csv') {
                    const file = new Blob([response], { type: 'text/csv;charset=utf-8;' })
                    saveAs(file, `${customPagesStore.getCustomPagesName?.dutySchedules?.replaceAll(' ', '-')}.csv`)
                } else {
                    saveAs(response, `${customPagesStore.getCustomPagesName?.dutySchedules?.replaceAll(' ', '-')}`)
                }
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#formDownloadSchedule .multiselect-dropdown {
    max-height: 5rem !important;
}
</style>