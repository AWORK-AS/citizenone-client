<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('superadmin.users.editUser') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.users.editUser') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/superadmin/users">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminUserForm formType="update" :selectedUser="state.formUser" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="updateUser" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/superadmin/UserService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { UserForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formUser: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        permissions: [],
    } as UserForm,
    isPageLoading: false,
})

onMounted(() => {
    fetchUser()
})

async function fetchUser() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await userService.getUser(uuid)
        if (response) {
            state.formUser = {
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                email: response?.data?.email ?? '',
                phone: response?.data?.phone ?? '',
                birthday: response?.data?.birthday ?? '',
                permissions: response?.data?.permissions ?? [],
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateUser(userDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            firstname: userDetails.firstname,
            lastname: userDetails.lastname,
            email: userDetails.email,
            phone: userDetails.phone,
            birthday: userDetails.birthday,
            permission: userDetails.permissions,
        }
        const response = await userService.updateUser(uuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.user.form.alert.userSuccessfullyUpdated')}.`)
            navigateTo('/superadmin/users')
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