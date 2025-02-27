<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('departments.newDepartment') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('departments.newDepartment') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/departments">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDepartmentForm formType="create" :selectedDepartment="state.formDepartment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveDepartment" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'departments.departments',
        translate: true,
        href: '/settings/departments',
    },
    {
        name: 'departments.newDepartment',
        translate: true,
        href: '/settings/departments/new',
    },
]

const state = reactive({
    error: {} as Error,
    formDepartment: {
        name: '',
    },
    isPageLoading: false,
})

async function saveDepartment(departmentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: departmentDetails.name,
        }
        const response = await departmentService.saveDepartment(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('departments.form.alert.newDepartmentSuccessfullySaved')}.`)
            navigateTo('/settings/departments')
        }
    } catch (error: any) {
        state.error = error
        if (error?.message === 'You have no available user license to create a new department.') {
            navigateTo(`/subscription?error=${error?.message}`)
        } else if (error?.message === 'Du har ingen tilgængelige brugerlicenser til at oprette en ny afdeling.') {
            navigateTo(`/subscription?error=${error?.message}`)
        }
    }
    state.isPageLoading = false
}
</script>