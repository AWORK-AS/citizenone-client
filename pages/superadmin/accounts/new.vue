<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.accounts.newAccount') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.accounts.newAccount') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/accounts">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesSuperadminAccountForm formType="create" :selectedAccount="state.formAccount"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveAccount" />
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { accountService } from '@/components/api/superadmin/AccountService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formAccount: {
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        birthday: '',
        role: '',
    },
    isPageLoading: false,
})

async function saveAccount(accountDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            firstname: accountDetails.firstname,
            lastname: accountDetails.lastname,
            email: accountDetails.email,
            phone: accountDetails.phone,
            birthday: accountDetails.birthday,
            role: 'admin',
            permission: accountDetails.permissions,
        }
        const response = await accountService.saveAccount(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('superadmin.accounts.form.alert.newAccountSuccessfullySaved')}.`)
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