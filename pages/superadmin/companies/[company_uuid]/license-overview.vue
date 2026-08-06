<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.accounts.accounts') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.accounts.accounts') }}</template>

            <div class="p-1">
                <!-- Back -->
                <NuxtLink to="/superadmin/companies"
                    class="inline-flex items-center gap-1.5 text-sm text-[#5C6478] hover:text-[#1F2533] mb-5 transition-colors">
                    <Icon name="ph:arrow-left" class="w-4 h-4" />
                    {{ $t('superadmin.companies.accounts.allCompanies') }}
                </NuxtLink>

                <!-- Sub-nav tabs -->
                <div class="flex items-center gap-1 mb-6 border-b border-[#EAECF0]">
                    <button v-for="tab in detailTabs" :key="tab.href"
                        class="px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px" :class="$route.path === tab.href
                            ? 'border-[#42AED9] text-[#205E77]'
                            : 'border-transparent text-[#5C6478] hover:text-[#1F2533]'" @click="navigateTo(tab.href)">
                        <div class="flex items-center gap-1.5">
                            <Icon :name="tab.icon" class="w-4 h-4" />
                            {{ tab.label }}
                        </div>
                    </button>
                </div>

                <div v-if="canManageLicenses" class="flex justify-end mb-4">
                    <FormButton buttonStyle="action" @click="openGrantModal">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.companies.licenseOverview.grant.addLicenses') }}
                    </FormButton>
                </div>

                <div class="w-full">
                    <LoadingSpinner :isActive="state.isPageLoading">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div v-if="!state.isPageLoading">
                            <div class="lg:flex gap-8">
                                <div class="isolate w-full max-w-md">
                                    <h3 class="py-3 text-sm font-semibold">
                                        {{ $t('subscription.currentSubscription') }}
                                    </h3>
                                    <div v-if="state?.subscriptions?.data?.length === 0"
                                        class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
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
                                    <div v-else class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10">
                                        <div class="flex items-center justify-between gap-x-4">
                                            <h3 class="text-base font-semibold leading-7 text-tertiary">
                                                {{ state?.subscriptions?.data?.deal?.name }}
                                            </h3>
                                        </div>
                                        <p class="text-gray-600 mt-6 text-base leading-7">
                                            <span v-if="state?.subscriptions?.data?.deal?.name === 'Basis'">
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.perfectForLargerCompanies')
                                                }} 🚀
                                            </span>
                                            <span v-else>
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.goodForASmallTeam')
                                                }} 🤝
                                            </span>
                                        </p>
                                        <p class="mt-4 flex items-baseline gap-x-2" v-if="canViewFinancials">
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
                                                {{
                                                    $t('superadmin.companies.subscriptions.deal.unlimitedNumberOfCitizens')
                                                }}
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
                                                <span v-if="state?.subscriptions?.data?.deal?.name === 'Pro'">
                                                    {{ $t('superadmin.companies.subscriptions.deal.telephoneSupport') }}
                                                </span>
                                                <span v-else>
                                                    {{ $t('superadmin.companies.subscriptions.deal.chatSupport') }}
                                                </span>
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
                                <div class="w-full">
                                    <div>
                                        <h3 class="py-3 text-sm font-semibold">
                                            {{ $t('settings.licenseOverview.licenses') }}
                                        </h3>
                                        <TabsLocal v-model="state.activeLicenseType" :tabs="[
                                            { key: 'user', label: $t('superadmin.companies.licenseOverview.userLicenses') },
                                            { key: 'department', label: $t('superadmin.companies.licenseOverview.departmentLicenses') },
                                        ]" class="mb-4" />
                                        <div class="bg-white ring-1 ring-gray-200 rounded-md p-8 xl:p-10 space-y-5">
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
                                            <TableSearch @search="handleSearch" />
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

            <Modal size="sm" :title="$t('superadmin.companies.licenseOverview.grant.addLicenses')"
                :show="state.grant.isOpen" @close="state.grant.isOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <p class="text-sm text-gray-600">
                            {{ $t('superadmin.companies.licenseOverview.grant.description') }}
                        </p>
                        <p class="text-sm font-semibold text-gray-900">
                            {{ state.activeLicenseType === 'department'
                                ? $t('superadmin.companies.licenseOverview.departmentLicenses')
                                : $t('superadmin.companies.licenseOverview.userLicenses') }}
                        </p>
                        <div class="space-y-1">
                            <FormLabel for="grant_quantity"
                                :label="$t('superadmin.companies.licenseOverview.grant.quantity')" />
                            <input id="grant_quantity" type="number" min="1" max="1000" v-model.number="state.grant.quantity"
                                class="appearance-none block w-full px-4 h-11 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-primary-700 focus:border-primary-700 sm:text-sm" />
                        </div>
                        <div v-if="needsFrequencyPicker" class="space-y-1">
                            <FormLabel :label="$t('superadmin.companies.licenseOverview.grant.billingFrequency')" />
                            <fieldset :aria-label="$t('superadmin.companies.licenseOverview.grant.billingFrequency')">
                                <RadioGroup v-model="state.grant.frequency"
                                    class="grid grid-cols-2 gap-x-1 rounded-full p-2 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
                                    <RadioGroupOption as="template" v-for="option in ['monthly', 'yearly']" :key="option"
                                        :value="option" v-slot="{ checked }">
                                        <div
                                            :class="[checked ? 'bg-tertiary text-white' : 'text-gray-500', 'cursor-pointer rounded-full px-2.5 py-1']">
                                            {{ option === 'monthly'
                                                ? $t('superadmin.companies.licenseOverview.grant.monthly')
                                                : $t('superadmin.companies.licenseOverview.grant.yearly') }}
                                        </div>
                                    </RadioGroupOption>
                                </RadioGroup>
                            </fieldset>
                        </div>
                        <p v-else class="text-sm text-gray-600">
                            {{ $t('superadmin.companies.licenseOverview.grant.billingFixed', { frequency: fixedFrequencyLabel }) }}
                        </p>
                        <div class="flex justify-end gap-3 pt-2">
                            <FormButton buttonStyle="secondary" @click="state.grant.isOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton buttonStyle="primary"
                                :disabled="state.grant.isSaving || !state.grant.quantity || state.grant.quantity < 1 || (needsFrequencyPicker && !state.grant.frequency)"
                                @click="submitGrant">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { licenseService } from '@/components/api/superadmin/LicenseService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatAmount } = useAmountFormatter()
