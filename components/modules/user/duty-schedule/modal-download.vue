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
                                    <div v-if="isDutyTypeReport" class="pt-1 space-y-1">
                                        <div class="flex items-center gap-2" role="group"
                                            :aria-label="$t('dutySchedules.download.reportFormat')">
                                            <button v-for="format in reportFormats" :key="format.value" type="button"
                                                class="px-3 py-1 rounded-lg text-xs font-semibold border transition-colors"
                                                :class="state.formDownload.report_format === format.value
                                                    ? 'bg-primary text-white border-primary'
                                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'"
                                                :aria-pressed="state.formDownload.report_format === format.value"
                                                @click="state.formDownload.report_format = format.value">
                                                {{ format.label }}
                                            </button>
                                        </div>
                                        <p class="text-xs text-gray-400">
                                            {{ $t('dutySchedules.download.dutyTypeReportHint') }}
                                        </p>
                                    </div>
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
                                <div class="space-y-1 duty-type-picker">
                                    <FormLabel for="shift_type_uuids" :label="$t('dutySchedules.download.dutyTypes')" />
                                    <FormSelectMultiple id="shift_type_uuids" :options="shiftTypeOptions"
                                        :placeholder="$t('dutySchedules.download.allDutyTypes')"
                                        v-model="state.formDownload.shift_type_uuids">
                                        <template #option="{ option }">
                                            <span class="flex items-center gap-2">
                                                <span class="inline-block size-3 shrink-0 rounded-full border border-gray-200"
                                                    :style="{ backgroundColor: option.color || 'transparent' }" />
                                                <span>{{ option.label }}</span>
                                            </span>
                                        </template>
                                    </FormSelectMultiple>
                                </div>
                                <div class="space-y-1" v-if="!isDutyTypeReport">
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
                                <!-- The duty type report lists whole shifts; a time range does not apply to it. -->
                                <div class="space-y-1" v-if="!isDutyTypeReport">
                                    <div class="flex items-center justify-between">
                                        <FormLabel :label="$t('dutySchedules.timeRange')" />
                                        <button type="button"
                                            v-if="state.formDownload.time_from || state.formDownload.time_to"
                                            @click="state.formDownload.time_from = ''; state.formDownload.time_to = ''"
                                            class="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                                            <Icon name="ph:x-circle" class="h-3.5 w-3.5" />
                                            {{ $t('clear') }}
                                        </button>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div>
                                            <FormLabel for="dl_time_from" :label="$t('dutySchedules.filter.timeFrom')" />
                                            <FormTimeField id="dl_time_from" name="dl_time_from"
                                                :placeholder="$t('dutySchedules.filter.timeFrom')"
                                                v-model:value="state.formDownload.time_from" />
                                        </div>
                                        <div>
                                            <FormLabel for="dl_time_to" :label="$t('dutySchedules.filter.timeTo')" />
                                            <FormTimeField id="dl_time_to" name="dl_time_to"
                                                :placeholder="$t('dutySchedules.filter.timeTo')"
                                                v-model:value="state.formDownload.time_to" />
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
                                    <FormButton type="button" buttonStyle="cancel" @click="closeModal" :disabled="state.isPageLoading">
                                        {{ $t('cancel') }}
                                    </FormButton>
                                    <FormButton type="submit" buttonStyle="primary" class="w-full" :disabled="state.isPageLoading">
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
import { shiftService } from '@/components/api/user/ShiftService'
import { useDepartmentStore } from '@/store/department'
import { useCustomPagesStore } from '@/store/custom-pages'
import type { Error } from '@/types'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { saveAs } from 'file-saver'
import { EMPLOYMENT_STATUS_LABELS, builtInOptions } from '@/utils/employmentOptions'

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
    },
    // Which calendar view the download was opened from. The date range defaults
    // to that view's span: opening it from the month view and getting one week
    // is not what anyone means by "download the schedule" (Birketoften 31/8).
    calendarView: {
        type: String,
        required: false,
        default: 'week',
    }
})
const { t, locale } = useI18n()
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
        time_from: '',
        time_to: '',
        shift_type_uuids: [] as string[],
        report_format: 'pdf', // pdf | excel, only used by the duty type report
    } as any,
    shiftTypes: [] as any[],
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
        employment_status: builtInOptions(EMPLOYMENT_STATUS_LABELS, t),
        downloadType: [
            { value: 'csv', label: 'Download hours in csv' },
            { value: 'excel', label: 'Download hours in excel' },
            { value: 'overview', label: 'Download duty schedule overview' },
            { value: 'shift_type_report', label: 'Duty type report' },
        ]
    }
})

const isDutyTypeReport = computed(() => state.formDownload.download_type === 'shift_type_report')

const reportFormats = computed(() => [
    { value: 'pdf', label: t('dutySchedules.download.reportFormatPdf') },
    { value: 'excel', label: t('dutySchedules.download.reportFormatExcel') },
])

function shiftTypeName(shiftType: any): string {
    const byLocale: Record<string, string | undefined> = {
        en: shiftType?.en_name,
        dk: shiftType?.dk_name,
        no: shiftType?.no_name,
        sv: shiftType?.sv_name,
    }
    return byLocale[locale.value] || shiftType?.en_name || shiftType?.dk_name || ''
}

// The server's leave rule (DutyScheduleShiftTypes::applyLeaveOnly): flagged as leave, or an
// English or Danish name containing "leave" or "sick". The flag alone would hide e.g. a
// "Vacation leave" type that the leave-only download still includes.
function isLeaveType(shiftType: any): boolean {
    if (shiftType?.is_leave_shift_type) return true
    return [shiftType?.en_name, shiftType?.dk_name]
        .some((name: any) => typeof name === 'string' && /leave|sick/i.test(name))
}

