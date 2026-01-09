<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('roles.editRole') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('roles.editRole') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/settings/roles">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>
            <LoadingSpinner :isActive="state.isPageLoading">
                <ModulesUserRoleForm formType="update" :selectedRole="state.formRole" :error="state.error"
                    @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateRole" />
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
const router = useRouter()
const roleId = router?.currentRoute?.value?.params?.id
const breadcrumbLinks = [
    {
        name: 'roles.roles',
        translate: true,
        href: '/settings/roles',
    },
    {
        name: 'roles.editRole',
        translate: true,
        href: `/settings/roles/${roleId}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formRole: {
        name: '',
        permissions: [] as any,
    },
    isPageLoading: false,
})

onMounted(() => {
    fetchRole()
})

async function fetchRole() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await roleService.getRole(roleId)
        if (response) {
            state.formRole = {
                name: response?.data?.name ?? '',
                permissions: [],
            }
            response?.data?.permissions.forEach((permission: any) => {
                state.formRole.permissions.push(permission?.uuid)
            })
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateRole(roleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: roleDetails.name,
            permission_uuid: roleDetails.permissions,
        }
        const response = await roleService.updateRole(roleId, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('roles.form.alert.roleSuccessfullyUpdated')}.`)
            navigateTo('/settings/roles')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>