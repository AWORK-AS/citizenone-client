<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.accounts.editAccount') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.accounts.editAccount') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/accounts">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminAccountForm formType="update" :selectedAccount="state.formAccount"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateAccount" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { accountService } from '@/components/api/superadmin/AccountService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { AccountForm, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid

const state = reactive({
    error: {} as Error,
    formAccount: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        role: '',
        permissions: [],
    } as AccountForm,
    isPageLoading: false,
})

onMounted(() => {
    fetchAccount()
})

async function fetchAccount() {
    state.isPageLoading = true
    state.error = {}
    try {
        const response = await accountService.getAccount(uuid)
        if (response) {
            state.formAccount = {
                firstname: response?.data?.firstname ?? '',
                lastname: response?.data?.lastname ?? '',
                email: response?.data?.email ?? '',
                phone: response?.data?.phone ?? '',
                birthday: response?.data?.birthday ?? '',
                role: response?.data?.roles?.[0]?.name ?? '',
                permissions: response?.data?.permissions ?? [],
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateAccount(accountDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            firstname: accountDetails.firstname,
            lastname: accountDetails.lastname,
            email: accountDetails.email,
            phone: accountDetails.phone,
            birthday: accountDetails.birthday,
            role: accountDetails.role,
            permission: accountDetails.permissions,
        }
        const response = await accountService.updateAccount(uuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.accounts.form.alert.accountSuccessfullyUpdated')}.`)
            navigateTo('/superadmin/accounts')
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