// Ticking "only leave types" narrows the picker to leave types.
const shiftTypeOptions = computed(() => state.shiftTypes
    .filter((shiftType: any) => !state.formDownload.show_leaves_only || isLeaveType(shiftType))
    .map((shiftType: any) => ({
        value: shiftType.uuid,
        label: shiftTypeName(shiftType),
        color: shiftType.color,
    })))

// A selected type that the leave-only filter hides must not stay selected unseen.
watch(() => state.formDownload.show_leaves_only, (leavesOnly: boolean) => {
    if (!leavesOnly) return
    const allowed = new Set(shiftTypeOptions.value.map((option: any) => option.value))
    state.formDownload.shift_type_uuids = state.formDownload.shift_type_uuids.filter((uuid: string) => allowed.has(uuid))
})

async function fetchShiftTypes() {
    try {
        const response = await shiftService.getAllShifts({})
        state.shiftTypes = response?.data ?? []
    } catch (error: any) {
        // The picker is optional; without it the download covers all duty types.
        state.shiftTypes = []
    }
}

/**
 * The span the active view shows, so the download covers what is on screen.
 * Anything unrecognised falls back to the week, which is what it always was.
 */
function defaultRangeForView(): [string, string] {
    const date = moment(props.selectedDate)

    const unit = {
        month: 'month',
        year: 'year',
    }[props.calendarView as string]

    if (props.calendarView === 'half-year') {
        const start = date.clone().month() < 6
            ? date.clone().startOf('year')
            : date.clone().month(6).startOf('month')

        return [
            start.format('YYYY-MM-DD'),
            start.clone().add(5, 'months').endOf('month').format('YYYY-MM-DD'),
        ]
    }

    if (unit) {
        return [
            date.clone().startOf(unit as any).format('YYYY-MM-DD'),
            date.clone().endOf(unit as any).format('YYYY-MM-DD'),
        ]
    }

    return [
        date.clone().startOf('isoWeek').format('YYYY-MM-DD'),
        date.clone().endOf('isoWeek').format('YYYY-MM-DD'),
    ]
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.error = {}
        state.formDownload.download_type = ''
        state.formDownload.departments = []
        state.options.downloadType[0].label = `${t('dutySchedules.download.downloadHoursInCSV')}`
        state.options.downloadType[1].label = `${t('dutySchedules.download.downloadHoursInExcel')}`
        state.options.downloadType[2].label = `${t('dutySchedules.download.downloadOverview')}`
        state.options.downloadType[3].label = `${t('dutySchedules.download.dutyTypeReport')}`
        state.formDownload.show_leaves_only = false
        state.formDownload.shift_type_uuids = []
        state.formDownload.report_format = 'pdf'
        fetchShiftTypes()
        const [defaultStart, defaultEnd] = defaultRangeForView()
        state.formDownload.date_start = defaultStart
        state.formDownload.date_end = defaultEnd
        state.filter.date_range = [defaultStart, defaultEnd]
        state.formDownload.time_from = props.filter?.time_from ?? ''
        state.formDownload.time_to = props.filter?.time_to ?? ''
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
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
        formDownload: {
            departments: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            download_type: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})
const v$ = useVuelidate(rules, state)

function closeModal() {
    if (state.isPageLoading) return
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

// File name from Content-Disposition: filename* first, then filename.
function filenameFromHeaders(headers: Headers | null): string {
    const disposition = headers?.get('content-disposition') || ''
    if (!disposition) return ''

    const encoded = disposition.match(/filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/i)
    if (encoded?.[1]) {
        try {
            return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''))
        } catch {
            // Fall through to the plain filename.
        }
    }

    const plain = disposition.match(/filename\s*=\s*"([^"]+)"/i) || disposition.match(/filename\s*=\s*([^;]+)/i)
    return plain?.[1]?.trim() || ''
}

async function downloadDutySchedule() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department_uuid: Array(state.formDownload.departments),
            download_type: state.formDownload.download_type,
            // The overview PDF renders a calendar grid instead of a run of week
            // tables when the download came from a month-or-longer view.
            layout: ['month', 'half-year', 'year'].includes(props.calendarView as string) ? 'month' : 'week',
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
        if (state.formDownload.time_from && !isDutyTypeReport.value) {
            params.time_from = state.formDownload.time_from
        }
        if (state.formDownload.time_to && !isDutyTypeReport.value) {
            params.time_to = state.formDownload.time_to
        }
        if (state.formDownload.shift_type_uuids?.length > 0) {
            // Array() wraps the list so it goes out as one JSON string; a flat
            // array would be sent as repeated keys and Laravel keeps only the last.
            params.shift_type_uuids = Array(state.formDownload.shift_type_uuids)
        }
        if (isDutyTypeReport.value) {
            params.report_format = state.formDownload.report_format === 'excel' ? 'excel' : 'pdf'
            let responseHeaders: Headers | null = null
            const blob = await dutyScheduleService.downloadDutyTypeReport(params, (headers: Headers) => {
                responseHeaders = headers
            })
            if (blob) {
                saveAs(blob, filenameFromHeaders(responseHeaders) || `duty-type-report.${params.report_format === 'excel' ? 'xlsx' : 'pdf'}`)
            }
            state.isPageLoading = false
            return
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

/* A company has many duty types; at 5rem only two showed at a time. */
#formDownloadSchedule .duty-type-picker .multiselect-dropdown {
    max-height: 15rem !important;
}
</style>