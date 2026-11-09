<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.referrals.header') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.referrals.header') }}</template>

            <!--
                "Giv en måned, få en måned": companies that signed up through a customer's share link,
                and the free months both sides earned once the new one paid. Free months are applied
                by hand, so this is also the list of months still to take off an invoice.
            -->
            <div class="p-1" data-testid="superadmin-referrals">
                <ModulesSuperadminPageHeader :title="$t('superadmin.referrals.header')"
                    :subtitle="$t('superadmin.referrals.subtitle')" />

                <Alert type="danger" :text="state.error" v-if="state.error" />

                <p class="mb-4 rounded-lg border border-warning-line bg-warning-soft px-4 py-3 text-[13px] text-warning-ink">
                    {{ $t('superadmin.referrals.manualHint') }}
                </p>

                <div class="grid grid-cols-2 gap-4 mb-5 xl:grid-cols-5">
                    <div v-for="card in cards" :key="card.key" class="bg-white border border-line rounded-xl shadow-sm px-4 py-4">
                        <p class="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">{{ card.label }}</p>
                        <p class="mt-1 text-2xl font-semibold text-ink tabular-nums">{{ state.isLoading ? '–' : card.value }}</p>
                    </div>
                </div>

                <!-- The API sends every referral at once; search, sort and paging happen here. -->
                <ModulesSuperadminDataTable :columns="columns" :rows="page.rows" rowKey="uuid"
                    :loading="state.isLoading" :error="state.loadError" :meta="page.meta"
                    :sort="list.state.sort" :order="list.state.order"
                    v-model:search="list.searchInput.value"
                    :filtered="list.isFiltered.value" :chips="chips" emptyIcon="ph:gift"
                    :emptyTitle="$t('superadmin.referrals.empty')"
                    :exportName="$t('superadmin.referrals.header')" :exportRows="() => page.all"
                    :exportColumns="exportColumns" :rowClass="() => 'align-top'"
                    @sort="list.toggleSort" @page="list.setPage" @reset="list.reset" @retry="load"
                    @remove-chip="(key) => list.setFilter(key, '')">
                    <template #filters>
                        <ModulesSuperadminDataTableSelect :modelValue="list.state.filters.status" :options="statusOptions"
                            :placeholder="$t('superadmin.referrals.allStatuses')"
                            :label="$t('superadmin.referrals.statusColumn')"
                            @update:modelValue="(status) => list.setFilter('status', status)" />
                    </template>

                    <template #cell-referrer="{ row }">
                        <NuxtLink v-if="row.referrer.uuid" :to="`/superadmin/companies/${row.referrer.uuid}/overview`" class="text-ink hover:underline">{{ row.referrer.name }}</NuxtLink>
                    </template>
                    <template #cell-referred="{ row }">
                        <NuxtLink v-if="row.referred.uuid" :to="`/superadmin/companies/${row.referred.uuid}/overview`" class="text-ink hover:underline">{{ row.referred.name }}</NuxtLink>
                    </template>
                    <template #cell-created_at="{ row }">
                        <span class="whitespace-nowrap">{{ formatDate(row.created_at) }}</span>
                    </template>
                    <template #cell-status="{ row }">
                        <ModulesSuperadminStatusPill :variant="statusVariant(row.status)"
                            :label="$t(`superadmin.referrals.status.${row.status}`)" />
                        <p v-if="row.rejection_reason" class="mt-1 text-[12px] text-ink-muted">{{ $t(`superadmin.referrals.reasons.${row.rejection_reason}`) }}</p>
                        <p v-if="row.qualifying_invoice" class="mt-1 text-[12px] text-ink-body">{{ $t('superadmin.referrals.qualifyingInvoice', { number: row.qualifying_invoice.number, amount: formatAmount(row.qualifying_invoice.total_amount) }) }}</p>
                        <p v-if="row.status === 'rewarded' && row.referrer_rewarded === false" class="mt-1 text-[12px] text-ink-muted max-w-[16rem]">{{ $t('superadmin.referrals.capped') }}</p>
                    </template>
                    <template #cell-credits="{ row }">
                        <div v-for="credit in row.credits" :key="credit.uuid" class="mb-2 last:mb-0">
                            <p class="text-ink">
                                {{ credit.company_name }} · {{ $t(`superadmin.referrals.role.${credit.role}`) }}
                            </p>
                            <p class="text-[12px] text-ink-body">
                                {{ credit.amount !== null ? $t('superadmin.referrals.amount', { amount: formatAmount(credit.amount) }) : $t('superadmin.referrals.noAmount') }}
                                · {{ $t(`superadmin.referrals.creditStatus.${credit.status}`) }}
                                <template v-if="credit.applied_note"> · {{ credit.applied_note }}</template>
                            </p>
                            <template v-if="credit.status === 'earned' && canManage">
                                <div v-if="state.settling === credit.uuid" class="mt-1 flex flex-wrap items-center gap-2">
                                    <input v-model="state.note" type="text" maxlength="255" :placeholder="$t('superadmin.referrals.notePlaceholder')"
                                        :aria-label="$t('superadmin.referrals.notePlaceholder')"
                                        class="min-w-[14rem] flex-1 rounded-lg border border-line px-2.5 py-1.5 text-[12px]" />
                                    <button type="button" class="text-[12px] font-semibold text-tertiary disabled:opacity-50" :disabled="!state.note.trim() || state.saving"
                                        @click="settle(credit.uuid)">{{ $t('superadmin.referrals.save') }}</button>
                                    <button type="button" class="text-[12px] text-ink-body" @click="state.settling = null">{{ $t('superadmin.referrals.cancel') }}</button>
                                </div>
                                <div v-else class="mt-1 flex gap-3">
                                    <button type="button" class="text-[12px] font-semibold text-tertiary" @click="startSettling(credit.uuid, 'applied')">{{ $t('superadmin.referrals.apply') }}</button>
                                    <button type="button" class="text-[12px] text-danger-ink" @click="startSettling(credit.uuid, 'void')">{{ $t('superadmin.referrals.void') }}</button>
                                </div>
                            </template>
                        </div>
                    </template>
                </ModulesSuperadminDataTable>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useI18n } from 'vue-i18n'
