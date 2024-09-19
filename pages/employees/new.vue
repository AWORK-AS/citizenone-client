<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.newEmployee') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('employees.newEmployee') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesEmployeeForm formType="create" :selectedEmployee="state.formEmployee" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveEmployee" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/EmployeeService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { EmployeeForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formEmployee: {
        profile_image: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        departments: [],
        role: '',
        street: '',
        region_id: '',
        municipality_id: '',
        city_id: '',
        post_code: '',
        permissions: [],
        employment: {
            employment_date: '',
            job_id: '',
            working_hours: '',
            employment_status: '',
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
        params.append('department_id', JSON.stringify(employeeDetails.departments))
        params.append('role', employeeDetails.role)
        params.append('permission', JSON.stringify(employeeDetails.permissions))
        params.append('street', employeeDetails.street)
        params.append('region_id', employeeDetails.region_id)
        params.append('municipality_id', employeeDetails.municipality_id)
        params.append('city_id', employeeDetails.city_id)
        params.append('post_code', employeeDetails.post_code)
        params.append('employment_date', employeeDetails.employment.employment_date)
        params.append('job_id', employeeDetails.employment.job_id)
        params.append('working_hours', employeeDetails.employment.working_hours)
        params.append('employment_status', employeeDetails.employment.employment_status)
        params.append('emergency_contacts', JSON.stringify(employeeDetails.emergencyInfo.emergency_contacts))
        params.append('trustees', JSON.stringify(employeeDetails.emergencyInfo.trustees))
        const response = await employeeService.saveEmployee(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.form.alert.newEmployeeSuccessfullySaved')}.`)
            navigateTo('/employees')
        }
    } catch (error: any) {
        state.error = error
        if (error?.message === 'You have no available user license to create a new employee.') {
            navigateTo(`/subscription?error=${error?.message}`)
        } else if (error?.message === 'Du har ingen tilgængelige brugerlicenser til at oprette en ny medarbejder.') {
            navigateTo(`/subscription?error=${error?.message}`)
        }
    }
    state.isPageLoading = false
}
</script>