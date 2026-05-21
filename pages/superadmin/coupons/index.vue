<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.coupons.coupons') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #header>{{ $t('superadmin.coupons.coupons') }}</template>

            <div class="p-1">
                <div class="flex items-center justify-between mb-5">
                    <div>
                        <h1 class="text-[22px] font-semibold text-[#1F2533]">
                            {{ $t('superadmin.coupons.coupons') }}
                        </h1>
                    </div>
                    <button @click="navigateTo('/superadmin/coupons/new')"
                        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors"
                        style="background:#205E77">
                        <Icon name="ph:plus" class="w-4 h-4" />
                        {{ $t('superadmin.coupons.newCoupon') }}
                    </button>
                </div>

                <div class="flex flex-wrap items-center gap-3 mb-4">
                    <SuperadminTableSearch v-model="searchQuery" :placeholder="$t('search') + '...'"
                        @input="debouncedSearch" />
                </div>

                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <SuperadminTable :columnHeaders="state.columnHeaders" :data="state.coupons"
                    :isLoading="state.isTableLoading" :sortData="state.sortData"
                    :emptyMessage="$t('superadmin.coupons.noCouponsFound')" emptyIcon="ph:ticket" rowKey="uuid"
                    @sort="handleSort">
                    <template #body>
                        <tr v-for="(coupon, index) in state.coupons?.data" :key="index"
                            class="border-b border-[#F5F6F8] hover:bg-[#F9FAFB] transition-colors group">
                            <td class="co-td font-mono text-[13px] font-semibold text-[#205E77]">
                                {{ coupon?.code }}
                            </td>
                            <td class="co-td">
                                <span v-if="coupon?.type === 'deal'" class="co-badge co-badge-green">
                                    {{ $t('superadmin.coupons.table.type.deal') }}
                                </span>
                                <span v-else class="co-badge co-badge-navy">
                                    {{ $t('superadmin.coupons.table.type.addOn') }}
                                </span>
                                <p v-if="coupon?.description" class="text-[11px] text-[#8891A4] mt-0.5">
                                    {{ coupon.description }}
                                </p>
                            </td>
                            <td class="co-td text-[13px] font-semibold text-[#1F2533]">
                                <span v-if="coupon?.unit === 'amount'">{{ formatAmount(coupon?.amount) }}</span>
                                <span v-else-if="coupon?.unit === 'percentage'">{{ coupon?.amount }}%</span>
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                <span v-if="coupon?.unit === 'amount'">
                                    {{ $t('superadmin.coupons.table.unit.amount') }}
                                </span>
                                <span v-else-if="coupon?.unit === 'percentage'">
                                    {{ $t('superadmin.coupons.table.unit.percentage') }}
                                </span>
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ coupon?.quantity ?? '—' }}
                            </td>
                            <td class="co-td text-[13px] text-[#5C6478]">
                                {{ coupon?.expiration ? formatDateToReadable(coupon.expiration) : '—' }}
                            </td>
                            <td class="co-td">
                                <span v-if="coupon?.is_active" class="co-badge co-badge-green">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#2E9E33]"></span>
                                    {{ $t('superadmin.coupons.table.active') }}
                                </span>
                                <span v-else class="co-badge co-badge-gray">
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#8891A4]"></span>
                                    {{ $t('superadmin.coupons.table.inactive') }}
                                </span>
                            </td>
                            <td class="co-td" @click.stop>
                                <div
                                    class="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
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
                            </td>
                        </tr>
                    </template>
                </SuperadminTable>

                <Pagination :data="state.coupons" @previous="previous" @next="next" />
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
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()

let currentTablePage = 1
let searchTimeout: any = null
const searchQuery = ref('')

const state = reactive({
    columnHeaders: computed(() => [
        { key: 'name', name: t('superadmin.coupons.table.code'), sorter: true },
        { key: 'type', name: t('superadmin.coupons.table.description') },
        { key: 'amount', name: t('superadmin.coupons.table.amount'), sorter: true },
        { key: 'unit', name: t('superadmin.coupons.table.unit.unit'), sorter: true },
        { key: 'quantity', name: t('superadmin.coupons.table.quantity'), sorter: true },
        { key: 'expiration', name: t('superadmin.coupons.table.expiration'), sorter: true },
        { key: 'is_active', name: t('superadmin.coupons.table.status'), sorter: true },
        { key: 'actions', name: '' },
    ]),
    coupons: [] as any,
    dataFilter: {
        search: ''
    } as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteCouponOpen: false
    },
    selectedCoupon: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCoupons()
})

async function fetchCoupons() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await couponService.getCoupons(params)
        if (response) state.coupons = response
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}

function debouncedSearch() {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        state.dataFilter.search = Array(searchQuery.value.trim().split(/\s+/))
        currentTablePage = 1
        fetchCoupons()
    }, 350)
}

function handleSort({ sort, column }: { sort: string | null; column: string | null }) {
    state.sortData.sortField = column ?? 'id'
    state.sortData.sortOrder = sort ?? 'descend'
    currentTablePage = 1
    fetchCoupons()
}

function previous() {
    currentTablePage--
    fetchCoupons()
}

function next() {
    currentTablePage++
    fetchCoupons()
}

function deleteConfirmation(coupon: any) {
    state.selectedCoupon = coupon
    state.modal.isDeleteCouponOpen = true
}

async function deleteCoupon() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await couponService.deleteCoupon(state.selectedCoupon?.uuid)
        if (response) {
            fetchCoupons()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.coupons.table.alert.couponSuccessfullyDeleted')}.`)
        }
    } catch (error: any) { state.error = error }
    state.isTableLoading = false
}
</script>
