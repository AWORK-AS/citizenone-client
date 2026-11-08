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
                <ModulesSuperadminPageHeader :title="$t('superadmin.companies.companies')"
                    :subtitle="$t('superadmin.companies.totalClients', { count: state.companies?.meta?.total ?? 0 })">
                    <template #actions>
                        <div class="flex items-center gap-2">
                            <button @click="exportCompanies" :disabled="state.isExporting"
                                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-ink-body border border-line hover:bg-surface-canvas transition-colors disabled:opacity-50">
                                <Icon name="ph:download-simple" class="w-4 h-4" />
                                {{ $t('superadmin.companies.export') }}
                            </button>
                            <button @click="state.modal.isImportCompanyOpen = true"
                                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white text-ink-body border border-line hover:bg-surface-canvas transition-colors">
                                <Icon name="ph:upload-simple" class="w-4 h-4" />
                                {{ $t('superadmin.companies.import') }}
                            </button>
                            <button @click="navigateTo('/superadmin/companies/new')"
                                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors bg-tertiary">
                                <Icon name="ph:plus" class="w-4 h-4" />
                                {{ $t('superadmin.companies.newCompany') }}
                            </button>
                        </div>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <ModulesSuperadminDataTable :columns="columns" :rows="state.companies?.data ?? []" rowKey="uuid"
                    :loading="state.isTableLoading" :error="state.loadError" :meta="meta"
                    :sort="list.state.sort" :order="list.state.order"
                    v-model:search="list.searchInput.value"
                    :searchPlaceholder="$t('superadmin.companies.searchPlaceholder')"
                    :filtered="list.isFiltered.value" :chips="chips" clickable
                    emptyIcon="ph:buildings"
                    :emptyTitle="$t('superadmin.companies.noCompaniesFound')"
                    :emptyHint="$t('superadmin.companies.createFirstClient')"
                    :exportName="$t('superadmin.companies.companies')" :exportPage="exportPage"
                    :exportColumns="exportColumns"
                    @sort="list.toggleSort" @page="list.setPage" @reset="list.reset" @retry="list.reload"
                    @remove-chip="(key) => list.setFilter(key, '')"
                    @row-click="(company) => navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                    <template #filters>
                        <ModulesSuperadminDataTableTabs :modelValue="list.state.filters.status || 'all'" :tabs="tabs"
                            @update:modelValue="(tab) => list.setFilter('status', tab === 'all' ? '' : tab)" />
                        <ModulesSuperadminDataTableSelect :modelValue="list.state.filters.source" :options="sourceOptions"
                            :placeholder="$t('superadmin.companies.source.all')"
                            :label="$t('superadmin.companies.table.source')"
                            @update:modelValue="(source) => list.setFilter('source', source)" />
                        <ModulesSuperadminDataTableSelect :modelValue="sortLabel" :options="sortOptions"
                            :placeholder="sortOptions.some(o => o.value === sortLabel) ? undefined : '—'"
                            emptyValue="" @update:modelValue="handleSortChange" />
                    </template>

                    <template #cell-name="{ row: company }">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-white"
                                :style="`background:${avatarColor(company?.name)}`">
                                {{ initials(company?.name) }}
                            </div>
                            <div>
                                <p class="text-[13px] font-semibold text-ink">
                                    {{ company?.name || '—' }}
                                </p>
                                <p class="text-[11px] text-ink-muted">
                                    {{ company?.email || '' }}
                                </p>
                            </div>
                        </div>
                    </template>
                    <template #cell-status="{ row: company }">
                        <ModulesSuperadminStatusPill v-if="company?.is_active" variant="success"
                            :label="$t('superadmin.companies.table.active')" />
                        <ModulesSuperadminStatusPill v-else variant="danger"
                            :label="$t('superadmin.companies.table.inactive')" />
                    </template>
                    <template #cell-cvr="{ row: company }">
                        <span class="font-mono">{{ company?.cvr || '—' }}</span>
                    </template>
                    <template #cell-website="{ row: company }">
                        <a v-if="company?.website" :href="company.website" target="_blank"
                            class="text-[12px] text-accent hover:underline truncate block max-w-[160px]">
                            {{ company.website.replace(/^https?:\/\//, '') }}
                        </a>
                        <span v-else class="text-ink-muted">—</span>
                    </template>
                    <template #cell-signup_source="{ row: company }">
                        <span v-if="company?.signup_source?.channel"
                            class="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            :class="company.signup_source.channel === 'google_ads' ? 'bg-accent-soft text-secondary' : company.signup_source.channel === 'share' ? 'bg-success-soft text-success-ink' : 'bg-surface-canvas text-ink-body'"
                            :title="[company.signup_source.detail, company.signup_source.landing_page].filter(Boolean).join(' · ')">
                            {{ company.signup_source.label }}
                        </span>
                        <span v-else class="text-ink-muted">{{ $t('superadmin.companies.source.unknown') }}</span>
                        <div v-if="company?.signup_source?.detail" class="text-[11px] text-ink-muted truncate max-w-[180px] mt-0.5">
                            {{ company.signup_source.detail }}
                        </div>
                    </template>
                    <template #cell-storage_used_bytes="{ row: company }">
                        <div v-if="company?.storage_used_gb !== null && company?.storage_used_gb !== undefined"
                            class="min-w-[110px]">
                            <p class="text-[13px]" :class="storageTextClass(company)">
                                {{ formatStorageUsed(company.storage_used_bytes, company.storage_used_gb) }}
                                <span class="text-ink-muted">/ {{ formatGb(company.storage_quota_gb) }} GB</span>
                            </p>
                            <div class="mt-1 h-1 bg-surface-canvas rounded-full overflow-hidden">
                                <div class="h-full rounded-full" :class="storageBarClass(company)"
                                    :style="`width:${storagePercent(company)}%`"></div>
                            </div>
                        </div>
                        <span v-else class="text-ink-muted">—</span>
                    </template>
                    <template #cell-binding_ends_on="{ row: company }">
                        <div v-if="company?.binding_ends_on" class="min-w-[130px]">
                            <p class="text-[13px] text-ink">{{ formatDay(company.binding_ends_on) }}</p>
                            <Tooltip :text="$t('superadmin.agreements.help.mrrArr')" position="top" wrap>
                                <p class="text-[11px] text-ink-muted">
                                    {{ $t('superadmin.agreements.companyList.mrr', { amount: formatAmount(company.contract_mrr ?? 0, 'DKK') }) }}
                                </p>
                            </Tooltip>
                        </div>
                        <span v-else class="text-ink-muted">—</span>
                    </template>
                    <template #cell-next_payment="{ row: company }">
                        <div v-if="company?.next_payment_at" class="min-w-[130px]">
                            <p class="text-[13px] text-ink">
                                {{ formatAmount(company.next_payment_amount, 'DKK') }}
                            </p>
                            <p class="text-[11px] text-ink-muted">
                                {{ formatDay(company.next_payment_at) }}
                                · {{ $t('superadmin.companies.table.perYear', {
                                    amount: formatAmount(company.payments_next_12_months, 'DKK')
                                }) }}
                            </p>
                            <p v-if="company.is_collecting === false" class="text-[11px] text-danger">
                                {{ $t('superadmin.companies.table.notCollecting') }}
                            </p>
                        </div>
                        <span v-else class="text-ink-muted">—</span>
                    </template>
                    <template #cell-actions="{ row: company, index }">
                        <div
                            class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
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
                    </template>
                </ModulesSuperadminDataTable>
            </div>
            <ModulesSuperadminCompanyModalImport :isModalOpen="state.modal.isImportCompanyOpen"
                @close="state.modal.isImportCompanyOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { SA_SERIES } from '@/utils/superadminPalette'
import type { ComputedRef } from 'vue'
import moment from 'moment'
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { useStorageFormat } from '@/composables/useStorageFormat'
import { useListQuery } from '@/composables/useListQuery'
import { apiSearchParam, type ListQueryState } from '@/composables/listQuery'
import { normalizePageMeta, responseRows, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const { formatLocalized } = useDatetimeFormatter()

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatStorageUsed } = useStorageFormat()
const { formatAmount } = useAmountFormatter()

/**
 * Whether this superadmin is being told about payments at all. The fields are
 * absent rather than null without `view_financials`, so one row is enough to
 * tell - and an empty list is nothing to show a column for either way.
 */
// Agreement figures only come with `view_financials`, like the payment data.
const hasAgreementData: ComputedRef<boolean> = computed(() =>
    (state.companies?.data ?? []).some((company: any) => company?.binding_ends_on !== undefined)
)

const hasPaymentData = computed(() =>
    (state.companies?.data ?? []).some((company: any) => company?.next_payment_at !== undefined)
)

function formatDay(date: string) {
    return date ? formatLocalized(moment(date), 'D. MMM YYYY') : '—'
}

const state = reactive({
    activeCount: 0,
    allCount: 0,
    payingCount: 0,
    companies: [] as any,
    error: {} as Error,
    loadError: null as string | null,
    inactiveCount: 0,
    isTableLoading: false,
    isExporting: false,
    modal: { isImportCompanyOpen: false },
})

// Search, status tab, source, sort and page live in the URL (?q=&status=&source=&sort=&page=).
const list = useListQuery({
    filters: { status: '', source: '' },
    defaultSort: 'id',
    defaultOrder: 'desc',
    onChange: fetchCompanies,
})

const meta = computed(() => normalizePageMeta(state.companies))

const columns = computed<DataTableColumn[]>(() => [
    { key: 'name', label: t('superadmin.companies.company'), sortable: true },
    { key: 'status', label: t('superadmin.companies.table.status') },
    { key: 'phone', label: t('superadmin.companies.table.phone') },
    { key: 'cvr', label: t('superadmin.companies.table.cvr') },
    { key: 'website', label: t('superadmin.companies.table.website') },
    { key: 'signup_source', label: t('superadmin.companies.table.source') },
    { key: 'storage_used_bytes', label: t('superadmin.companies.table.storage'), sortable: true },
    // Future payments are only in the response for a superadmin with
    // `view_financials`, so the column comes and goes with the data rather
    // than standing there empty for everybody else.
    ...(hasAgreementData.value ? [{ key: 'binding_ends_on', label: t('superadmin.agreements.companyList.bindingUntil') }] : []),
    ...(hasPaymentData.value ? [{ key: 'next_payment', label: t('superadmin.companies.table.nextPayment') }] : []),
    { key: 'actions', label: '', align: 'right' },
])

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.companies.company'), value: c => c?.name },
    { label: t('superadmin.companies.form.emailAddress'), value: c => c?.email },
    { label: t('superadmin.companies.table.status'), value: c => t(c?.is_active ? 'superadmin.companies.table.active' : 'superadmin.companies.table.inactive') },
    { label: t('superadmin.companies.table.phone'), value: c => c?.phone },
    { label: t('superadmin.companies.table.cvr'), value: c => c?.cvr },
    { label: t('superadmin.companies.table.website'), value: c => c?.website },
    { label: t('superadmin.companies.table.source'), value: c => c?.signup_source?.label ?? t('superadmin.companies.source.unknown') },
    { label: `${t('superadmin.companies.table.storage')} (GB)`, value: c => c?.storage_used_gb, type: 'number' },
    ...(hasAgreementData.value ? [
        { label: t('superadmin.agreements.companyList.bindingUntil'), value: (c: any) => c?.binding_ends_on, type: 'date' as const },
    ] : []),
    ...(hasPaymentData.value ? [
        { label: t('superadmin.companies.table.nextPayment'), value: (c: any) => c?.next_payment_at, type: 'date' as const },
        { label: `${t('superadmin.companies.table.nextPayment')} (DKK)`, value: (c: any) => c?.next_payment_amount, type: 'amount' as const },
    ] : []),
])

const tabs = computed(() => [
    { key: 'all', label: t('superadmin.companies.tabs.all'), count: state.allCount },
    { key: 'paying', label: t('superadmin.companies.tabs.paying'), count: state.payingCount },
    { key: 'active', label: t('superadmin.companies.tabs.active'), count: state.activeCount },
    { key: 'inactive', label: t('superadmin.companies.tabs.inactive'), count: state.inactiveCount },
])

const sourceOptions = computed(() => [
    { value: 'google_ads', label: 'Google Ads' },
    { value: 'share', label: t('superadmin.companies.source.share') },
    { value: 'search', label: t('superadmin.companies.source.search') },
    { value: 'findsocialetilbud', label: 'FindSocialeTilbud' },
    { value: 'product', label: t('superadmin.companies.source.product') },
    { value: 'campaign', label: t('superadmin.companies.source.campaign') },
    { value: 'referral', label: t('superadmin.companies.source.referral') },
    { value: 'direct', label: t('superadmin.companies.source.direct') },
    { value: 'unknown', label: t('superadmin.companies.source.unknown') },
])

const sortOptions = computed(() => [
    { value: 'name_asc', label: t('superadmin.companies.sort.nameAsc') },
    { value: 'name_desc', label: t('superadmin.companies.sort.nameDesc') },
    { value: 'id_desc', label: t('superadmin.companies.sort.newestFirst') },
    { value: 'id_asc', label: t('superadmin.companies.sort.oldestFirst') },
])

// The quick sort shows the header sort when it is one of its four, and a dash otherwise.
const sortLabel = computed(() => `${list.state.sort}_${list.state.order}`)

const chips = computed(() => {
    const out = []
    const source = list.state.filters.source
    if (source) out.push({ key: 'source', label: sourceOptions.value.find(o => o.value === source)?.label ?? source })
    return out
})

// Avatar colours based on name
const COLORS = SA_SERIES
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
    if (percent >= 100) return 'text-danger font-semibold'
    if (percent >= 80) return 'text-warning font-semibold'
    return 'text-ink-body'
}

