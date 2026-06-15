<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ $t('settings.licenseOverview.caseworkerLicenses') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('settings.licenseOverview.caseworkerLicenses') }}</template>

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
                                    {{ $t('settings.licenseOverview.caseworkerLicenses') }}
                                </h3>
                                <ModulesUserSettingsLicenseOverviewSubTab />
                                <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10 mt-4">
                                    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-5">
                                        <div>
                                            <p class="text-sm font-semibold text-gray-900">
                                                {{ $t('caseworkerSharing.manageSharing') }}
                                            </p>
                                            <p class="text-sm text-gray-500">
                                                {{ $t('caseworkerSharing.configureSharingSubtitle') }}
                                            </p>
                                        </div>
                                        <FormButton type="button" buttonStyle="primary"
                                            @click="navigateTo('/settings/subscription')">
                                            {{ $t('subscription.addOnDeals.purchaseExtraLicenses') }}
                                        </FormButton>
                                    </div>
                                    <TableSearch @search="handleSearch" />
                                    <div class="mt-5 table-responsive">
                                        <Table :columnHeaders="state.columnHeaders" :data="state.licenses"
                                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                            <template #body
                                                v-if="!(state.isTableLoading || (state.licenses?.data?.length === 0))">
                                                <tr v-for="(license, index) in state.licenses?.data" :key="index">
                                                    <td width="60%">
                                                        <div class="flex flex-col gap-1">
                                                            <span class="font-semibold text-gray-900">
                                                                {{ displayCaseworkerName(license) }}
                                                            </span>
                                                            <span class="text-xs text-gray-500">
                                                                {{ $t('settings.licenseOverview.table.license') }}:
                                                                {{ license?.license }}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td width="40%">
                                                        <div class="flex items-center justify-end gap-2">
                                                            <Tooltip :text="$t('settings.licenseOverview.copyLink')"
                                                                position="left">
                                                                <button type="button"
                                                                    class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-primary hover:text-primary hover:bg-primary/5"
                                                                    @click.prevent="copyShareLink(license)">
                                                                    <Icon name="ph:link-simple-horizontal"
                                                                        class="h-4 w-4" aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
                                                            <Tooltip
                                                                :text="$t('caseworkerSharing.configureSharingTooltip')"
                                                                position="left">
                                                                <button type="button"
                                                                    class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-primary hover:text-primary hover:bg-primary/5"
                                                                    @click.prevent="openConfigureModal(license)">
                                                                    <Icon name="ph:gear-six" class="h-4 w-4"
                                                                        aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </template>
                                        </Table>
                                    </div>
                                    <Pagination :data="state.licenses" @previous="previous" @next="next" />
                                </div>
                            </div>
                        </LoadingSpinner>
                    </div>
                </div>
            </div>

            <ModulesUserSettingsLicenseOverviewModalCaseworkerSharingModal :show="state.modal.isConfigureOpen"
                :selectedLicense="state.selectedLicense"
                :folderIds="state.selectedLicense?.caseworker_license_config?.folders || []"
                :permission="state.selectedLicense?.caseworker_license_config?.permission || 'view'"
                @close="closeConfigureModal" @save="fetchLicenses" />
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
        name: 'settings.licenseOverview.caseworkerLicenses',
        translate: true,
        href: '/settings/license-overview/caseworker',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'settings.licenseOverview.table.user', isTranslateName: true, sorter: true, key: 'license' },
        { name: 'actions', isTranslateName: false },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    licenses: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    modal: {
        isConfigureOpen: false,
    },
    selectedLicense: null as any,
})

onMounted(() => {
    fetchLicenses()
})

async function fetchLicenses() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await licenseService.getCaseworkerLicenses(params)
        if (response) {
            state.licenses = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchLicenses()
}

function next() {
    currentTablePage++
    fetchLicenses()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchLicenses()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchLicenses()
}

function displayCaseworkerName(license: any) {
    if (!license) return 'Caseworker'
    const user = license.caseworker_license_config
    const name = `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim()
    return name || license.license || 'Caseworker'
}

function openConfigureModal(license: any) {
    state.selectedLicense = license
    state.modal.isConfigureOpen = true
}

function closeConfigureModal() {
    state.modal.isConfigureOpen = false
    state.selectedLicense = null
}

async function copyShareLink(license: any) {
    try {
        const uuid = license?.caseworker_license_config?.share_link_uuid
        if (!uuid) {
            return
        }

        const url = `${runtimeConfig.public.appBaseURL}/guest/caseworker/${uuid}`
        await navigator.clipboard.writeText(url)
    } catch {
        return
    }
}
</script>
