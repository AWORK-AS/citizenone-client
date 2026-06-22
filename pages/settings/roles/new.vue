<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('roles.addNewRole') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('roles.addNewRole') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/roles">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserRoleForm formType="create" :selectedRole="state.formRole" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveRole" />
            </LoadingSpinner>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { roleService } from '@/components/api/user/RoleService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'roles.roles',
        translate: true,
        href: '/settings/roles',
    },
    {
        name: 'roles.addNewRole',
        translate: true,
        href: '/settings/roles/new',
    },
]

const state = reactive({
    error: {} as Error,
    formRole: {
        name: '',
        permissions: [],
        page_uuid: [],
        level: 20,
    },
    isPageLoading: false,
})

async function saveRole(roleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: roleDetails.name,
            level: roleDetails.level,
            permission_uuid: roleDetails.permissions,
            page_uuid: roleDetails.page_uuid ?? [],
        }
        const response = await roleService.saveRole(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('roles.form.alert.newRoleSuccessfullySaved')}.`)
            navigateTo('/settings/roles')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>