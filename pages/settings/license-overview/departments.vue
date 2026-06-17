<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('settings.licenseOverview.licenseOverview') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.licenseOverview.licenseOverview') }}</template>

            <ModulesUserSettingsTab />

            <div v-if="userStore.getUser?.user_subscription === null">
                <div class="isolate mx-auto mt-8 grid max-w-lg">
                    <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                        <h3 class="text-xl font-semibold leading-7">
                            {{ $t('subscription.noSubscription.noActiveSubscription') }}
                        </h3>
                        <p class="mt-4 text-sm text-gray-600 leading-6">
                            {{
                                $t('subscription.noSubscription.itLooksLikeYouDontHaveAnActiveSubscriptionAtTheMoment')
                            }}.
                        </p>
                        <p class="mt-2 text-sm text-gray-600 leading-6">
                            {{ $t('subscription.noSubscription.toEnjoyOurFullRangeOfServicesAndBenefits') }}.
                        </p>
                        <div class="mt-6">
                            <FormButton type="button" buttonStyle="primary" class="w-full"
                                @click="navigateTo('/subscription/subscribe')">
                                {{ $t('subscription.noSubscription.subscribeNow') }}
                            </FormButton>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="lg:flex gap-8">
                    <div class="isolate mt-8 w-full max-w-md">
                        <h3 class="py-3 text-sm font-semibold">
                            {{ $t('subscription.currentSubscription') }}
                        </h3>
                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                            <div class="flex items-center justify-between gap-x-4">
                                <h3 class="text-base font-semibold leading-7 text-tertiary">
                                    {{ userStore.getUser?.user_subscription?.deal?.name }}
                                </h3>
                            </div>
                            <p class="text-gray-600 mt-6 text-base leading-7">
                                <span v-if="userStore.getUser?.user_subscription?.deal?.name === 'Basis'">
                                    {{ $t('subscription.deal.perfectForLargerCompanies') }} 🚀
                                </span>
                                <span v-else>
                                    {{ $t('subscription.deal.goodForASmallTeam') }} 🤝
                                </span>
                            </p>
                            <p class="mt-4 flex items-baseline gap-x-2">
                                <span class="text-3xl font-bold tracking-tight text-gray-900">
                                    {{ userStore.getUser?.user_subscription?.type === 'monthly' ?
                                        formatAmount(userStore.getUser?.user_subscription?.deal?.monthly_price ?? 0) :
                                        formatAmount(userStore.getUser?.user_subscription?.deal?.yearly_price ?? 0) }}
                                </span>
                                <span class="text-base text-gray-500 lowercase">
                                    /{{ userStore.getUser?.user_subscription?.type === 'monthly' ?
                                        $t('subscription.deal.month') :
                                        $t('subscription.deal.year')
                                    }}
                                    {{ $t('excludeVat') }}
                                </span>
                            </p>
                            <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600 sm:mt-8">
                                <li class="flex gap-x-2">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ userStore.getUser?.user_subscription?.deal?.users }}
                                    <span v-if="userStore.getUser?.user_subscription?.deal?.users > 1">
                                        {{ $t('subscription.deal.users') }}
                                    </span>
                                    <span v-else>
                                        {{ $t('subscription.deal.user') }}
                                    </span>
                                </li>
                                <li class="flex gap-x-2">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ userStore.getUser?.user_subscription?.deal?.departments }}
                                    <span v-if="userStore.getUser?.user_subscription?.deal?.departments > 1">
                                        {{ customPagesStore.getCustomPagesName?.department ??
                                            $t('subscription.deal.departments') }}
                                    </span>
                                    <span v-else>
                                        {{ customPagesStore.getCustomPagesName?.department ??
                                            $t('subscription.deal.department') }}
                                    </span>
                                </li>
                                <li class="flex gap-x-2">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ $t('subscription.deal.unlimitedNumberOfCitizens') }}
                                </li>
                                <li class="flex gap-x-2">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ userStore.getUser?.user_subscription?.deal?.storage_size }}
                                    {{ $t('subscription.deal.storageSpace') }}
                                </li>
                                <li class="flex gap-x-2">
                                    <Icon name=" ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    <span v-if="userStore.getUser?.user_subscription?.deal?.name === 'Pro'">
                                        {{ $t('subscription.deal.telephoneSupport') }}
                                    </span>
                                    <span v-else>
                                        {{ $t('subscription.deal.chatSupport') }}
                                    </span>
                                </li>
                                <li class="flex gap-x-2"
                                    v-if="userStore.getUser?.user_subscription?.deal?.name === 'Pro'">
                                    <Icon name="ph:check" class="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                    {{ $t('subscription.deal.automaticSynchronizationWithFMK') }}
                                </li>
                            </ul>
                            <div class="mt-8">
                                <FormButton type="button" buttonStyle="primary" class="w-full"
                                    @click="navigateTo('/subscription/subscribe')"
                                    v-if="!userStore.getUser?.user_subscription?.is_max">
                                    {{ $t('subscription.upgrade') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                    <div class="mt-8 w-full">
                        <LoadingSpinner :isActive="state.isPageLoading">
                            <Alert type="danger" :text="state?.error?.message"
                                v-if="state.error?.message && state.error.message.length > 0" />
                            <div>
                                <h3 class="py-3 text-sm font-semibold">
                                    {{ $t('settings.licenseOverview.licenses') }}
                                </h3>
                                <ModulesUserSettingsLicenseOverviewSubTab />
                                <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10 mt-4">
                                    <div class="flex justify-between gap-3 mb-5">
                                        <div class="flex items-center gap-x-5">
                                            <div>
                                                <span class="text-sm font-semibold">
                                                    {{ $t('settings.licenseOverview.usedDepartmentLicense') }}:
                                                </span>
                                                {{ state.departments?.used ?? 0 }}
                                            </div>
                                            |
                                            <div>
                                                <span class="text-sm font-semibold">
                                                    {{ $t('settings.licenseOverview.unusedDepartmentLicense') }}:
                                                </span>
                                                {{ state.departments?.unused ?? 0 }}
                                            </div>
                                        </div>
                                        <FormButton type="button" buttonStyle="primary"
                                            @click="navigateTo('/settings/subscription')">
                                            {{ $t('subscription.addOnDeals.purchaseExtraLicenses') }}
                                        </FormButton>
                                    </div>
                                    <div class="mt-5 table-responsive">
                                        <Table :columnHeaders="state.columnHeaders" :data="state.departments"
                                            :isLoading="state.isTableLoading">
                                            <template #body
                                                v-if="!(state.isTableLoading || (state.departments?.data?.length === 0))">
                                                <tr v-for="(department, index) in state.departments?.data" :key="index">
                                                    <td width="100%">
                                                        <span>{{ department?.name }}</span>
                                                    </td>
                                                </tr>
                                            </template>
                                        </Table>
                                    </div>
                                    <Pagination :data="state.departments" @previous="previous" @next="next" />
                                </div>
                            </div>
                        </LoadingSpinner>
                    </div>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { licenseService } from '@/components/api/user/LicenseService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useUserStore } from '@/store/user'
import { useAmountFormatter } from '@/composables/amountFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const customPagesStore = useCustomPagesStore() as any
const userStore = useUserStore() as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'settings.licenseOverview.licenseOverview',
        translate: true,
        href: '/settings/license-overview',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'settings.licenseOverview.table.department', isTranslateName: true },
    ],
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    departments: [] as any,
})

onMounted(() => {
    fetchDepartments()
})

async function fetchDepartments() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await licenseService.getDepartmentLicenses({ page: currentTablePage })
        if (response) {
            state.departments = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchDepartments()
}

function next() {
    currentTablePage++
    fetchDepartments()
}
</script>
