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
                    <SuperadminTableSearch v-model="searchQuery" :placeholder="$t('search')" @input="debouncedSearch" />
                    <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.companyApps"
                        :isLoading="state.isTableLoading" :sortData="state.sortData"
                        :emptyMessage="$t('superadmin.companies.companyApps.noAppsFound')" emptyIcon="ph:squares-four"
                        rowKey="uuid" @sort="handleSort">
                        <template #body>
                            <tr v-for="(companyApp, index) in state.companyApps?.data" :key="index"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors">
                                <td class="co-td text-[13px] text-[#1F2533]">{{ companyApp?.deal?.name }}</td>
                                <td class="co-td">
                                    <span v-if="companyApp?.is_active" class="co-badge co-badge-green">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                        {{ $t('superadmin.companies.companyApps.table.active') }}
                                    </span>
                                    <span v-else class="co-badge co-badge-red">
                                        <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                                        {{ $t('superadmin.companies.companyApps.table.inactive') }}
                                    </span>
                                </td>
                            </tr>
                        </template>
                    </SuperadminTable>
                    <Pagination :data="state.companyApps" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid
let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')

const detailTabs = computed(() => [
    { label: t('superadmin.companies.accounts.tabs.overview'), href: `/superadmin/companies/${companyUuid}/accounts`, icon: 'ph:house' },
    { label: t('superadmin.sidebar.licenses'), href: `/superadmin/companies/${companyUuid}/license-overview`, icon: 'ph:key' },
    { label: t('superadmin.sidebar.apps'), href: `/superadmin/companies/${companyUuid}/apps`, icon: 'ph:squares-four' },
    { label: t('superadmin.sidebar.invoices'), href: `/superadmin/companies/${companyUuid}/invoices`, icon: 'ph:invoice' },
    { label: t('superadmin.companies.table.actions.edit'), href: `/superadmin/companies/${companyUuid}/edit`, icon: 'ph:pencil-simple' },
])

const state = reactive({
    columnHeaders: computed(() => [
        { key: 'name', name: t('superadmin.companies.companyApps.table.name'), sorter: true },
        { key: 'status', name: t('superadmin.companies.companyApps.table.status') },
    ]),
    companyApps: {} as any,
    dataFilter: {
        search: ''
    } as any,
    error: {} as Error,
    isTableLoading: false,
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
        state.dataFilter.search = Array(searchQuery.value.trim().split(/\s+/))
        currentTablePage = 1
        fetchCompanyApps()
    }, 350)
}
</script>