function storageBarClass(company: any) {
    const percent = storagePercent(company)
    if (percent >= 100) return 'bg-danger'
    if (percent >= 80) return 'bg-warning'
    return 'bg-accent'
}

function buildFilterParams(query: ListQueryState = list.state) {
    const params: any = {}
    const search = apiSearchParam(query.search)
    if (search) params.search = search
    if (query.filters.status === 'active') params.is_active = true
    if (query.filters.status === 'inactive') params.is_active = false
    if (query.filters.status === 'paying') params.paying = true
    if (query.filters.source) params.source = query.filters.source
    return params
}

function listParams(page: number) {
    return { page, ...list.apiSort(), ...buildFilterParams() }
}

let requestSeq = 0

async function fetchCompanies() {
    const seq = ++requestSeq
    state.loadError = null
    state.isTableLoading = true
    try {
        const response = await companyService.getCompanies(listParams(list.state.page))
        if (seq !== requestSeq) return
        if (response) {
            state.companies = response
            state.allCount = (response?.active_count + response?.inactive_count) || 0
            state.activeCount = response?.active_count || 0
            state.inactiveCount = response?.inactive_count || 0
            state.payingCount = response?.paying_count || 0
        }
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.loadError = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.isTableLoading = false
}

async function exportPage(page: number) {
    const response = await companyService.getCompanies(listParams(page))
    const pageMeta = normalizePageMeta(response)
    return { rows: responseRows(response), lastPage: pageMeta?.lastPage ?? 1, total: pageMeta?.total ?? 0 }
}

function handleSortChange(value: string) {
    if (!value) return
    const [field, order] = value.split('_')
    list.setSort(field, order === 'asc' ? 'asc' : 'desc')
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
    state.error = {}
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
