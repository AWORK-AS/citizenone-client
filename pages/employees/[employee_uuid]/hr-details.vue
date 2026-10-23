<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('hrDetails.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('hrDetails.title') }}</template>

            <ModulesUserEmployeeTabs />

            <LoadingSpinner :isActive="state.isLoading">
                <div class="mt-8 space-y-5">
                    <Alert type="danger" :text="state.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <template v-if="state.loaded">
                        <!-- Contact -->
                        <div class="rounded-lg border border-gray-200 bg-white p-4">
                            <p class="mb-4 text-sm font-semibold text-gray-900">{{ $t('hrDetails.groups.contact') }}</p>
                            <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
                                <div v-for="field in contactFields" :key="field">
                                    <FormLabel :for="field" :label="fieldLabel(field)" />
                                    <FormTextField v-if="canWrite" :id="field" :name="field"
                                        v-model="state.form[field]" placeholder="" />
                                    <p v-else class="text-sm text-gray-900">{{ display(state.form[field]) }}</p>
                                    <FormError :error="fieldError(field)" />
                                </div>
                            </div>
                        </div>

                        <!-- Person -->
                        <div class="rounded-lg border border-gray-200 bg-white p-4">
                            <p class="mb-4 text-sm font-semibold text-gray-900">{{ $t('hrDetails.groups.person') }}</p>
                            <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <FormLabel for="gender" :label="fieldLabel('gender')" />
                                    <FormSelect v-if="canWrite" id="gender" v-model="state.form.gender"
                                        :options="genderOptions" :searchable="false"
                                        :placeholder="$t('hrDetails.select')" />
                                    <p v-else class="text-sm text-gray-900">{{ optionLabel(genderOptions, state.form.gender) }}</p>
                                    <FormError :error="fieldError('gender')" />
                                </div>
                                <div>
                                    <FormLabel for="nationality" :label="fieldLabel('nationality')" />
                                    <FormSelect v-if="canWrite" id="nationality"
                                        v-model="state.form.nationality_country_uuid" :options="countryOptions"
                                        :placeholder="$t('hrDetails.select')" />
                                    <p v-else class="text-sm text-gray-900">{{ display(state.nationalityName) }}</p>
                                    <FormError :error="fieldError('nationality_country_uuid')" />
                                </div>
                                <div>
                                    <FormLabel for="manager" :label="fieldLabel('manager')" />
                                    <FormSelect v-if="canWrite" id="manager" v-model="state.form.manager_uuid"
                                        :options="managerOptions" :placeholder="$t('hrDetails.select')" />
                                    <p v-else class="text-sm text-gray-900">{{ display(state.managerName) }}</p>
                                    <FormError :error="fieldError('manager_uuid')" />
                                </div>
                            </div>
                        </div>

                        <!-- Employment -->
                        <div class="rounded-lg border border-gray-200 bg-white p-4">
                            <p class="mb-4 text-sm font-semibold text-gray-900">{{ $t('hrDetails.groups.employment') }}</p>
                            <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <FormLabel for="days_per_week" :label="fieldLabel('daysPerWeek')" />
                                    <FormSelect v-if="canWrite" id="days_per_week" v-model="state.form.days_per_week"
                                        :options="daysOptions" :searchable="false"
                                        :placeholder="$t('hrDetails.select')" />
                                    <p v-else class="text-sm text-gray-900">{{ display(state.form.days_per_week) }}</p>
                                    <FormError :error="fieldError('days_per_week')" />
                                </div>
                                <div>
                                    <FormLabel for="pension_start_date" :label="fieldLabel('pensionStartDate')" />
                                    <FormDateField v-if="canWrite" id="pension_start_date" name="pension_start_date"
                                        placeholder="" v-model="state.form.pension_start_date" />
                                    <p v-else class="text-sm text-gray-900">{{ displayDate(state.form.pension_start_date) }}</p>
                                    <FormError :error="fieldError('pension_start_date')" />
                                </div>
                                <div v-for="field in employmentYesNoFields" :key="field.key">
                                    <FormLabel :for="field.key" :label="fieldLabel(field.label)" />
                                    <FormSelect v-if="canWrite" :id="field.key" v-model="state.form[field.key]"
                                        :options="triStateOptions" :searchable="false" />
                                    <p v-else class="text-sm text-gray-900">{{ optionLabel(triStateOptions, state.form[field.key]) }}</p>
                                    <FormError :error="fieldError(field.key)" />
                                </div>
                                <div v-for="field in employmentTextFields" :key="field.key">
                                    <FormLabel :for="field.key" :label="fieldLabel(field.label)" />
                                    <FormTextField v-if="canWrite" :id="field.key" :name="field.key"
                                        v-model="state.form[field.key]" placeholder="" />
                                    <p v-else class="text-sm text-gray-900">{{ display(state.form[field.key]) }}</p>
                                    <FormError :error="fieldError(field.key)" />
                                </div>
                                <div>
                                    <FormLabel for="three_month_interview_at" :label="fieldLabel('threeMonthInterviewAt')" />
                                    <FormDateField v-if="canWrite" id="three_month_interview_at"
                                        name="three_month_interview_at" placeholder=""
                                        v-model="state.form.three_month_interview_at" />
                                    <p v-else class="text-sm text-gray-900">{{ displayDate(state.form.three_month_interview_at) }}</p>
                                    <FormError :error="fieldError('three_month_interview_at')" />
                                </div>
                            </div>
                        </div>

                        <!-- Work -->
                        <div class="rounded-lg border border-gray-200 bg-white p-4">
                            <p class="mb-4 text-sm font-semibold text-gray-900">{{ $t('hrDetails.groups.work') }}</p>
                            <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
                                <div v-for="field in workFields" :key="field.key">
                                    <FormLabel :for="field.key" :label="fieldLabel(field.label)" />
                                    <FormTextArea v-if="canWrite" :id="field.key" :name="field.key" :rows="3"
                                        placeholder="" v-model="state.form[field.key]" />
                                    <p v-else class="whitespace-pre-line text-sm text-gray-900">{{ display(state.form[field.key]) }}</p>
                                    <FormError :error="fieldError(field.key)" />
                                </div>
                            </div>
                        </div>

                        <!-- Pay and bank: only sent by the backend to an admin or the employee. -->
                        <div class="rounded-lg border border-gray-200 bg-white p-4" v-if="state.canSeeBank">
                            <p class="mb-1 text-sm font-semibold text-gray-900">{{ $t('hrDetails.groups.bank') }}</p>
                            <p class="mb-4 text-xs text-gray-400" v-if="!canWriteBank">
                                {{ $t('hrDetails.bankAdminOnly') }}
                            </p>
                            <div class="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <FormLabel for="tax_card_type" :label="fieldLabel('taxCardType')" />
                                    <FormSelect v-if="canWriteBank" id="tax_card_type" v-model="state.form.tax_card_type"
                                        :options="taxCardOptions" :searchable="false"
                                        :placeholder="$t('hrDetails.select')" />
                                    <p v-else class="text-sm text-gray-900">{{ optionLabel(taxCardOptions, state.form.tax_card_type) }}</p>
                                    <FormError :error="fieldError('tax_card_type')" />
                                </div>
                                <div v-for="field in bankFields" :key="field.key">
                                    <FormLabel :for="field.key" :label="fieldLabel(field.label)" />
                                    <FormTextField v-if="canWriteBank" :id="field.key" :name="field.key"
                                        v-model="state.form[field.key]" placeholder="" />
                                    <p v-else class="text-sm text-gray-900">{{ display(state.form[field.key]) }}</p>
                                    <FormError :error="fieldError(field.key)" />
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-end" v-if="canWrite">
                            <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving" @click="save">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </template>
                </div>
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeHrDetailService } from '@/components/api/user/EmployeeHrDetailService'
import type { EmployeeHrDetails, EmployeeHrDetailsPayload } from '@/components/api/user/EmployeeHrDetailService'
import { geolocationService } from '@/components/api/user/GeolocationService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const userStore = useUserStore() as any
const { isAtLeast, seesHrData } = usePermissions()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { formatDateToReadable } = useDatetimeFormatter()

