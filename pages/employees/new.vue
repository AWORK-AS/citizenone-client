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
import { notify } from "@kyvg/vue3-notification"

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const state = reactive({
    error: [],
    formEmployee: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        departments: [],
        role: '',
    },
    isPageLoading: false,
})

async function saveEmployee(employeeDetails: any) {
    state.error = []
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
        }
        const response = await employeeService.saveEmployee(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employees.form.alert.newEmployeeSuccessfullySaved')}.`)
            navigateTo('/employees')
        }
    } catch (error: any) {
        state.error = error
        if (error.message === 'You have no available user license to create a new employee.') {
            navigateTo(`/subscription?error=${error?.message}`)
        }
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>