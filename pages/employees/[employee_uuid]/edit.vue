<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.editEmployee') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.editEmployee') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex gap-x-3 justify-end" v-if="isAtLeast('Admin')">
                        <div class="flex justify-end">
                            <FormButton type="button" buttonStyle="warning" @click="confirmCitizenArchiving">
                                {{ $t('employees.archiveEmployee') }}
                            </FormButton>
                        </div>
                        <div class="flex justify-end" v-if="userStore.getUser?.uuid !== employeeUuid">
                            <FormButton type="button" buttonStyle="danger" @click="confirmEmployeeDeletion">
                                {{ $t('employees.deleteEmployee') }}
                            </FormButton>
                        </div>
                    </div>
                    <ModulesUserEmployeeForm formType="update" :selectedEmployee="state.formEmployee"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateEmployee" />
                </LoadingSpinner>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isArchiveEmployeeOpen"
                :message="$t('employees.confirmation.archiveConfirmation') + '?'"
                @close="state.modal.isArchiveEmployeeOpen = false" @confirm="archiveEmployee" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteEmployeeOpen" :message="$t('employees.confirmation.deletePermanentlyConfirmation') + '? ' +
                $t('employees.confirmation.thisCantBeUndone') + '. ' +
                $t('employees.confirmation.rememberThatYouMustHoldEmployeeInformationForAHistoryOf5Years') + '.'"
                @close="state.modal.isDeleteEmployeeOpen = false" @confirm="deleteEmployee" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/user/EmployeeService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { usePermissions } from '@/composables/usePermissions'
