<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.coupons.coupons') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.coupons.coupons') }}</template>

            <div class="p-1">
                <ModulesSuperadminPageHeader :title="$t('superadmin.coupons.coupons')">
                    <template #actions>
                        <button @click="navigateTo('/superadmin/coupons/new')"
                            class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors bg-tertiary">
                            <Icon name="ph:plus" class="w-4 h-4" />
                            {{ $t('superadmin.coupons.newCoupon') }}
                        </button>
                    </template>
                </ModulesSuperadminPageHeader>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <ModulesSuperadminDataTable :columns="columns" :rows="state.coupons?.data ?? []" rowKey="uuid"
                    :loading="state.isTableLoading" :error="state.loadError" :meta="meta"
                    :sort="list.state.sort" :order="list.state.order"
                    v-model:search="list.searchInput.value" :searchPlaceholder="$t('search') + '...'"
                    :filtered="list.isFiltered.value" clickable
                    emptyIcon="ph:ticket" :emptyTitle="$t('superadmin.coupons.noCouponsFound')"
                    :exportName="$t('superadmin.coupons.coupons')" :exportPage="exportPage"
                    :exportColumns="exportColumns"
                    @sort="list.toggleSort" @page="list.setPage" @reset="list.reset" @retry="list.reload"
                    @row-click="(coupon) => navigateTo(`/superadmin/coupons/${coupon.uuid}/edit`)">
                    <template #cell-name="{ row: coupon }">
                        <span class="font-mono font-semibold text-tertiary">{{ coupon?.code }}</span>
                    </template>
                    <template #cell-type="{ row: coupon }">
                        <span v-if="coupon?.type === 'deal'" class="co-badge co-badge-green">
                            {{ $t('superadmin.coupons.table.type.deal') }}
                        </span>
                        <span v-else class="co-badge co-badge-navy">
                            {{ $t('superadmin.coupons.table.type.addOn') }}
                        </span>
                        <p v-if="coupon?.description" class="text-[11px] text-ink-muted mt-0.5">
                            {{ coupon.description }}
                        </p>
                    </template>
                    <template #cell-amount="{ row: coupon }">
                        <span class="font-semibold text-ink tabular-nums">
                            <template v-if="coupon?.unit === 'amount'">{{ formatAmount(coupon?.amount, 'DKK') }}</template>
                            <template v-else-if="coupon?.unit === 'percentage'">{{ coupon?.amount }}%</template>
                        </span>
                    </template>
                    <template #cell-unit="{ row: coupon }">
                        {{ unitLabel(coupon) }}
                    </template>
                    <template #cell-expiration="{ row: coupon }">
                        {{ coupon?.expiration ? formatDateToReadable(coupon.expiration) : '—' }}
                    </template>
                    <template #cell-is_active="{ row: coupon }">
                        <ModulesSuperadminStatusPill v-if="coupon?.is_active" variant="success">
                            {{ $t('superadmin.coupons.table.active') }}
                        </ModulesSuperadminStatusPill>
                        <ModulesSuperadminStatusPill v-else variant="neutral">
                            {{ $t('superadmin.coupons.table.inactive') }}
                        </ModulesSuperadminStatusPill>
                    </template>
                    <template #cell-actions="{ row: coupon }">
                        <div
                            class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            <SuperadminTableButton
                                @click="navigateTo(`/superadmin/coupons/${coupon.uuid}/edit`)">
                                <Icon name="ph:pencil-simple" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.coupons.table.actions.edit') }}
                            </SuperadminTableButton>
                            <SuperadminTableButton buttonStyle="danger" @click="deleteConfirmation(coupon)">
                                <Icon name="ph:trash" class="w-3.5 h-3.5" />
                                {{ $t('superadmin.coupons.table.actions.delete') }}
                            </SuperadminTableButton>
                        </div>
                    </template>
                </ModulesSuperadminDataTable>
            </div>

            <DialogConfirmation :isModalOpen="state.modal.isDeleteCouponOpen"
                :message="$t('superadmin.coupons.table.confirmation.deleteCouponConfirmation') + '?'"
                @close="state.modal.isDeleteCouponOpen = false" @confirm="deleteCoupon" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { couponService } from '@/components/api/superadmin/CouponService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useListQuery } from '@/composables/useListQuery'