const employeeUuid = String(route.params.employee_uuid)

const breadcrumbLinks = [
    { name: 'employees.employees', translate: true, href: '/employees' },
    { name: 'hrDetails.title', translate: true, href: `/employees/${employeeUuid}/hr-details` },
]

// Who may write is decided by the backend; this only decides what to render. An
// employee reading their own record gets values and no save button.
const isAdmin = computed(() => isAtLeast('Admin'))
const canWrite = computed(() => seesHrData())
const canWriteBank = computed(() => isAdmin.value)

const contactFields = ['private_email', 'private_phone', 'work_phone'] as const
// Stored as booleans: yes, no, or not answered.
const employmentYesNoFields = [
    { key: 'lunch_scheme', label: 'lunchScheme' },
    { key: 'flex_job', label: 'flexJob' },
    { key: 'section_56', label: 'section56' },
] as const
const employmentTextFields = [
    { key: 'termination_reason', label: 'terminationReason' },
    { key: 'sim_card', label: 'simCard' },
    { key: 'contact_status', label: 'contactStatus' },
    { key: 'onboarding_status', label: 'onboardingStatus' },
]
const workFields = [
    { key: 'other_work', label: 'otherWork' },
    { key: 'working_hours_comment', label: 'workingHoursComment' },
    { key: 'not_work_with', label: 'notWorkWith' },
]
const bankFields = [
    { key: 'bank_reg_no', label: 'bankRegNo' },
    { key: 'bank_account_no', label: 'bankAccountNo' },
    { key: 'cvr', label: 'cvr' },
]
const contactLabels: Record<string, string> = {
    private_email: 'privateEmail',
    private_phone: 'privatePhone',
    work_phone: 'workPhone',
}

