<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>
                    {{ $t('superadmin.companies.companies') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>
            <template #header>
                {{ $t('superadmin.companies.companies') }}
            </template>

            <div class="p-1">
                <!-- Header -->
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.companies.companies') }}
                        </h1>
                        <p class="text-sm text-[#5C6478] mt-0.5">
                            {{
                                $t('superadmin.companies.totalClients', {
                                    count:
                                        state.companies?.meta?.total ?? 0
                                })
                            }}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button @click="exportCompanies" :disabled="state.isExporting"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-[#5C6478] border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors disabled:opacity-50">
                            <Icon name="ph:download-simple" class="w-4 h-4" />
                            {{ $t('superadmin.companies.export') }}
                        </button>
                        <button @click="state.modal.isImportCompanyOpen = true"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-[#5C6478] border border-[#EAECF0] hover:bg-[#F5F6F8] transition-colors">
                            <Icon name="ph:upload-simple" class="w-4 h-4" />
                            {{ $t('superadmin.companies.import') }}
                        </button>
                        <button @click="navigateTo('/superadmin/companies/new')"
                            class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                            style="background:#205E77">
                            <Icon name="ph:plus" class="w-4 h-4" />
                            {{ $t('superadmin.companies.newCompany') }}
                        </button>
                    </div>
                </div>

                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <SuperadminTableSearch v-model="searchQuery"
                        :placeholder="$t('superadmin.companies.searchPlaceholder')" @input="debouncedSearch" />

                    <!-- Status tabs -->
                    <div class="flex items-center bg-white border border-[#EAECF0] rounded-lg p-0.5">
                        <button v-for="tab in tabs" :key="tab.key"
                            class="px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors flex items-center gap-1.5"
                            :style="state.activeTab === tab.key ? 'background:#205E77;color:#fff' : 'color:#5C6478'"
                            @click="setTab(tab.key)">
                            {{ tab.label }}
                            <span class="text-[11px] font-normal opacity-70">({{ tab.count }})</span>
                        </button>
                    </div>

                    <!-- Sort -->
                    <select v-model="sortLabel"
                        class="text-sm border border-[#EAECF0] rounded-lg px-3 py-2 bg-white text-[#5C6478] outline-none focus:border-[#42AED9] transition-colors ml-auto"
                        @change="handleSortChange">
                        <option value="name_asc">{{ $t('superadmin.companies.sort.nameAsc') }}</option>
                        <option value="name_desc">{{ $t('superadmin.companies.sort.nameDesc') }}</option>
                        <option value="id_desc">{{ $t('superadmin.companies.sort.newestFirst') }}</option>
                        <option value="id_asc">{{ $t('superadmin.companies.sort.oldestFirst') }}</option>
                    </select>
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- Table -->
                <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.companies"
                    :isLoading="state.isTableLoading" :sortData="state.sortData"
                    :emptyMessage="$t('superadmin.companies.noCompaniesFound')"
                    :emptySubMessage="$t('superadmin.companies.createFirstClient')" rowKey="uuid" @sort="handleSort">
                    <template #body>
                        <tr v-for="(company, index) in state.companies?.data" :key="index"
                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                            @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                            <td class="co-td">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white"
                                        :style="`background:${avatarColor(company?.name)}`">
                                        {{ initials(company?.name) }}
                                    </div>
                                    <div>
                                        <p class="text-[13px] font-semibold text-[#1F2533]">
                                            {{ company?.name || '—' }}
                                        </p>
                                        <p class="text-[11px] text-[#8891A4]">
                                            {{ company?.email || '' }}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td class="co-td">
                                <span v-if="company?.is_active"
                                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EDF7EE] text-[#2E9E33]">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                    {{ $t('superadmin.companies.table.active') }}
                                </span>
                                <span v-else
                                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF0F0] text-[#CC3B2D]">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#CC3B2D]"></span>
                                    {{ $t('superadmin.companies.table.inactive') }}
                                </span>
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ company?.phone || '—' }}
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478] font-mono">
                                {{ company?.cvr || '—' }}
                            </td>
                            <td class="co-td">
                                <a v-if="company?.website" :href="company.website" target="_blank"
                                    class="text-[12px] text-[#42AED9] hover:underline truncate block max-w-[160px]"
                                    @click.stop>
                                    {{ company.website.replace(/^https?:\/\//, '') }}
                                </a>
                                <span v-else class="text-[#8891A4] text-[13px]">—</span>
                            </td>
                            <td class="co-td">
                                <div v-if="company?.storage_used_gb !== null && company?.storage_used_gb !== undefined"
                                    class="min-w-[110px]">
                                    <p class="text-[13px]" :class="storageTextClass(company)">
                                        {{ formatGb(company.storage_used_gb) }}
                                        <span class="text-[#8891A4]">/ {{ formatGb(company.storage_quota_gb) }} GB</span>
                                    </p>
                                    <div class="mt-1 h-1 bg-[#F5F6F8] rounded-full overflow-hidden">
                                        <div class="h-full rounded-full" :class="storageBarClass(company)"
                                            :style="`width:${storagePercent(company)}%`"></div>
                                    </div>
                                </div>
                                <span v-else class="text-[#8891A4] text-[13px]">—</span>
                            </td>
                            <td class="co-td" @click.stop>
                                <div
                                    class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <SuperadminTableButton
                                        @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                                        <Icon name="ph:eye" class="w-3.5 h-3.5" />
                                        {{ $t('superadmin.companies.table.actions.view') }}
                                    </SuperadminTableButton>
                                    <SuperadminTableButton
                                        @click="navigateTo(`/superadmin/companies/${company.uuid}/edit`)">
                                        <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                    </SuperadminTableButton>
                                    <SuperadminTableButton :buttonStyle="company.is_active ? 'danger' : 'success'"
                                        @click="activateDeactivateCompany(index as number, company)">
                                        <Icon :name="company.is_active ? 'ph:x' : 'ph:check'" class="w-3.5 h-3.5" />
                                    </SuperadminTableButton>
                                </div>
                            </td>
                        </tr>
                    </template>
                </SuperadminTable>
                <Pagination :data="state.companies" @previous="previous" @next="next" />
            </div>
            <ModulesSuperadminCompanyModalImport :isModalOpen="state.modal.isImportCompanyOpen"
                @close="state.modal.isImportCompanyOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()

let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')
const sortLabel = ref('id_desc')

const state = reactive({
    activeCount: 0,
    activeTab: 'all',
    allCount: 0,
    payingCount: 0,
    columnHeaders: computed(() => [
        { key: 'name', name: t('superadmin.companies.company'), sorter: true },
        { key: 'status', name: t('superadmin.companies.table.status') },
        { key: 'phone', name: t('superadmin.companies.table.phone') },
        { key: 'cvr', name: t('superadmin.companies.table.cvr') },
        { key: 'website', name: t('superadmin.companies.table.website') },
        { key: 'storage_used_bytes', name: t('superadmin.companies.table.storage'), sorter: true },
        { key: 'actions', name: '' },
    ]),
    companies: [] as any,
    dataFilter: {
        search: '',
    } as any,
    error: {} as Error,
    inactiveCount: 0,
    isTableLoading: false,
    isExporting: false,
    modal: { isImportCompanyOpen: false },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend'
    },
})

const tabs = computed(() => [
    { key: 'all', label: t('superadmin.companies.tabs.all'), count: state.allCount },
    { key: 'paying', label: t('superadmin.companies.tabs.paying'), count: state.payingCount },
    { key: 'active', label: t('superadmin.companies.tabs.active'), count: state.activeCount },
    { key: 'inactive', label: t('superadmin.companies.tabs.inactive'), count: state.inactiveCount },
])

// Avatar colours based on name
const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) => (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

// Storage usage. The numbers are the nightly measurement cached on the company;
// the company's own page recalculates on open.
const formatGb = (value: any) => Number(value ?? 0).toLocaleString('da-DK', { maximumFractionDigits: 2 })

function storagePercent(company: any) {
    const quota = Number(company?.storage_quota_gb ?? 0)
    if (!quota) return 0
    return Math.min(100, Math.round((Number(company?.storage_used_gb ?? 0) / quota) * 100))
}

function storageTextClass(company: any) {
    const percent = storagePercent(company)
    if (percent >= 100) return 'text-[#CC3B2D] font-semibold'
    if (percent >= 80) return 'text-[#D4900A] font-semibold'
    return 'text-[#5C6478]'
}

function storageBarClass(company: any) {
    const percent = storagePercent(company)
    if (percent >= 100) return 'bg-[#CC3B2D]'
    if (percent >= 80) return 'bg-[#D4900A]'
    return 'bg-[#42AED9]'
}

onMounted(() => {
    if (router.currentRoute.value.query?.paying === 'true') {
        state.activeTab = 'paying'
    }
    fetchCompanies()
})

function buildFilterParams() {
    const params: any = {}
    if (state.dataFilter.search) params.search = state.dataFilter.search
    if (state.activeTab === 'active') params.is_active = true
    if (state.activeTab === 'inactive') params.is_active = false
    if (state.activeTab === 'paying') params.paying = true
    return params
}

async function fetchCompanies() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...buildFilterParams(),
        }

        const response = await companyService.getCompanies(params)
        if (response) {
            state.companies = response
            // Compute tab counts
            const items = response?.data ?? []
            state.allCount = (response?.active_count + response?.inactive_count) || 0
            state.activeCount = response?.active_count || 0
            state.inactiveCount = response?.inactive_count || 0
            state.payingCount = response?.paying_count || 0
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        const trimmed = searchQuery.value.trim()
        state.dataFilter.search = trimmed.length ? Array(trimmed.split(/\s+/)) : null
        currentTablePage = 1
        fetchCompanies()
    }, 350)
}

