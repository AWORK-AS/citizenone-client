<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('superadmin.users.newUser') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.users.newUser') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/superadmin/users">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminUserForm formType="create" :selectedUser="state.formUser" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @submitForm="saveUser" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { userService } from '@/components/api/superadmin/UserService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formUser: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
    },
    isPageLoading: false,
})

async function saveUser(userDetails: any) {
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
        const response = await userService.saveUser(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.user.form.alert.newUserSuccessfullySaved')}.`)
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