function emptyForm(): Record<string, any> {
    return {
        private_email: '', private_phone: '', work_phone: '',
        gender: null, nationality_country_uuid: null, manager_uuid: null,
        pension_start_date: '', lunch_scheme: null, flex_job: null, section_56: null,
        days_per_week: null, termination_reason: '', three_month_interview_at: '',
        other_work: '', working_hours_comment: '', not_work_with: '', sim_card: '', contact_status: '', onboarding_status: '',
        tax_card_type: null, bank_reg_no: '', bank_account_no: '', cvr: '',
    }
}

const state = reactive({
    error: {} as Error,
    fieldErrors: {} as Record<string, string[]>,
    form: emptyForm(),
    canSeeBank: false,
    countries: [] as any[],
    employees: [] as any[],
    isLoading: false,
    isSaving: false,
    loaded: false,
    managerName: '',
    nationalityName: '',
})

const genderOptions = computed(() =>
    ['female', 'male', 'other'].map((value) => ({ value, label: t('hrDetails.genders.' + value) })))
const taxCardOptions = computed(() =>
    ['main', 'secondary', 'self_employed'].map((value) => ({ value, label: t('hrDetails.taxCards.' + value) })))
const daysOptions = computed(() =>
    [0, 1, 2, 3, 4, 5, 6, 7].map((value) => ({ value: String(value), label: String(value) })))
// A boolean cannot tell "no" from "not answered", so the select has two answers
// and clearing it means "not answered". Values are strings: a select does not
// hold false or 0 reliably.
const triStateOptions = computed(() => [
    { value: 'yes', label: t('hrDetails.yes') },
    { value: 'no', label: t('hrDetails.no') },
])
const countryOptions = computed(() =>
    state.countries.map((country: any) => ({ value: country.uuid, label: country.name })))
