<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.coupons.coupons') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.coupons.coupons') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/superadmin/coupons/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.coupons.newCoupon') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.coupons"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.coupons?.data?.length === 0))">
                                <tr v-for="(coupon, index) in state.coupons?.data" :key="index">
                                    <td width="15%">
                                        <p>{{ coupon?.code }}</p>
                                    </td>
                                    <td width="15%">
                                        <div class="w-fit">
                                            <Badge :type="coupon?.type === 'deal' ? 'active' : 'primary'">
                                                <p class="text-xxs">
                                                    <span v-if="coupon?.type === 'deal'">
                                                        {{ $t('superadmin.coupons.table.type.deal') }}
                                                    </span>
                                                    <span v-else>
                                                        {{ $t('superadmin.coupons.table.type.addOn') }}
                                                    </span>
                                                </p>
                                            </Badge>
                                        </div>
                                        <p>{{ coupon?.description }}</p>
                                    </td>
                                    <td width="10%">
                                        <p v-if="coupon?.unit === 'amount'">
                                            {{ formatAmount(coupon?.amount) }}
                                        </p>
                                        <p v-if="coupon?.unit === 'percentage'">
                                            {{ coupon?.amount }}%
                                        </p>
                                    </td>
                                    <td width="5%">
                                        <p v-if="coupon?.unit === 'amount'">
                                            {{ $t('superadmin.coupons.table.unit.amount') }}
                                        </p>
                                        <p v-if="coupon?.unit === 'percentage'">
                                            {{ $t('superadmin.coupons.table.unit.percentage') }}
                                        </p>
                                    </td>
                                    <td width="10%">
                                        <p>{{ coupon?.quantity }}</p>
                                    </td>
                                    <td width="20%">
                                        <p v-if="coupon?.expiration">{{ formatDateToReadable(coupon?.expiration) }}</p>
                                    </td>
                                    <td width="10%">
                                        <Badge type="primary" class="w-fit" v-if="coupon?.is_active">
                                            {{ $t('superadmin.coupons.table.active') }}
                                        </Badge>
                                        <Badge type="inactive" class="w-fit" v-else>
                                            {{ $t('superadmin.coupons.table.inactive') }}
                                        </Badge>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/coupons/${coupon.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('superadmin.coupons.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="primary" class="rounded-md"
                                                @click="deleteConfirmation(coupon)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('superadmin.coupons.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.coupons" @previous="previous" @next="next" />
                </div>
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
import { useI18n } from "vue-i18n"
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const { formatDateToReadable } = useDatetimeFormatter()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'superadmin.coupons.table.code', sorter: true, key: 'name' },
        { name: 'superadmin.coupons.table.description' },
        { name: 'superadmin.coupons.table.amount', sorter: true, key: 'amount' },
        { name: 'superadmin.coupons.table.unit.unit', sorter: true, key: 'unit' },
        { name: 'superadmin.coupons.table.quantity', sorter: true, key: 'quantity' },
        { name: 'superadmin.coupons.table.expiration', sorter: true, key: 'expiration' },
        { name: 'superadmin.coupons.table.status', sorter: true, key: 'is_active' },
        { name: '' },
    ],
    coupons: [] as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteCouponOpen: false
    },
    selectedCoupon: [] as any,
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
            ...state.dataFilter
        }
        const response = await couponService.getCoupons(params)
        if (response) {
            state.coupons = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCoupons()
}

function next() {
    currentTablePage++
    fetchCoupons()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCoupons()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
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
        const couponUuid = state.selectedCoupon?.uuid
        const response = await couponService.deleteCoupon(couponUuid)
        if (response) {
            fetchCoupons()
            successAlert(`${t('alert.success')}!`, `${t('superadmin.coupons.table.alert.couponSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>