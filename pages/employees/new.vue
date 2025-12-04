<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.newEmployee') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employees.newEmployee') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmployeeForm formType="create" :selectedEmployee="state.formEmployee"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveEmployee" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/user/EmployeeService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { EmployeeForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'employees.employees',
        translate: true,
        href: '/employees',
    },
    {
        name: 'employees.newEmployee',
        translate: true,
        href: '/employees/new',
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
        seniority_date: '',
        departments: [],
        role: '',
        street: '',
        region_uuid: '',
        municipality_uuid: '',
        city: '',
        post_code: '',
        permissions: [],
        show_working_hours: false,
        do_no_count_sick_leave: false,
        media_risks: [],
        pages: [],
        employment: {
            salary_id: '',
            employment_date: '',
            job_uuid: '',
            working_hours: '',
            employment_status: '',
            annual_norm_hours: '',
            vacation_days: '',
        },
        emergencyInfo: {
            emergency_contacts: [],
            trustees: [],
        },
    } as EmployeeForm,
    isPageLoading: false,
})

async function saveEmployee(employeeDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = new FormData()
        params.append('profile_image', employeeDetails.profile_image)
        params.append('firstname', employeeDetails.firstname)
        params.append('lastname', employeeDetails.lastname)
        params.append('email', employeeDetails.email)
        params.append('phone', employeeDetails.phone)
        params.append('birthday', employeeDetails.birthday)
        params.append('seniority_date', employeeDetails.seniority_date)
        params.append('departments_uuid', JSON.stringify(employeeDetails.departments))
        params.append('role', employeeDetails.role)
        params.append('permission', JSON.stringify(employeeDetails.permissions))
        params.append('show_working_hours', employeeDetails.show_working_hours)
        params.append('do_no_count_sick_leave', employeeDetails.do_no_count_sick_leave)
        params.append('mediarisk_uuid', JSON.stringify(employeeDetails.media_risks))
        params.append('page_uuid', JSON.stringify(employeeDetails.pages))
        params.append('street', employeeDetails.street)
        params.append('region_uuid', employeeDetails.region_uuid)
        params.append('municipality_uuid', employeeDetails.municipality_uuid)
        params.append('city', employeeDetails.city)
        params.append('post_code', employeeDetails.post_code)
        params.append('salary_id', employeeDetails.employment.salary_id)
        params.append('employment_date', employeeDetails.employment.employment_date)
        params.append('job_title_uuid', employeeDetails.employment.job_title_uuid)
        params.append('job_specialties_uuid', JSON.stringify(employeeDetails.employment.job_specialties))
        params.append('working_hours', employeeDetails.employment.working_hours)
        params.append('employment_status', employeeDetails.employment.employment_status)
        params.append('annual_norm_hours', employeeDetails.employment.annual_norm_hours)
        params.append('vacation_days', employeeDetails.employment.vacation_days)
        params.append('emergency_contacts', JSON.stringify(employeeDetails.emergencyInfo.emergency_contacts))
        params.append('trustees', JSON.stringify(employeeDetails.emergencyInfo.trustees))
        const response = await employeeService.saveEmployee(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.form.alert.newEmployeeSuccessfullySaved')}.`)
            navigateTo('/employees')
        }
    } catch (error: any) {
        state.error = error
        if (error?.message === 'You have no available user license.') {
            navigateTo(`/subscription?error=${error?.message}`)
        } else if (error?.message === 'Du har ingen tilgængelige brugerlicenser til at oprette en ny medarbejder.') {
            navigateTo(`/subscription?error=${error?.message}`)
        }
    }
    state.isPageLoading = false
}
</script>