const managerOptions = computed(() =>
    state.employees
        .filter((user: any) => user?.uuid !== employeeUuid)
        .map((user: any) => ({ value: user.uuid, label: `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() })))

function fieldLabel(key: string) {
    return t('hrDetails.fields.' + (contactLabels[key] ?? key))
}

function fieldError(key: string) {
    return state.fieldErrors?.[key]?.[0]
}

function display(value: any) {
    return value === null || value === undefined || value === '' ? '-' : String(value)
}

function displayDate(value: any) {
    return value ? formatDateToReadable(value) : '-'
}

function optionLabel(options: any[], value: any) {
    const match = options.find((option: any) => option.value === value)
    return match && value !== null && value !== undefined ? match.label : '-'
}

function toYesNo(value: boolean | null | undefined) {
    return value === true ? 'yes' : value === false ? 'no' : null
}

function fromYesNo(value: any): boolean | null {
    return value === 'yes' ? true : value === 'no' ? false : null
}

function applyDetails(data: EmployeeHrDetails) {
    const form = emptyForm()
    for (const key of Object.keys(form)) {
        const value = (data as any)[key]
        if (value !== undefined && value !== null) form[key] = value
    }
    for (const field of employmentYesNoFields) {
        form[field.key] = toYesNo(data[field.key])
    }
    form.days_per_week = data.days_per_week === null || data.days_per_week === undefined ? null : String(data.days_per_week)
    form.nationality_country_uuid = data.nationality?.uuid ?? null
    form.manager_uuid = data.manager?.uuid ?? null
    state.form = form
    state.nationalityName = data.nationality?.name ?? ''
    state.managerName = data.manager?.name ?? ''
    state.canSeeBank = !!data.can_see_bank
}

async function fetchDetails() {
    state.isLoading = true
    state.error = {}
    try {
        const response = await employeeHrDetailService.getHrDetails(employeeUuid)
        if (response?.data) applyDetails(response.data)
        state.loaded = true
    } catch (error: any) {
        state.error = error
    }
    state.isLoading = false
}

async function fetchLookups() {
    if (!canWrite.value) return
    try {
        const [countries, employees] = await Promise.all([
            geolocationService.getAllCountries(),
            userService.getAllUsersWithoutAllUsersOption(),
        ])
        state.countries = countries?.data ?? []
        state.employees = employees?.data ?? []
    } catch (_) {
        state.countries = []
        state.employees = []
    }
}

// Empty text clears the field (null) instead of storing an empty string.
function text(value: any) {
    const trimmed = typeof value === 'string' ? value.trim() : value
    return trimmed === '' || trimmed === undefined ? null : trimmed
}

function buildPayload(): EmployeeHrDetailsPayload {
    const f = state.form
    const payload: EmployeeHrDetailsPayload = {
        private_email: text(f.private_email),
        private_phone: text(f.private_phone),
        work_phone: text(f.work_phone),
        gender: f.gender ?? null,
        nationality_country_uuid: f.nationality_country_uuid ?? null,
        manager_uuid: f.manager_uuid ?? null,
        pension_start_date: text(f.pension_start_date),
        lunch_scheme: fromYesNo(f.lunch_scheme),
        flex_job: fromYesNo(f.flex_job),
        section_56: fromYesNo(f.section_56),
        days_per_week: f.days_per_week === null || f.days_per_week === undefined || f.days_per_week === '' ? null : Number(f.days_per_week),
        termination_reason: text(f.termination_reason),
        three_month_interview_at: text(f.three_month_interview_at),
        other_work: text(f.other_work),
        working_hours_comment: text(f.working_hours_comment),
        not_work_with: text(f.not_work_with),
        sim_card: text(f.sim_card),
        contact_status: text(f.contact_status),
        onboarding_status: text(f.onboarding_status),
    }
    // Only an admin may change bank data, and only when the backend sent it.
    if (state.canSeeBank && canWriteBank.value) {
        payload.tax_card_type = f.tax_card_type ?? null
        payload.bank_reg_no = text(f.bank_reg_no)
        payload.bank_account_no = text(f.bank_account_no)
        payload.cvr = text(f.cvr)
    }
    return payload
}

async function save() {
    state.isSaving = true
    state.error = {}
    state.fieldErrors = {}
    try {
        const response = await employeeHrDetailService.updateHrDetails(employeeUuid, buildPayload())
        if (response?.data) applyDetails(response.data)
        successAlert(`${t('alert.success')}!`, `${t('hrDetails.alert.saved')}.`)
    } catch (error: any) {
        state.fieldErrors = error?.errors ?? {}
        errorAlert(t('alert.warning'), error?.message ?? t('hrDetails.alert.saveFailed'))
    }
    state.isSaving = false
}

onMounted(() => {
    fetchDetails()
    fetchLookups()
})
</script>
