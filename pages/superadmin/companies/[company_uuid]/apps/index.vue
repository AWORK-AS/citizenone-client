<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.companyApps.companyApps') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.companyApps.companyApps') }}</template>

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

                <div class="mt-5 space-y-4">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex items-center justify-between gap-3">
                        <SuperadminTableSearch v-model="searchQuery" :placeholder="$t('search')"
                            @input="debouncedSearch" class="flex-1" />
                        <FormButton v-if="canManageLicenses" buttonStyle="action" @click="state.grantModalOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('superadmin.grantLicense.grantButton') }}
                        </FormButton>
                    </div>
                    <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.companyApps"
                        :isLoading="state.isTableLoading" :sortData="state.sortData"
                        :emptyMessage="$t('superadmin.companies.companyApps.noAppsFound')" emptyIcon="ph:squares-four"
                        rowKey="uuid" @sort="handleSort">
                        <template #body>
                            <tr v-for="(companyApp, index) in state.companyApps?.data" :key="index"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                <td class="co-td text-[13px] text-[#1F2533]">{{ companyApp?.name }}</td>
                                <td class="co-td text-[13px] text-[#1F2533]">
                                    <div v-if="canManageLicenses && companyApp?.is_quantifiable" class="flex items-center gap-2">
                                        <button class="co-action-btn" :disabled="state.isAdjusting"
                                            :title="$t('superadmin.companies.companyApps.table.decrease')"
                                            @click="confirmDecrement(companyApp)">
                                            <Icon name="ph:minus" class="w-3.5 h-3.5" />
                                        </button>
                                        <span class="w-6 text-center">{{ companyApp?.quantity }}</span>
                                        <button class="co-action-btn" :disabled="state.isAdjusting"
                                            :title="$t('superadmin.companies.companyApps.table.increase')"
                                            @click="increment(companyApp)">
                                            <Icon name="ph:plus" class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <span v-else>{{ companyApp?.quantity }}</span>
                                </td>
                                <td class="co-td">
                                    <div class="flex items-center gap-3">
                                        <span v-if="companyApp?.active_quantity > 0" class="co-badge co-badge-green">
                                            <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                            {{ $t('superadmin.companies.companyApps.table.active') }}
                                        </span>
                                        <span v-else class="co-badge co-badge-red">
                                            <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                                            {{ $t('superadmin.companies.companyApps.table.inactive') }}
                                        </span>
                                        <button v-if="canManageLicenses" class="co-action-btn"
                                            :disabled="state.isAdjusting" @click="confirmToggleStatus(companyApp)">
                                            {{ companyApp?.active_quantity > 0
                                                ? $t('superadmin.companies.companyApps.table.actions.deactivate')
                                                : $t('superadmin.companies.companyApps.table.actions.activate') }}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </SuperadminTable>
                    <Pagination :data="state.companyApps" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesSuperadminCompanyModalGrantApplicationLicense :open="state.grantModalOpen"
                :companyUuid="companyUuid as string" @close="state.grantModalOpen = false"
                @granted="fetchCompanyApps" />

            <DialogConfirmation :isModalOpen="state.decrementConfirmOpen"
                :message="$t('superadmin.companies.companyApps.table.decreaseConfirm', { name: state.appToAdjust?.name })"
                @close="state.decrementConfirmOpen = false" @confirm="decrement" />

            <DialogConfirmation :isModalOpen="state.toggleConfirmOpen"
                :message="state.appToToggle?.active_quantity > 0
                    ? $t('superadmin.companies.companyApps.confirmation.deactivateAppConfirmation')
                    : $t('superadmin.companies.companyApps.confirmation.activateAppConfirmation')"
                @close="state.toggleConfirmOpen = false" @confirm="toggleStatus" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { licenseService } from '@/components/api/superadmin/LicenseService'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { successAlert } = useAlert()
const { can } = usePermissions()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid
let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')

const canManageLicenses = computed(() => can('manage_licenses'))

