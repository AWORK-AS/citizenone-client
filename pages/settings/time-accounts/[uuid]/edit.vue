<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('timeAccounts.editTimeAccount') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>
                <div class="flex items-center gap-2">
                    {{ $t('timeAccounts.editTimeAccount') }}
                    <Icon name="ph:question" class="size-4 cursor-pointer text-gray-500"
                        @click="state.isInfoModalOpen = true" />
                </div>
            </template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/settings/time-accounts">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserTimeAccountsForm formType="update" :selectedTimeAccount="state.formTimeAccount"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="updateTimeAccount" />
                </LoadingSpinner>
            </div>

            <ModulesUserTimeAccountsModalInfo :isModalOpen="state.isInfoModalOpen"
                @close="state.isInfoModalOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { timeAccountService } from '~/components/api/user/TimeAccountService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const timeAccountUuid = router?.currentRoute?.value?.params?.uuid

const breadcrumbLinks = [
    {
        name: 'timeAccounts.timeAccounts',
        translate: true,
        href: '/settings/time-accounts',
    },
    {
        name: 'timeAccounts.editTimeAccount',
        translate: true,
        href: `/settings/time-accounts/${timeAccountUuid}/edit`,
    },
]

const state = reactive({
    error: {} as Error,
    formTimeAccount: {} as any,
    isPageLoading: false,
    isInfoModalOpen: false,
})

onMounted(() => {
    fetchTimeAccount()
})

async function fetchTimeAccount() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await timeAccountService.getTimeAccount(timeAccountUuid)
        if (response?.data) {
            state.formTimeAccount = {
                name: response.data.name ?? '',
                initial_amount: response.data.initial_amount ?? '',
                start_date: response.data.start_date ?? '',
                account_until: response.data.account_until ?? '',
                carry_over: response.data.carry_over ?? false,
                is_recurring: response.data.is_recurring ?? false,
                is_active: response.data.is_active ?? true,
                rules: response.data.rules ?? [],
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function updateTimeAccount(timeAccountDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: timeAccountDetails.name,
            initial_amount: timeAccountDetails.initial_amount,
            start_date: timeAccountDetails.start_date,
            account_until: timeAccountDetails.account_until || null,
            carry_over: timeAccountDetails.carry_over,
            is_recurring: timeAccountDetails.is_recurring,
            is_active: timeAccountDetails.is_active,
            rules: [timeAccountDetails.rule],
        }
        const response = await timeAccountService.updateTimeAccount(timeAccountUuid, params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('timeAccounts.form.alert.timeAccountSuccessfullyUpdated')}.`)
            navigateTo('/settings/time-accounts')
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>