const { can } = usePermissions()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid

const canManageLicenses = computed(() => can('manage_licenses'))
const canViewFinancials = computed(() => can('view_financials'))

const detailTabs = computed(() => [
    { label: t('superadmin.companies.accounts.tabs.overview'), href: `/superadmin/companies/${companyUuid}/accounts`, icon: 'ph:house' },
    { label: t('superadmin.sidebar.licenses'), href: `/superadmin/companies/${companyUuid}/license-overview`, icon: 'ph:key' },
    { label: t('superadmin.sidebar.apps'), href: `/superadmin/companies/${companyUuid}/apps`, icon: 'ph:squares-four' },
    { label: t('superadmin.sidebar.invoices'), href: `/superadmin/companies/${companyUuid}/invoices`, icon: 'ph:invoice' },
    { label: t('superadmin.companies.tabs.migration'), href: `/superadmin/companies/${companyUuid}/migration`, icon: 'ph:arrows-merge' },
    { label: t('superadmin.companies.table.actions.edit'), href: `/superadmin/companies/${companyUuid}/edit`, icon: 'ph:pencil-simple' },
])
let currentTablePage = 1

const state = reactive({
    activeLicenseType: 'user' as 'user' | 'department',
    columnHeaders: [
        { name: 'superadmin.companies.licenseOverview.table.license', isTranslateName: true, sorter: true, key: 'license' },
        { name: 'superadmin.companies.licenseOverview.table.user', isTranslateName: true, },
    ],
    dataFilter: {
        search: ''
    },
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
    grant: {
        isOpen: false,
        isSaving: false,
        quantity: 1 as number,
        frequency: 'monthly' as 'monthly' | 'yearly',
    },
})

// The company's active Deal subscription (monthly/yearly/custom_monthly/custom_yearly)
// determines the license's billing frequency automatically; only a missing or
// free subscription leaves it ambiguous enough to need the picker.
const needsFrequencyPicker = computed(() =>
    !['monthly', 'yearly', 'custom_monthly', 'custom_yearly'].includes(state.subscriptions?.data?.type)
)

const fixedFrequencyLabel = computed(() => {
    const dealType = state.subscriptions?.data?.type
    return dealType?.includes('yearly')
        ? t('superadmin.companies.licenseOverview.grant.yearly')
        : t('superadmin.companies.licenseOverview.grant.monthly')
})

watch(() => state.activeLicenseType, () => {
    currentTablePage = 1
    fetchLicenses()
    fetchLicensesCount()
})

function openGrantModal() {
    state.grant.quantity = 1
    state.grant.frequency = 'monthly'
    state.grant.isOpen = true
}

async function submitGrant() {
    if (!state.grant.quantity || state.grant.quantity < 1) return
    if (needsFrequencyPicker.value && !state.grant.frequency) return
    state.grant.isSaving = true
    try {
        const params: { quantity: number, type: 'user' | 'department', frequency?: 'monthly' | 'yearly' } = {
            quantity: state.grant.quantity,
            type: state.activeLicenseType,
        }
        if (needsFrequencyPicker.value) {
            params.frequency = state.grant.frequency
        }
        await licenseService.grantLicenses(companyUuid as string, params)
        state.grant.isOpen = false
        successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.licenseOverview.grant.granted')}.`)
        fetchLicenses()
        fetchLicensesCount()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('superadmin.companies.licenseOverview.grant.failed'))
    }
    state.grant.isSaving = false
}

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
        const response = await licenseService.getLicensesCount(companyUuid, state.activeLicenseType)
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
            type: state.activeLicenseType,
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchLicenses()
}
</script>