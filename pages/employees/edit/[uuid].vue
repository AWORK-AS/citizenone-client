<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employees.editEmployee') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('employees.editEmployee') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/employees">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesEmployeeForm formType="update" :selectedEmployee="state.formEmployee" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateEmployee" />
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
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formEmployee: {
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
            job_title: '',
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

onMounted(() => {
    fetchEmployee()
})

async function fetchEmployee() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await employeeService.getEmployee(uuid)
        if (response) {
            state.formEmployee = {
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                email: response?.data?.email ?? '',
                phone: response?.data?.phone ?? '',
                birthday: response?.data?.birthday ?? '',
                departments: [],
                role: response?.data?.roles?.[0]?.name ?? '',
                street: response?.data?.address?.street ?? '',
                region_id: response?.data?.address?.region_id.toString() ?? '',
                municipality_id: response?.data?.address?.municipality_id.toString() ?? '',
                city_id: response?.data?.address?.city_id.toString() ?? '',
                post_code: response?.data?.post_code ?? '',
                permissions: response?.data?.permissions ?? [],
                employment: {
                    employment_date: response?.data?.employee_detail?.date_of_employment,
                    job_title: response?.data?.employee_detail?.job_title,
                    working_hours: response?.data?.employee_detail?.working_hours,
                    employment_status: response?.data?.employee_detail?.status,
                },
                emergencyInfo: {
                    emergency_contacts: [],
                    trustees: [],
                },
            }
            response?.data?.departments.forEach((department: any) => {
                state.formEmployee.departments.push(department?.id)
            })
            response?.data?.employee_trustees.forEach((employee_trustee: any) => {
                state.formEmployee.emergencyInfo.trustees.push({
                    name: employee_trustee?.name,
                    phone: employee_trustee?.phone,
                    email: employee_trustee?.email,
                })
            })
            response?.data?.emergency_contacts.forEach((emergency_contact: any) => {
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
        const params = {
            firstname: employeeDetails.firstname,
            lastname: employeeDetails.lastname,
            email: employeeDetails.email,
            phone: employeeDetails.phone,
            birthday: employeeDetails.birthday,
            department_id: employeeDetails.departments,
            role: employeeDetails.role,
            permission: employeeDetails.permissions,
            street: employeeDetails.street,
            region_id: employeeDetails.region,
            municipality_id: employeeDetails.municipality,
            city_id: employeeDetails.city,
            post_code: employeeDetails.post_code,
            employment_date: employeeDetails.employment.employment_date,
            job_title: employeeDetails.employment.job_title,
            working_hours: employeeDetails.employment.working_hours,
            employment_status: employeeDetails.employment.employment_status,
            emergency_contacts: employeeDetails.emergencyInfo.emergency_contacts,
            trustees: employeeDetails.emergencyInfo.trustees,
        }
        const response = await employeeService.updateEmployee(uuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.form.alert.employeeSuccessfullyUpdated')}.`)
            navigateTo('/employees')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>