import { apiSearchParam } from '@/composables/listQuery'
import { normalizePageMeta, responseRows, type DataTableColumn } from '@/composables/dataTable'
import type { CsvColumn } from '@/composables/csvExport'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()

const state = reactive({
    coupons: [] as any,
    error: {} as Error,
    loadError: null as string | null,
    isTableLoading: false,
    modal: {
        isDeleteCouponOpen: false
    },
    selectedCoupon: {} as any,
})

const list = useListQuery({
    defaultSort: 'id',
    defaultOrder: 'desc',
    onChange: fetchCoupons,
})

const meta = computed(() => normalizePageMeta(state.coupons))

const columns = computed<DataTableColumn[]>(() => [
    { key: 'name', label: t('superadmin.coupons.table.code'), sortable: true },
    { key: 'type', label: t('superadmin.coupons.table.description') },
    { key: 'amount', label: t('superadmin.coupons.table.amount'), sortable: true },
    { key: 'unit', label: t('superadmin.coupons.table.unit.unit'), sortable: true },
    { key: 'quantity', label: t('superadmin.coupons.table.quantity'), sortable: true },
    { key: 'expiration', label: t('superadmin.coupons.table.expiration'), sortable: true },
    { key: 'is_active', label: t('superadmin.coupons.table.status'), sortable: true },
    { key: 'actions', label: '', align: 'right' },
])

function unitLabel(coupon: any) {
    if (coupon?.unit === 'amount') return t('superadmin.coupons.table.unit.amount')
    if (coupon?.unit === 'percentage') return t('superadmin.coupons.table.unit.percentage')
    return ''
}

const exportColumns = computed<CsvColumn[]>(() => [
    { label: t('superadmin.coupons.table.code'), value: c => c?.code },
    { label: t('superadmin.coupons.table.description'), value: c => [
        c?.type === 'deal' ? t('superadmin.coupons.table.type.deal') : t('superadmin.coupons.table.type.addOn'),
        c?.description,
    ].filter(Boolean).join(' - ') },
    { label: t('superadmin.coupons.table.amount'), value: c => c?.amount, type: 'number' },
    { label: t('superadmin.coupons.table.unit.unit'), value: unitLabel },
    { label: t('superadmin.coupons.table.quantity'), value: c => c?.quantity, type: 'number' },
    { label: t('superadmin.coupons.table.expiration'), value: c => c?.expiration, type: 'date' },
    { label: t('superadmin.coupons.table.status'), value: c => t(c?.is_active ? 'superadmin.coupons.table.active' : 'superadmin.coupons.table.inactive') },
])

function listParams(page: number) {
    const params: any = { page, ...list.apiSort() }
    const search = apiSearchParam(list.state.search)
    if (search) params.search = search
    return params
}

let requestSeq = 0

async function fetchCoupons() {
    const seq = ++requestSeq
    state.loadError = null
    state.isTableLoading = true
    try {
        const response = await couponService.getCoupons(listParams(list.state.page))
        if (seq !== requestSeq) return
        if (response) state.coupons = response
    } catch (error: any) {
        if (seq !== requestSeq) return
        state.loadError = error?.message || t('superadmin.dataTable.errorTitle')
    }
    if (seq === requestSeq) state.isTableLoading = false
}

async function exportPage(page: number) {
    const response = await couponService.getCoupons(listParams(page))
    const pageMeta = normalizePageMeta(response)
    return { rows: responseRows(response), lastPage: pageMeta?.lastPage ?? 1, total: pageMeta?.total ?? 0 }
}

function deleteConfirmation(coupon: any) {
    state.selectedCoupon = coupon
    state.modal.isDeleteCouponOpen = true
}

async function deleteCoupon() {
    state.error = {}
    try {
        const response = await couponService.deleteCoupon(state.selectedCoupon?.uuid)
        if (response) {
            fetchCoupons()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.coupons.table.alert.couponSuccessfullyDeleted')}.`)
        }
    } catch (error: any) { state.error = error }
}
</script>