import type { EmployeeForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore() as any
const { isAtLeast } = usePermissions()
const router = useRouter()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'employees.editEmployee',
        translate: true,
        href: `/employees/${employeeUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formEmployee: {
        profile_image: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        phone: '',
        birthday: '',
        note: '',
        union_membership: '',
        seniority_date: '',
        departments: [],
        roles: [],
        street: '',
        region_uuid: '',
        municipality_uuid: '',
        city: '',
        post_code: '',
        permissions: [],
        show_working_hours: false,
        show_compensatory_hours: false,
        do_not_count_sick_leave: false,
        media_risks: [],
        pages: [],
        spoken_languages: [],
        primary_spoken_language: '',
        employment: {
            salary_id: '',
            employment_date: '',
            termination_date: '',
            job_title_uuid: '',
            job_specialties: '',
            working_hours: '',
            employment_status: '',
            annual_norm_hours: '',
            annual_norm_hours_disabled: false,
            vacation_days: '',
            norm_period_uuid: '',
            hourly_rate: '',
        },
        emergencyInfo: {
            emergency_contacts: [],
            trustees: [],
        },
    } as EmployeeForm,
    isPageLoading: false,
    modal: {
        isArchiveEmployeeOpen: false,
        isDeleteEmployeeOpen: false,
    },
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
            state.formEmployee = {
                profile_image: response?.data?.profile_image ?? '',
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                email: response?.data?.email ?? '',
                password: '',
                phone: response?.data?.phone ?? '',
                birthday: response?.data?.birthday ?? '',
                note: response?.data?.note ?? '',
                union_membership: response?.data?.union_membership ?? '',
                seniority_date: response?.data?.seniority_date ?? '',
                departments: [],
                roles: response?.data?.roles?.map((r: any) => r.name) ?? [],
                street: response?.data?.employee_address?.street ?? '',
                region_uuid: response?.data?.employee_address?.region?.uuid?.toString() ?? '',
                municipality_uuid: response?.data?.employee_address?.municipality?.uuid?.toString() ?? '',
                city: response?.data?.employee_address?.city ?? '',
                post_code: response?.data?.employee_address?.post_code ?? '',
                permissions: response?.data?.permissions ?? [],
                show_working_hours: response?.data?.show_working_hours ?? false,
                show_compensatory_hours: response?.data?.show_compensatory_hours ?? false,
                do_not_count_sick_leave: response?.data?.do_not_count_sick_leave ?? false,
                media_risks: [],
                pages: [],
                spoken_languages: [],
                primary_spoken_language: '',
                employment: {
                    salary_id: response?.data?.employee_detail?.salary_id ?? '',
                    employment_date: response?.data?.employee_detail?.date_of_employment ?? '',
                    termination_date: response?.data?.employee_detail?.termination_date ?? '',
                    job_titles_uuid: response?.data?.job_titles?.map((jobTitle: any) => jobTitle.uuid) ?? [],
                    job_specialties: [],
                    working_hours: response?.data?.employee_detail?.working_hours ?? '',
                    employment_status: response?.data?.employee_detail?.status ?? '',
                    annual_norm_hours: response?.data?.employee_detail?.annual_norm_hours?.toString() ?? '',
                    annual_norm_hours_disabled: response?.data?.employee_detail?.annual_norm_hours_disabled ?? false,
                    vacation_days: response?.data?.employee_detail?.vacation_days?.toString() ?? '',
                    norm_period_uuid: response?.data?.employee_detail?.norm_period?.uuid ?? '',
                    hourly_rate: response?.data?.employee_detail?.hourly_rate?.toString() ?? '',
                },
                emergencyInfo: {
                    emergency_contacts: [],
                    trustees: [],
                },
            }
            response?.data?.media_risks?.forEach((media_risk: any) => {
                state.formEmployee.media_risks.push(media_risk?.uuid)
            })
            response?.data?.spoken_languages?.forEach((spokenLanguage: any) => {
                state.formEmployee.spoken_languages.push(spokenLanguage?.uuid)
                if (spokenLanguage?.is_primary) {
                    state.formEmployee.primary_spoken_language = spokenLanguage?.uuid
                }
            })
            response?.data?.employee_specialties?.forEach((job_specialty: any) => {
                state.formEmployee.employment.job_specialties.push(job_specialty?.uuid)
            })
            response?.data?.departments?.forEach((department: any) => {
                state.formEmployee.departments.push(department?.uuid)
            })
            response?.data?.pages?.forEach((page: any) => {
                state.formEmployee.pages.push(page?.uuid)
            })
            response?.data?.employee_trustees?.forEach((employee_trustee: any) => {
                state.formEmployee.emergencyInfo.trustees.push({
                    name: employee_trustee?.name,
                    phone: employee_trustee?.phone,
                    email: employee_trustee?.email,
                })
            })
            response?.data?.emergency_contacts?.forEach((emergency_contact: any) => {
                state.formEmployee.emergencyInfo.emergency_contacts.push({
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

async function updateEmployee(employeeDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('profile_image', employeeDetails.profile_image)
        params.append('firstname', employeeDetails.firstname)
        params.append('lastname', employeeDetails.lastname)
        params.append('email', employeeDetails.email)
        if (employeeDetails.password) {
            params.append('password', employeeDetails.password)
        }
        params.append('phone', employeeDetails.phone)
        params.append('birthday', employeeDetails.birthday)
        params.append('note', employeeDetails.note ?? '')
        params.append('union_membership', employeeDetails.union_membership ?? '')
        params.append('seniority_date', employeeDetails.seniority_date)
        params.append('departments_uuid', JSON.stringify(employeeDetails.departments))
        employeeDetails.roles.forEach((role: string) => params.append('roles[]', role))
        params.append('permission', JSON.stringify(employeeDetails.permissions))
        params.append('show_working_hours', employeeDetails.show_working_hours)
        params.append('show_compensatory_hours', employeeDetails.show_compensatory_hours)
        params.append('do_not_count_sick_leave', employeeDetails.do_not_count_sick_leave)
        params.append('media_risk_uuid', JSON.stringify(employeeDetails.media_risks))
        if (employeeDetails.pages) {
            params.append('page_uuid', JSON.stringify(employeeDetails.pages))
        }
        params.append('street', employeeDetails.street)
        params.append('region_uuid', employeeDetails.region_uuid)
        params.append('municipality_uuid', employeeDetails.municipality_uuid)
        params.append('city', employeeDetails.city)
        params.append('post_code', employeeDetails.post_code)
        params.append('salary_id', employeeDetails.employment.salary_id)
        params.append('employment_date', employeeDetails.employment.employment_date)
        params.append('termination_date', employeeDetails.employment.termination_date)
        params.append('job_titles_uuid', JSON.stringify(employeeDetails.employment.job_titles_uuid ?? []))
        params.append('spoken_languages_uuid', JSON.stringify(employeeDetails.spoken_languages ?? []))
        params.append('primary_spoken_language_uuid', employeeDetails.primary_spoken_language ?? '')
        params.append('job_specialties_uuid', JSON.stringify(employeeDetails.employment.job_specialties))
        params.append('working_hours', employeeDetails.employment.working_hours)
        params.append('employment_status', employeeDetails.employment.employment_status)
        params.append('annual_norm_hours', String(employeeDetails.employment.annual_norm_hours ?? '').replace(',', '.'))
        params.append('annual_norm_hours_disabled', employeeDetails.employment.annual_norm_hours_disabled ? '1' : '0')
        params.append('vacation_days', employeeDetails.employment.vacation_days)
        params.append('norm_period_uuid', employeeDetails.employment.norm_period_uuid || 'default')
        params.append('hourly_rate', String(employeeDetails.employment.hourly_rate ?? '').replace(',', '.'))
        params.append('emergency_contacts', JSON.stringify(employeeDetails.emergencyInfo.emergency_contacts))
        params.append('trustees', JSON.stringify(employeeDetails.emergencyInfo.trustees))
        const response = await employeeService.updateEmployee(employeeUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.form.alert.employeeSuccessfullyUpdated')}.`)
            navigateTo('/employees')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmCitizenArchiving() {
    state.modal.isArchiveEmployeeOpen = true
}

function confirmEmployeeDeletion() {
    state.modal.isDeleteEmployeeOpen = true
}

async function archiveEmployee() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employeeService.archiveEmployee(employeeUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.alert.employeeSuccessfullyArchived')}.`)
            navigateTo('/employees')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function deleteEmployee() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employeeService.deleteEmployee(employeeUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('employees.alert.employeeSuccessfullyDeleted')}.`)
            navigateTo('/employees')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>