const detailTabs = computed(() => [
    { label: t('superadmin.companies.accounts.tabs.overview'), href: `/superadmin/companies/${companyUuid}/accounts`, icon: 'ph:house' },
    { label: t('superadmin.sidebar.licenses'), href: `/superadmin/companies/${companyUuid}/license-overview`, icon: 'ph:key' },
    { label: t('superadmin.sidebar.apps'), href: `/superadmin/companies/${companyUuid}/apps`, icon: 'ph:squares-four' },
    { label: t('superadmin.sidebar.invoices'), href: `/superadmin/companies/${companyUuid}/invoices`, icon: 'ph:invoice' },
    { label: t('superadmin.companies.tabs.migration'), href: `/superadmin/companies/${companyUuid}/migration`, icon: 'ph:arrows-merge' },
    { label: t('superadmin.companies.table.actions.edit'), href: `/superadmin/companies/${companyUuid}/edit`, icon: 'ph:pencil-simple' },
])

const state = reactive({
    columnHeaders: computed(() => [
        { key: 'name', name: t('superadmin.companies.companyApps.table.name'), sorter: true },
        { key: 'quantity', name: t('superadmin.companies.companyApps.table.quantity'), sorter: true },
        { key: 'status', name: t('superadmin.companies.companyApps.table.status') },
    ]),
    companyApps: {} as any,
    dataFilter: {
        search: ''
    } as any,
    error: {} as Error,
    grantModalOpen: false,
    isTableLoading: false,
    isAdjusting: false,
    decrementConfirmOpen: false,
    appToAdjust: null as any,
    toggleConfirmOpen: false,
    appToToggle: null as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCompanyApps()
})

async function fetchCompanyApps() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await companyService.getCompanyApps(companyUuid, params)
        if (response) {
            state.companyApps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCompanyApps()
}

function next() {
    currentTablePage++
    fetchCompanyApps()
}

function handleSort({ sort, column }: { sort: string | null; column: string | null }) {
    state.sortData.sortField = column ?? 'id'
    state.sortData.sortOrder = sort ?? 'descend'
    currentTablePage = 1
    fetchCompanyApps()
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        const trimmed = searchQuery.value.trim()
        state.dataFilter.search = trimmed.length ? Array(trimmed.split(/\s+/)) : null
        currentTablePage = 1
        fetchCompanyApps()
    }, 350)
}

async function increment(companyApp: any) {
    state.isAdjusting = true
    try {
        await licenseService.adjustApplicationQuantity(companyUuid as string, companyApp.application_uuid, 1)
        successAlert(t('superadmin.companies.companyApps.table.increaseSuccess'), companyApp.name)
        fetchCompanyApps()
    } catch (error: any) {
        state.error = error
    }
    state.isAdjusting = false
}

function confirmDecrement(companyApp: any) {
    state.appToAdjust = companyApp
    state.decrementConfirmOpen = true
}

async function decrement() {
    if (!state.appToAdjust) return
    state.isAdjusting = true
    try {
        await licenseService.adjustApplicationQuantity(companyUuid as string, state.appToAdjust.application_uuid, -1)
        successAlert(t('superadmin.companies.companyApps.table.decreaseSuccess'), state.appToAdjust.name)
        fetchCompanyApps()
    } catch (error: any) {
        state.error = error
    }
    state.isAdjusting = false
}

function confirmToggleStatus(companyApp: any) {
    state.appToToggle = companyApp
    state.toggleConfirmOpen = true
}

async function toggleStatus() {
    if (!state.appToToggle) return
    state.isAdjusting = true
    try {
        const activate = !(state.appToToggle.active_quantity > 0)
        await licenseService.toggleAppStatus(companyUuid as string, state.appToToggle.application_uuid, activate)
        successAlert(
            activate
                ? t('superadmin.companies.companyApps.alert.appSuccessfullyActivated')
                : t('superadmin.companies.companyApps.alert.appSuccessfullyDeactivated'),
            state.appToToggle.name,
        )
        fetchCompanyApps()
    } catch (error: any) {
        state.error = error
    }
    state.isAdjusting = false
}
</script>