import { superadminCompanyReferralService } from '@/components/api/superadmin/CompanyReferralService'
import { usePermissions } from '@/composables/usePermissions'
import { REFERRAL_STATUSES } from '@/composables/referralProgram'
import { useListQuery } from '@/composables/useListQuery'
import { clientPage, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'

const runtimeConfig = useRuntimeConfig()
const { t, locale } = useI18n()
const { can } = usePermissions()

// Viewing is view_financials (the route's gate); booking a month as given is manage_financials.
const canManage = computed(() => can('manage_financials'))

const state = reactive({
    loadedStatus: null as string | null,
    loadError: null as string | null,
    summary: { referrals: 0, pending: 0, rewarded: 0, rejected: 0, credits_to_apply: 0 },
    referrals: [] as any[],
    isLoading: true,
    error: '',
    settling: null as string | null,
    settleStatus: 'applied' as 'applied' | 'void',
    note: '',
    saving: false,
})

// Status (a server filter), search, sort and page live in the URL.
const list = useListQuery({
    filters: { status: '' },
    onChange: () => {
        if (list.state.filters.status !== state.loadedStatus) load()
    },
})

const statusOptions = computed(() => REFERRAL_STATUSES.map(status => ({ value: status, label: t(`superadmin.referrals.status.${status}`) })))

const chips = computed(() => (list.state.filters.status
    ? [{ key: 'status', label: t(`superadmin.referrals.status.${list.state.filters.status}`) }]
    : []))

function statusVariant(status: string) {
    return status === 'rewarded' ? 'success' : status === 'pending' ? 'warning' : 'neutral'
}

const columns = computed<DataTableColumn[]>(() => [
    { key: 'referrer', label: t('superadmin.referrals.referrer'), sortable: true, cellClass: 'text-[13px]' },
    { key: 'referred', label: t('superadmin.referrals.referred'), sortable: true, cellClass: 'text-[13px]' },
    { key: 'created_at', label: t('superadmin.referrals.signedUp'), sortable: true },
    { key: 'status', label: t('superadmin.referrals.statusColumn'), sortable: true, cellClass: 'text-[13px]' },
    { key: 'credits', label: t('superadmin.referrals.credits'), cellClass: 'text-[13px]' },
])

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.referrals.referrer'), value: row => row.referrer?.name },
    { label: t('superadmin.referrals.referred'), value: row => row.referred?.name },
    { label: t('superadmin.referrals.signedUp'), value: row => row.created_at, type: 'date' },
    { label: t('superadmin.referrals.statusColumn'), value: row => t(`superadmin.referrals.status.${row.status}`) },
    { label: t('superadmin.referrals.credits'), value: row => (row.credits ?? []).map((credit: any) => [
        `${credit.company_name} · ${t(`superadmin.referrals.role.${credit.role}`)}`,
        credit.amount !== null ? t('superadmin.referrals.amount', { amount: formatAmount(credit.amount) }) : t('superadmin.referrals.noAmount'),
        t(`superadmin.referrals.creditStatus.${credit.status}`),
        credit.applied_note,
    ].filter(Boolean).join(' · ')).join('\n') },
])

