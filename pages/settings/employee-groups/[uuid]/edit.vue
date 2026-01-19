<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employeeGroups.editEmployeeGroup') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employeeGroups.editEmployeeGroup') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/employee-groups">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmployeeGroupForm formType="update" :selectedEmployeeGroup="state.formEmployeeGroup" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="update" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const employeeGroupUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'employeeGroups.employeeGroups',
        translate: true,
        href: '/settings/employee-groups',
    },
    {
        name: 'employeeGroups.editEmployeeGroup',
        translate: true,
        href: `/settings/employee-groups/${employeeGroupUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formEmployeeGroup: {
        name: '',
        department_uuid: '',
        employees_uuid: [] as string[],
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchEmployeeGroup()
})

async function fetchEmployeeGroup() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await employeeGroupService.getEmployeeGroup(employeeGroupUuid)
        if (response) {
            state.formEmployeeGroup = {
                name: response?.data?.name ?? '',
                employees_uuid: response?.data?.users.map((user: any) => user.uuid) ?? [],
                department_uuid: response?.data?.department?.uuid ?? '',
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function update(employeeGroupDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: employeeGroupDetails.name,
            users: employeeGroupDetails.employees_uuid,
            department_uuid: employeeGroupDetails?.department_uuid || '',
        }
        const response = await employeeGroupService.updateEmployeeGroup(employeeGroupUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('employeeGroups.form.alert.employeeGroupSuccessfullyUpdated')}.`)
            navigateTo('/settings/employee-groups')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>