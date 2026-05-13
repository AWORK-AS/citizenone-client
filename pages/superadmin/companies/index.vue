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
                            {{ $t('superadmin.companies.totalClients', {
                                count:
                                    state.companies?.meta?.total ?? 0
                            }) }}
                        </p>
                    </div>
                    <div class="flex items-center gap-2">
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

                <!-- Search + tabs + sort -->
                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <!-- Search -->
                    <div class="relative flex-1 min-w-[220px] max-w-[380px]">
                        <Icon name="ph:magnifying-glass"
                            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8891A4]" />
                        <input v-model="searchQuery" type="text"
                            :placeholder="$t('superadmin.companies.searchPlaceholder')"
                            class="w-full pl-9 pr-3 py-2 text-sm border border-[#EAECF0] rounded-lg bg-white text-[#1F2533] placeholder-[#8891A4] outline-none focus:border-[#42AED9] focus:ring-2 focus:ring-[#42AED9]/10 transition-colors"
                            @input="debouncedSearch" />
                    </div>

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

                <!-- Table card -->
                <div class="bg-white border border-[#EAECF0] rounded-xl overflow-hidden shadow-sm">
                    <!-- Loading -->
                    <div v-if="state.isTableLoading" class="flex items-center justify-center py-16">
                        <Icon name="ph:spinner" class="w-7 h-7 text-[#42AED9] animate-spin" />
                    </div>

                    <!-- Empty -->
                    <div v-else-if="!state.companies?.data?.length"
                        class="flex flex-col items-center gap-3 py-16 text-[#8891A4]">
                        <Icon name="ph:magnifying-glass" class="w-12 h-12 opacity-30" />
                        <p class="text-sm font-medium">{{ $t('superadmin.companies.noCompaniesFound') }}</p>
                        <p class="text-xs">{{ $t('superadmin.companies.createFirstClient') }}</p>
                    </div>

                    <!-- Table -->
                    <table v-else class="w-full">
                        <thead>
                            <tr class="border-b border-[#EAECF0] bg-[#F9FAFB]">
                                <th class="co-th">{{ $t('superadmin.companies.company') }}</th>
                                <th class="co-th">{{ $t('superadmin.companies.table.status') }}</th>
                                <th class="co-th">{{ $t('superadmin.companies.table.phone') }}</th>
                                <th class="co-th">{{ $t('superadmin.companies.table.cvr') }}</th>
                                <th class="co-th">{{ $t('superadmin.companies.table.website') }}</th>
                                <th class="co-th"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(company, index) in state.companies?.data" :key="index"
                                class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group cursor-pointer"
                                @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">

                                <!-- Name + avatar -->
                                <td class="co-td">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white"
                                            :style="`background:${avatarColor(company?.name)}`">
                                            {{ initials(company?.name) }}
                                        </div>
                                        <div>
                                            <p class="text-[13px] font-semibold text-[#1F2533]">{{ company?.name || '—'
                                            }}</p>
                                            <p class="text-[11px] text-[#8891A4]">{{ company?.email || '' }}</p>
                                        </div>
                                    </div>
                                </td>

                                <!-- Status -->
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

                                <!-- Phone -->
                                <td class="co-td text-[13px] text-[#5C6478]">{{ company?.phone || '—' }}</td>

                                <!-- CVR -->
                                <td class="co-td text-[13px] text-[#5C6478] font-mono">{{ company?.cvr || '—' }}</td>

                                <!-- Website -->
                                <td class="co-td">
                                    <a v-if="company?.website" :href="company.website" target="_blank"
                                        class="text-[12px] text-[#42AED9] hover:underline truncate block max-w-[160px]"
                                        @click.stop>
                                        {{ company.website.replace(/^https?:\/\//, '') }}
                                    </a>
                                    <span v-else class="text-[#8891A4] text-[13px]">—</span>
                                </td>

                                <!-- Actions (reveal on hover) -->
                                <td class="co-td" @click.stop>
                                    <div
                                        class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="co-action-btn"
                                            @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                                            <Icon name="ph:eye" class="w-3.5 h-3.5" />
                                            {{ $t('superadmin.companies.table.actions.view') }}
                                        </button>
                                        <button class="co-action-btn"
                                            @click="navigateTo(`/superadmin/companies/${company.uuid}/edit`)">
                                            <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                        </button>
                                        <button class="co-action-btn"
                                            :class="company.is_active ? 'text-[#CC3B2D] hover:bg-red-50 border-red-200' : 'text-[#2E9E33] hover:bg-green-50 border-green-200'"
                                            @click="activateDeactivateCompany(index as number, company)">
                                            <Icon :name="company.is_active ? 'ph:x' : 'ph:check'" class="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

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
    companies: [] as any,
    activeTab: 'all',
    allCount: 0,
    activeCount: 0,
    inactiveCount: 0,
    error: {} as Error,
    isTableLoading: false,
    modal: { isImportCompanyOpen: false },
    sortData: { sortField: 'id', sortOrder: 'descend' },
    dataFilter: {
        search: '',
        status: ''
    } as any,
})

const tabs = computed(() => [
    { key: 'all', label: t('superadmin.companies.tabs.all'), count: state.allCount },
    { key: 'active', label: t('superadmin.companies.tabs.active'), count: state.activeCount },
    { key: 'inactive', label: t('superadmin.companies.tabs.inactive'), count: state.inactiveCount },
])

// Avatar colours based on name
const COLORS = ['#205E77', '#2E9E33', '#368F8B', '#1A4D99', '#D4900A', '#9B4D9B']
const avatarColor = (name: string) => COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length]
const initials = (name: string) => (name || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

onMounted(() => {
    // Pick up ?paying= from URL
    const paying = router.currentRoute.value.query?.paying
    if (paying === 'true') { state.activeTab = 'active'; state.dataFilter.status = 'active' }
    if (paying === 'false') { state.activeTab = 'inactive'; state.dataFilter.status = 'inactive' }
    fetchCompanies()
})

async function fetchCompanies() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params: any = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        if (state.dataFilter.search) params.search = state.dataFilter.search
        if (state.activeTab === 'active') params.is_active = true
        if (state.activeTab === 'inactive') params.is_active = false

        const response = await companyService.getCompanies(params)
        if (response) {
            state.companies = response
            // Compute tab counts
            const items = response?.data ?? []
            state.allCount = response?.total ?? items.length
            state.activeCount = items.filter((c: any) => c.is_active).length
            state.inactiveCount = items.filter((c: any) => !c.is_active).length
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        state.dataFilter.search = Array(searchQuery.value.trim().split(/\s+/))
        // state.dataFilter.search = value?.[0] == '' ? [] : value
        currentTablePage = 1
        fetchCompanies()
    }, 350)
}

function setTab(tab: string) {
    state.activeTab = tab
    currentTablePage = 1
    fetchCompanies()
}

function handleSortChange() {
    const [field, order] = sortLabel.value.split('_')
    state.sortData.sortField = field
    state.sortData.sortOrder = order === 'asc' ? 'ascend' : 'descend'
    currentTablePage = 1
    fetchCompanies()
}

function previous() { currentTablePage--; fetchCompanies() }
function next() { currentTablePage++; fetchCompanies() }

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

<style scoped>
.co-th {
    text-align: left;
    padding: 10px 16px;
    font-size: 11px;
    font-weight: 600;
    color: #8891A4;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    white-space: nowrap;
}

.co-td {
    padding: 12px 16px;
    vertical-align: middle;
}

.co-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    background: #F5F6F8;
    color: #5C6478;
    border: 1px solid #EAECF0;
    transition: all 0.15s;
    cursor: pointer;
}

.co-action-btn:hover {
    background: #EEF4FB;
    color: #205E77;
}
</style>