function setTab(tab: string) {
    state.activeTab = tab
    currentTablePage = 1
    router.replace({ query: tab === 'paying' ? { paying: 'true' } : {} })
    fetchCompanies()
}

function handleSortChange() {
    const [field, order] = sortLabel.value.split('_')
    state.sortData.sortField = field
    state.sortData.sortOrder = order === 'asc' ? 'ascend' : 'descend'
    currentTablePage = 1
    fetchCompanies()
}

function handleSort({ sort, column }: { sort: string | null; column: string | null }) {
    state.sortData.sortField = column ?? 'id'
    state.sortData.sortOrder = sort ?? 'descend'
    currentTablePage = 1
    fetchCompanies()
}

function previous() {
    currentTablePage--
    fetchCompanies()
}

function next() {
    currentTablePage++
    fetchCompanies()
}

async function exportCompanies() {
    state.isExporting = true
    try {
        const response = await companyService.downloadCompanies(buildFilterParams())
        if (response) saveAs(response, `${t('superadmin.companies.companies')}.xlsx`)
    } catch (error: any) {
        state.error = error
    }
    state.isExporting = false
}

async function activateDeactivateCompany(index: number, company: any) {
    try {
        const response = await companyService.activateDeactiveCompany(company.uuid, { is_active: !company.is_active })
        if (response) {
            state.companies.data[index].is_active = response?.data?.is_active
            const key = response?.data?.is_active
                ? 'superadmin.companies.form.alert.companySuccessfullyActivated'
                : 'superadmin.companies.form.alert.companySuccessfullyDeactivated'
            successAlert(`${t('alert.success')}!`, `${t(key)}.`)
        }
    } catch (error: any) { state.error = error }
}
</script>