const page = computed(() => clientPage(state.referrals, {
    search: list.state.search,
    searchText: row => [row.referrer?.name, row.referred?.name, ...(row.credits ?? []).map((c: any) => c.company_name)].join(' '),
    sort: list.state.sort,
    order: list.state.order,
    sortValue: (row, sort) => (sort === 'referrer' || sort === 'referred' ? row[sort]?.name : row[sort]),
    page: list.state.page,
    perPage: 25,
}))

const cards = computed(() => [
    { key: 'referrals', label: t('superadmin.referrals.cards.referrals'), value: state.summary.referrals },
    { key: 'pending', label: t('superadmin.referrals.cards.pending'), value: state.summary.pending },
    { key: 'rewarded', label: t('superadmin.referrals.cards.rewarded'), value: state.summary.rewarded },
    { key: 'rejected', label: t('superadmin.referrals.cards.rejected'), value: state.summary.rejected },
    { key: 'toApply', label: t('superadmin.referrals.cards.toApply'), value: state.summary.credits_to_apply },
])

function formatDate(value: string | null): string {
    if (!value) return '-'
    return moment(value).locale(locale.value === 'en' ? 'en-gb' : 'da').format('D. MMM YYYY')
}

function formatAmount(value: number): string {
    return new Intl.NumberFormat(locale.value === 'en' ? 'en-GB' : 'da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function startSettling(uuid: string, status: 'applied' | 'void') {
    state.settling = uuid
    state.settleStatus = status
    state.note = ''
}

async function settle(uuid: string) {
    state.saving = true
    state.error = ''
    try {
        await superadminCompanyReferralService.settleCredit(uuid, { status: state.settleStatus, note: state.note.trim() })
        state.settling = null
        await load()
    } catch (error: any) {
        state.error = error?.message || ''
    }
    state.saving = false
}

let requestSeq = 0

async function load() {
    const seq = ++requestSeq
    const status = list.state.filters.status
    state.loadedStatus = status
    state.loadError = null
    state.isLoading = true
    try {
        const response = await superadminCompanyReferralService.getOverview(status ? { status } : {})
        if (seq !== requestSeq) return
        state.summary = response?.data?.summary ?? state.summary
        state.referrals = response?.data?.referrals ?? []
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.loadedStatus = null
        state.loadError = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.isLoading = false
}
</script>
