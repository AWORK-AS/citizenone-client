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
import { notify } from "@kyvg/vue3-notification"

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: [],
    formEmployee: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        role: '',
        address: '',
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchEmployee()
})

async function fetchEmployee() {
    state.isPageLoading = true
    state.error = []
    try {
        const response = await employeeService.getEmployee(uuid)
        if (response) {
            state.formEmployee = {
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                email: response?.data?.email ?? '',
                phone: response?.data?.phone ?? '',
                birthday: response?.data?.birthday ?? '',
                address: response?.data?.address ?? '',
                role: response?.data?.roles?.[0]?.name ?? ''
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateEmployee(employeeDetails: any) {
    state.error = []
    state.isPageLoading = true
    try {
        const params = {
            firstname: employeeDetails.firstname,
            lastname: employeeDetails.lastname,
            email: employeeDetails.email,
            phone: employeeDetails.phone,
            birthday: employeeDetails.birthday,
            role: employeeDetails.role,
            address: employeeDetails.address,
        }
        const response = await employeeService.updateEmployee(uuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, 'Employee successfully updated.')
            navigateTo('/employees')
        }
    } catch (error: any) {
        state.error = error
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