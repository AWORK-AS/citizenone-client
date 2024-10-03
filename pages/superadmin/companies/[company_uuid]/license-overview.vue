<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.accounts.accounts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.accounts.accounts') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesSuperadminCompanyTab />

                <div class="mt-10 w-full">
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div v-if="state.isPageLoading || state?.subscriptions?.data?.length === 0">
                            <div class="isolate mx-auto mt-10 grid max-w-lg">
                                <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                                    <h3 class="text-xl font-semibold leading-7">
                                        {{
                                            $t('superadmin.companies.subscriptions.noSubscription.noActiveSubscription')
                                        }}
                                    </h3>
                                    <p class="mt-4 text-sm text-gray-600 leading-6">
                                        {{
                                            $t('superadmin.companies.subscriptions.noSubscription.itLooksLikeThisCompanyDontHaveAnActiveSubscriptionAtTheMoment')
                                        }}.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div v-else>
                            <div class="lg:flex gap-8">
                                <div class="isolate mt-10 w-full max-w-md">
                                    <h3 class="py-3 text-sm font-semibold">
                                        {{ $t('subscription.currentSubscription') }}
                                    </h3>
                                    <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                                        <div class="flex items-center justify-between gap-x-4">
                                            <h3 class="text-base font-semibold leading-7 text-tertiary">
                                                {{ state?.subscriptions?.data?.deal?.name }}
                                            </h3>
                                        </div>
                                        <p class="text-gray-600 mt-6 text-base leading-7">
                                            <span v-if="state?.subscriptions?.data?.deal?.name === 'Basis'">
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.perfectForTheLargerSocialOffer')
                                                }}.
                                            </span>
                                            <span v-else>
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.goodForTheSmallerSocialOffer')
                                                }}.
                                            </span>
                                        </p>
                                        <p class="mt-4 flex items-baseline gap-x-2">
                                            <span class="text-3xl font-bold tracking-tight text-gray-900">
                                                {{ state?.subscriptions?.data?.type === 'monthly' ?
                                                    formatAmount(state?.subscriptions?.data?.deal?.monthly_price ?? 0)
                                                    :
                                                    formatAmount(state?.subscriptions?.data?.deal?.yearly_price ?? 0)
                                                }}
                                            </span>
                                            <span class="text-base text-gray-500 lowercase">
                                                /{{ state?.subscriptions?.data?.type === 'monthly' ?
                                                    $t('superadmin.companies.subscriptions.deal.month') :
                                                    $t('superadmin.companies.subscriptions.deal.year')
                                                }}
                                                {{ $t('excludeVat') }}
                                            </span>
                                        </p>
                                        <ul role="list" class="mt-8 space-y-3 text-sm leading-6 text-gray-600 sm:mt-10">
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{ state?.subscriptions?.data?.deal?.users }}
                                                <span v-if="state?.subscriptions?.data?.deal?.users > 1">
                                                    {{ $t('superadmin.companies.subscriptions.deal.users') }}
                                                </span>
                                                <span v-else>
                                                    {{ $t('superadmin.companies.subscriptions.deal.user') }}
                                                </span>
                                            </li>
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{ state?.subscriptions?.data?.deal?.departments }}
                                                <span v-if="state?.subscriptions?.data?.deal?.departments > 1">
                                                    {{ $t('superadmin.companies.subscriptions.deal.departments') }}
                                                </span>
                                                <span v-else>
                                                    {{ $t('superadmin.companies.subscriptions.deal.department') }}
                                                </span>
                                            </li>
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{ state?.subscriptions?.data?.deal?.storage_size }}
                                                {{ $t('superadmin.companies.subscriptions.deal.storageSpace') }}
                                            </li>
                                            <li class="flex gap-x-2">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.telephoneSupport')
                                                }}
                                            </li>
                                            <li class="flex gap-x-2"
                                                v-if="state?.subscriptions?.data?.deal?.name === 'Pro'">
                                                <Icon name="ph:check" class="h-6 w-5 flex-none text-primary"
                                                    aria-hidden="true" />
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.automaticSynchronizationWithFMK')
                                                }}
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="mt-10 w-full">
                                    <div>
                                        <h3 class="py-3 text-sm font-semibold">
                                            {{ $t('settings.licenseOverview.licenses') }}
                                        </h3>
                                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                                            <div class="mb-5 flex items-center gap-x-5 justify-end">
                                                <div>
                                                    <span class="text-sm font-semibold">
                                                        {{ $t('settings.licenseOverview.usedLicense') }}:
                                                    </span>
                                                    {{ state.licensesCount?.data?.used ?? 0 }}
                                                </div>
                                                |
                                                <div>
                                                    <span class="text-sm font-semibold">
                                                        {{ $t('settings.licenseOverview.unusedLicense') }}:
                                                    </span>
                                                    {{ state.licensesCount?.data?.unused ?? 0 }}
                                                </div>
                                            </div>
                                            <TableSearch :columnFilter="state.columnFilter"
                                                :dataFilter="state.dataFilter" @handleFilter="handleFilter" />
                                            <div class="table-responsive">
                                                <Table :columnHeaders="state.columnHeaders" :data="state.licenses"
                                                    :isLoading="state.isTableLoading" :sortData="state.sortData"
                                                    @sort="sort">
                                                    <template #body
                                                        v-if="!(state.isTableLoading || (state.licenses?.data?.length === 0))">
                                                        <tr v-for="(license, index) in state.licenses?.data"
                                                            :key="index">
                                                            <td width="50%">
                                                                <span>{{ license?.license }}</span>
                                                            </td>
                                                            <td width="50%">
                                                                <span>
                                                                    {{ license?.licensed_user?.firstname }}
                                                                    {{ license?.licensed_user?.lastname }}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    </template>
                                                </Table>
                                            </div>
                                            <Pagination :data="state.licenses" @previous="previous" @next="next" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </LoadingSpinner>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { licenseService } from '@/components/api/superadmin/LicenseService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
        { column: 'license' },
    ],
    columnHeaders: [
        { name: 'superadmin.companies.licenseOverview.table.license', sorter: true, key: 'license' },
        { name: 'superadmin.companies.licenseOverview.table.user' },
    ],
    dataFilter: [],
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    licenses: [] as any,
    licensesCount: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    subscriptions: [] as any,
})

onMounted(() => {
    fetchSubscription()
    fetchLicenses()
    fetchLicensesCount()
})

async function fetchSubscription() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await licenseService.getSubscription(companyUuid)
        if (response) {
            state.subscriptions = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchLicensesCount() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await licenseService.getLicensesCount(companyUuid)
        if (response) {
            state.licensesCount = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

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
        const response = await licenseService.getLicenses(companyUuid, params)
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchLicenses()
}

function formatAmount(amount: any) {
    // Convert the number to a string with two decimal places
    let numberStr = parseFloat(amount).toFixed(2)

    // Split the string into integer and decimal parts
    let parts = numberStr.split('.')
    let integerPart = parts[0]
    let decimalPart = parts[1]

    // Add the thousands separators
    let formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')

    // Combine the integer part with the decimal part
    return 'DKK ' + formattedIntegerPart + ',' + decimalPart
}
</script>