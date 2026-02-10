<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.viewEmployee') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.viewEmployee') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserEmployeeTabs />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-6">
                        <div class="flex gap-x-3 justify-end mb-6" v-if="isAdmin(userStore.getUser?.roles)">
                            <div class="flex justify-end">
                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                    @click="navigateTo(`/employees/${employeeUuid}/view-edit`)">
                                    {{ $t('employees.editEmployee') }}
                                </FormButton>
                            </div>
                            <div class="flex justify-end">
                                <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                    @click="state.modal.isViewCitizensOpen = true">
                                    {{ $t('employees.citizens.assignedCitizens') }}
                                </FormButton>
                            </div>
                        </div>
                        <div
                            class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10">
                            <div>
                                <h2 class="text-base font-semibold leading-7 text-gray-900">
                                    {{ $t('employees.form.header.employeeInformation') }}
                                </h2>
                                <p class="mt-1 text-sm leading-6 text-gray-600">
                                    {{ $t('employees.form.header.essentialDetailsOfTheEmployee') }}.
                                </p>
                            </div>
                            <div
                                class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:px-8 sm:py-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employeeId')" />
                                        <p class="font-medium">{{ state.selectedEmployee.employee_id }}</p>
                                    </div>
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employment.salaryID')" />
                                        <p class="font-medium">{{ state.selectedEmployee.employment?.salary_id }}</p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.firstname')" />
                                        <p class="font-medium">{{ state.selectedEmployee.firstname }}</p>
                                    </div>
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.lastname')" />
                                        <p class="font-medium">{{ state.selectedEmployee.lastname }}</p>
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    <Label :label="$t('employees.form.emailAddress')" />
                                    <p class="font-medium">{{ state.selectedEmployee.email }}</p>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.phone')" />
                                        <p class="font-medium">{{ state.selectedEmployee.phone }}</p>
                                    </div>
                                    <div class="space-y-1" v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                        <Label :label="$t('employees.form.birthday')" />
                                        <p class="font-medium" v-if="state.selectedEmployee.birthday">
                                            {{ formatDateToReadable(state.selectedEmployee.birthday) }}
                                        </p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <Label
                                            :label="customPagesStore.getCustomPagesName?.department ?? $t('employees.form.department')" />
                                        <p class="font-medium" v-if="state.selectedEmployee?.departments?.length > 0">
                                            {{ state.selectedEmployee?.departments }}
                                        </p>
                                    </div>
                                    <div class="space-y-1" v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                        <Label :label="$t('employees.form.role')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee?.role }}
                                        </p>
                                    </div>
                                </div>
                                <div class="space-y-1" v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                    <Label :label="$t('employees.form.street')" />
                                    <p class="font-medium">
                                        {{ state.selectedEmployee?.street }}
                                    </p>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.region')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee?.region }}
                                        </p>
                                    </div>
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.municipality')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee?.municipality }}
                                        </p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.city')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee?.city }}
                                        </p>
                                    </div>
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.postCode')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee?.post_code }}
                                        </p>
                                    </div>
                                </div>
                                <div class="space-y-1" v-if="isAdmin(userStore.getUser?.roles)">
                                    <Label :label="$t('employees.form.permissions.permissions')" />
                                    <div class="flex items-center gap-x-1 text-xs text-muted-400 mt-1">
                                        <div class="text-xs flex flex-wrap gap-2"
                                            v-if="state.selectedEmployee?.permissions?.length > 0">
                                            <span v-for="(permission, index) in state.selectedEmployee?.permissions"
                                                :key=index class="bg-primary px-2 py-1 text-white rounded-md">
                                                <span v-if="permission?.name === 'create'">
                                                    {{ $t('employees.permissions.create') }}
                                                </span>
                                                <span v-if="permission?.name === 'read'">
                                                    {{ $t('employees.permissions.read') }}
                                                </span>
                                                <span v-if="permission?.name === 'update'">
                                                    {{ $t('employees.permissions.update') }}
                                                </span>
                                                <span v-if="permission?.name === 'delete'">
                                                    {{ $t('employees.permissions.delete') }}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-1" v-if="isAdmin(userStore.getUser?.roles)">
                                    <Label :label="$t('employees.form.mediaRisks.mediaRisks')" />
                                    <div class="flex items-center gap-x-1 text-xs text-muted-400 mt-1">
                                        <div class="text-xs flex flex-wrap gap-2"
                                            v-if="state.selectedEmployee?.media_risks?.length > 0">
                                            <span v-for="(mediaRisk, index) in state.selectedEmployee?.media_risks"
                                                :key=index class="bg-primary px-2 py-1 text-white rounded-md">
                                                <span v-if="mediaRisk?.type === 'Incident report'">
                                                    {{ $t('employees.form.mediaRisks.incidentReport') }}
                                                </span>
                                                <span v-if="mediaRisk?.type === 'Medicine deviation'">
                                                    {{ $t('employees.form.mediaRisks.medicineDeviation') }}
                                                </span>
                                                <span v-if="mediaRisk?.type === 'Use of force'">
                                                    {{ $t('employees.form.mediaRisks.useOfForce') }}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10">
                            <div>
                                <h2 class="text-base font-semibold leading-7 text-gray-900">
                                    {{ $t('employees.form.header.employeeInformation') }}
                                </h2>
                                <p class="mt-1 text-sm leading-6 text-gray-600">
                                    {{ $t('employees.form.header.comprehensiveEmploymentDetailsWithinTheOrganization')
                                    }}.
                                </p>
                            </div>
                            <div
                                class="md:col-span-2 space-y-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:px-8 sm:py-6">
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employment.employmentDate')" />
                                        <p class="font-medium" v-if="state.selectedEmployee.employment.employment_date">
                                            {{
                                                formatDateToReadable(state.selectedEmployee.employment.employment_date)
                                            }}
                                        </p>
                                    </div>
                                    <div class="space-y-1" v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                        <Label :label="$t('employees.form.employment.terminationDate')" />
                                        <p class="font-medium"
                                            v-if="state.selectedEmployee.employment.termination_date">
                                            {{
                                                formatDateToReadable(state.selectedEmployee.employment.termination_date)
                                            }}
                                        </p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    v-if="isAdmin(userStore.getUser?.roles)">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employment.annualNormHours')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee.employment.annual_norm_hours ?? 0 }}
                                        </p>
                                    </div>
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employment.weeklyNormHours')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee.employment.weekly_norm_hours ?? 0 }}
                                        </p>
                                    </div>
                                    <div class="space-y-1" v-if="isAdmin(userStore.getUser?.roles)">
                                        <Label :label="$t('employees.form.employment.vacationDays')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee.employment.vacation_days ?? 0 }}
                                        </p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employment.jobTitle')" />
                                        <p class="font-medium">
                                            {{ state.selectedEmployee.employment.job_title }}
                                        </p>
                                    </div>
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employment.jobSpecialty')" />
                                        <p class="font-medium"
                                            v-if="state.selectedEmployee.employment.employee_specialties">
                                            {{ state.selectedEmployee.employment.employee_specialties }}
                                        </p>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employment.workingHours')" />
                                        <p class="font-medium capitalize">
                                            <span
                                                v-if="state.selectedEmployee?.employment?.working_hours === 'full_time'">
                                                {{ $t('employees.workingHours.fulltime') }}
                                            </span>
                                            <span
                                                v-if="state.selectedEmployee?.employment?.working_hours === 'part_time'">
                                                {{ $t('employees.workingHours.parttime') }}
                                            </span>
                                        </p>
                                    </div>
                                    <div class="space-y-1">
                                        <Label :label="$t('employees.form.employment.employmentStatus')" />
                                        <p class="font-medium capitalize">
                                            {{ state.selectedEmployee.employment.employment_status }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3 border-b border-gray-900/10">
                            <div>
                                <h2 class="text-base font-semibold leading-7 text-gray-900">
                                    {{ $t('employees.form.header.emergencyInfo') }}
                                </h2>
                                <p class="mt-1 text-sm leading-6 text-gray-600">
                                    {{ $t('employees.form.header.emergencyContactDetailsInCaseOfAnUrgentSituation') }}.
                                </p>
                            </div>
                            <div class="grid grid-cols-1 md:col-span-2 gap-y-3">
                                <div v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                                    <p class="text-sm text-gray-600 font-semibold leading-5">
                                        {{ $t('employees.form.emergencyInfo.trustees') }}
                                    </p>
                                    <div class="mt-5">
                                        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-8 sm:px-8 sm:py-10"
                                            v-if="state.selectedEmployee.emergencyInfo.trustees?.length === 0">
                                            <p class="text-center text-sm">
                                                {{ $t('theresNoDataAvailableToDisplay') }}
                                            </p>
                                        </div>
                                        <div class="space-y-6" v-else>
                                            <div v-for="(trustee, index) in state.selectedEmployee.emergencyInfo.trustees"
                                                :key="index">
                                                <div
                                                    class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:px-8 sm:py-6">
                                                    <div class="space-y-1">
                                                        <Label :label="$t('employees.form.emergencyInfo.name')" />
                                                        <p class="font-medium">
                                                            {{ trustee.name }}
                                                        </p>
                                                    </div>
                                                    <div class="space-y-1">
                                                        <Label :label="$t('employees.form.emergencyInfo.phone')" />
                                                        <p class="font-medium">
                                                            {{ trustee.phone }}
                                                        </p>
                                                    </div>
                                                    <div class="space-y-1">
                                                        <Label :label="$t('employees.form.emergencyInfo.email')" />
                                                        <p class="font-medium">
                                                            {{ trustee.email }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="grid grid-cols-1 md:col-span-2 gap-y-3 mt-5">
                                    <p class="text-sm text-gray-600 font-semibold leading-5">
                                        {{ $t('employees.form.emergencyInfo.emergencyContacts') }}
                                    </p>
                                    <div class="mt-5">
                                        <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-8 sm:px-8 sm:py-10"
                                            v-if="state.selectedEmployee.emergencyInfo.emergency_contacts?.length === 0">
                                            <p class="text-center text-sm">
                                                {{ $t('theresNoDataAvailableToDisplay') }}
                                            </p>
                                        </div>
                                        <div class="space-y-6" v-else>
                                            <div v-for="(emergency_contact, index) in state.selectedEmployee.emergencyInfo.emergency_contacts"
                                                :key="index">
                                                <div
                                                    class="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-6 sm:px-8 sm:py-6">
                                                    <div class="space-y-1">
                                                        <Label :label="$t('employees.form.emergencyInfo.name')" />
                                                        <p class="font-medium">
                                                            {{ emergency_contact.name }}
                                                        </p>
                                                    </div>
                                                    <div class="space-y-1">
                                                        <Label :label="$t('employees.form.emergencyInfo.phone')" />
                                                        <p class="font-medium">
                                                            {{ emergency_contact.phone }}
                                                        </p>
                                                    </div>
                                                    <div class="space-y-1">
                                                        <Label :label="$t('employees.form.emergencyInfo.email')" />
                                                        <p class="font-medium">
                                                            {{ emergency_contact.email }}
                                                        </p>
                                                    </div>
                                                    <div class="space-y-1">
                                                        <Label :label="$t('employees.form.emergencyInfo.relation')" />
                                                        <p class="font-medium">
                                                            {{ emergency_contact.relation }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 gap-x-8 gap-y-4 pb-10 mb-10 xl:grid-cols-3"
                            v-if="userStore.getUser?.roles?.[0]?.name === 'Admin'">
                            <div>
                                <h2 class="text-base font-semibold leading-7 text-gray-900">
                                    {{ $t('employees.documents.documents') }}
                                </h2>
                                <p class="mt-1 text-sm leading-6 text-gray-600">
                                    {{ $t('employees.documents.documentsShortDescription') }}.
                                </p>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 md:col-span-2 gap-x-5 gap-y-3">
                                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-8 sm:py-10 cursor-pointer hover:bg-gray-50"
                                    @click="state.modal.isViewEmploymentContractsOpen = true">
                                    <div class="flex items-center justify-center gap-x-2">
                                        <Icon name="ph:file" class="h-6 w-6" aria-hidden="true" />
                                        <p class="text-xs font-semibold leading-7 text-gray-900">
                                            {{ $t('employees.documents.employmentContracts') }}
                                        </p>
                                    </div>
                                </div>
                                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-8 sm:py-10 cursor-pointer hover:bg-gray-50"
                                    @click="state.modal.isViewCriminalRecordsOpen = true">
                                    <div class="flex items-center justify-center gap-x-2">
                                        <Icon name="ph:file" class="h-6 w-6" aria-hidden="true" />
                                        <p class="text-xs font-semibold leading-7 text-gray-900">
                                            {{ $t('employees.documents.criminalRecords') }}
                                        </p>
                                    </div>
                                </div>
                                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-8 sm:py-10 cursor-pointer hover:bg-gray-50"
                                    @click="state.modal.isViewChildProtectionCertificatesOpen = true">
                                    <div class="flex items-center justify-center gap-x-2">
                                        <Icon name="ph:file" class="h-6 w-6" aria-hidden="true" />
                                        <p class="text-xs font-semibold leading-7 text-gray-900">
                                            {{ $t('employees.documents.childProtectionCertificates') }}
                                        </p>
                                    </div>
                                </div>
                                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-8 sm:py-10 cursor-pointer hover:bg-gray-50"
                                    @click="state.modal.isViewDriversLicenseOpen = true">
                                    <div class="flex items-center justify-center gap-x-2">
                                        <Icon name="ph:file" class="h-6 w-6" aria-hidden="true" />
                                        <p class="text-xs font-semibold leading-7 text-gray-900">
                                            {{ $t('employees.documents.driversLicense') }}
                                        </p>
                                    </div>
                                </div>
                                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-8 sm:py-10 cursor-pointer hover:bg-gray-50"
                                    @click="state.modal.isViewPassportOpen = true">
                                    <div class="flex items-center justify-center gap-x-2">
                                        <Icon name="ph:file" class="h-6 w-6" aria-hidden="true" />
                                        <p class="text-xs font-semibold leading-7 text-gray-900">
                                            {{ $t('employees.documents.passport') }}
                                        </p>
                                    </div>
                                </div>
                                <div class="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg px-4 py-8 sm:py-10 cursor-pointer hover:bg-gray-50"
                                    @click="state.modal.isMiscellaneousOpen = true">
                                    <div class="flex items-center justify-center gap-x-2">
                                        <Icon name="ph:file" class="h-6 w-6" aria-hidden="true" />
                                        <p class="text-xs font-semibold leading-7 text-gray-900">
                                            {{ $t('employees.documents.miscellaneous') }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
            <ModulesUserEmployeeEmploymentContractModalView :isModalOpen="state.modal.isViewEmploymentContractsOpen"
                @close="state.modal.isViewEmploymentContractsOpen = false" />
            <ModulesUserEmployeeCriminalRecordModalView :isModalOpen="state.modal.isViewCriminalRecordsOpen"
                @close="state.modal.isViewCriminalRecordsOpen = false" />
            <ModulesUserEmployeeChildProtectionCertificateModalView
                :isModalOpen="state.modal.isViewChildProtectionCertificatesOpen"
                @close="state.modal.isViewChildProtectionCertificatesOpen = false" />
            <ModulesUserEmployeeDriversLicenseModalView :isModalOpen="state.modal.isViewDriversLicenseOpen"
                @close="state.modal.isViewDriversLicenseOpen = false" />
            <ModulesUserEmployeePassportModalView :isModalOpen="state.modal.isViewPassportOpen"
                @close="state.modal.isViewPassportOpen = false" />
            <ModulesUserEmployeeMiscellaneousModalView :isModalOpen="state.modal.isMiscellaneousOpen"
                @close="state.modal.isMiscellaneousOpen = false" />
            <ModulesUserEmployeeCitizenModalView :isModalOpen="state.modal.isViewCitizensOpen"
                @close="state.modal.isViewCitizensOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { employeeService } from '@/components/api/user/EmployeeService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
const { formatDateToReadable } = useDatetimeFormatter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'employees.viewEmployee',
        translate: true,
        href: `/employees/${employeeUuid}/view-details`,
    },
]

const state = reactive({
    error: {} as Error,
    modal: {
        isViewCriminalRecordsOpen: false,
        isViewEmploymentContractsOpen: false,
        isViewChildProtectionCertificatesOpen: false,
        isViewDriversLicenseOpen: false,
        isViewPassportOpen: false,
        isMiscellaneousOpen: false,
        isViewCitizensOpen: false,
    },
    selectedEmployee: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        departments: [],
        role: '',
        street: '',
        region: '',
        municipality: '',
        city: '',
        post_code: '',
        permissions: [],
        media_risks: [],
        employment: {
            salary_id: '',
            employment_date: '',
            termination_date: '',
            job_title: '',
            employee_specialties: '',
            working_hours: '',
            employment_status: '',
        },
        emergencyInfo: {
            emergency_contacts: [],
            trustees: [],
        },
    } as any,
    isPageLoading: false,
})

onMounted(() => {
    fetchEmployee()
})

async function fetchEmployee() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await employeeService.getEmployee(employeeUuid)
        if (response) {
            let concatenatedDepartments = ''
            let concatenatedJobSpecialties = ''
            response?.data?.departments.forEach((department: any, index: number) => {
                concatenatedDepartments += department?.name
                if (index < response.data.departments.length - 1) {
                    concatenatedDepartments += ', '
                } else {
                    concatenatedDepartments += '.'
                }
            })
            response?.data?.employee_specialties.forEach((specialty: any, index: number) => {
                concatenatedJobSpecialties += specialty?.title
                if (index < response.data.employee_specialties.length - 1) {
                    concatenatedJobSpecialties += ', '
                } else {
                    concatenatedJobSpecialties += '.'
                }
            })
            state.selectedEmployee = {
                employee_id: response?.data?.employee_id ?? '',
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                email: response?.data?.email ?? '',
                phone: response?.data?.phone ?? '',
                birthday: response?.data?.birthday ?? '',
                departments: concatenatedDepartments,
                role: response?.data?.roles?.[0]?.name ?? '',
                street: response?.data?.employee_address?.street ?? '',
                region: response?.data?.employee_address?.region?.name ?? '',
                municipality: response?.data?.employee_address?.municipality?.name ?? '',
                city: response?.data?.employee_address?.city ?? '',
                post_code: response?.data?.employee_address?.post_code ?? '',
                permissions: response?.data?.permissions ?? [],
                media_risks: response?.data?.media_risks ?? [],
                employment: {
                    salary_id: response?.data?.employee_detail?.salary_id,
                    employment_date: response?.data?.employee_detail?.date_of_employment,
                    termination_date: response?.data?.employee_detail?.termination_date,
                    job_title: response?.data?.employee_detail?.job?.title,
                    employee_specialties: concatenatedJobSpecialties,
                    working_hours: response?.data?.employee_detail?.working_hours,
                    employment_status: response?.data?.employee_detail?.status,
                    annual_norm_hours: response?.data?.employee_detail?.annual_norm_hours,
                    weekly_norm_hours: response?.data?.employee_detail?.annual_norm_hours
                    ? Math.round(Number(response?.data?.employee_detail?.annual_norm_hours) / 52)
                    : '',
                    vacation_days: response?.data?.employee_detail?.vacation_days,
                },
                emergencyInfo: {
                    emergency_contacts: [],
                    trustees: [],
                },
            }
            response?.data?.employee_trustees.forEach((employee_trustee: any) => {
                state.selectedEmployee.emergencyInfo.trustees.push({
                    name: employee_trustee?.name,
                    phone: employee_trustee?.phone,
                    email: employee_trustee?.email,
                })
            })
            response?.data?.emergency_contacts.forEach((emergency_contact: any) => {
                state.selectedEmployee.emergencyInfo.emergency_contacts.push({
                    name: emergency_contact?.name,
                    phone: emergency_contact?.phone,
                    email: emergency_contact?.email,
                    relation: emergency_contact?.relation,
                })
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function isAdmin(roles: any) {
    return roles && roles.some((role: any) => role.name === 'Admin')
}
</script>