<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('employment.billingRules.billingRules') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('employment.billingRules.billingRules') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/employment-billing-rules/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employment.billingRules.addNewBillingRule') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.billingRules"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.billingRules?.data?.length === 0))">
                                <tr v-for="(billingRule, index) in state.billingRules?.data" :key="index">
                                    <td width="20%">
                                        <span class="font-medium text-[#1F2533]">{{ billingRule?.name }}</span>
                                    </td>
                                    <td width="15%">
                                        <span class="co-badge co-badge-navy text-[11px]">
                                            {{ pricingTypeLabel(billingRule?.pricing_type) }}
                                        </span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ effectiveRate(billingRule) }}</span>
                                    </td>
                                    <td width="15%">
                                        <span class="font-mono text-[13px]">{{ billingRule?.customer_number || '—'
                                        }}</span>
                                    </td>
                                    <td width="15%">
                                        <span class="font-mono text-[13px]">{{ billingRule?.product_number || '—'
                                        }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ billingRule?.is_active ? $t('yes') : $t('no') }}</span>
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/employment-billing-rules/${billingRule.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('employment.billingRules.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteBillingRuleConfirmation(billingRule)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('employment.billingRules.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.billingRules" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('employment.billingRules.table.confirmation.deleteBillingRuleConfirmation')"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteBillingRule" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentService } from '@/components/api/user/EmploymentService'
import { useAmountFormatter } from '@/composables/amountFormatter'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatAmount } = useAmountFormatter()
const userStore = useUserStore()
let currentTablePage = 1

function pricingTypeLabel(type: string): string {
    const map: Record<string, string> = {
        weekly: t('employment.billingRules.form.pricingTypeOptions.weekly'),
        hourly: t('employment.billingRules.form.pricingTypeOptions.hourly'),
        bonus: t('employment.billingRules.form.pricingTypeOptions.bonus'),
    }
    return map[type] ?? type ?? '—'
}

function effectiveRate(rule: any): string {
    if (rule?.pricing_type === 'weekly' && rule?.rate != null) return formatAmount(rule.rate)
    if (rule?.pricing_type === 'hourly' && rule?.hourly_rate != null) return formatAmount(rule.hourly_rate)
    if (rule?.pricing_type === 'bonus' && rule?.bonus_amount != null) {
        const monthsLabel = rule.bonus_condition_months === 3
            ? t('employment.billingRules.form.bonusMonthOptions.three')
            : rule.bonus_condition_months === 6
                ? t('employment.billingRules.form.bonusMonthOptions.six')
                : null
        return monthsLabel ? `${formatAmount(rule.bonus_amount)} (${monthsLabel})` : formatAmount(rule.bonus_amount)
    }
    return rule?.rate != null ? formatAmount(rule.rate) : '—'
}
const breadcrumbLinks = [
    {
        name: 'employment.billingRules.billingRules',
        translate: true,
        href: '/settings/employment-billing-rules',
    },
]

const state = reactive({
    billingRules: [] as any,
    columnHeaders: [
        { name: 'employment.billingRules.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'employment.billingRules.table.pricingType', isTranslateName: true, sorter: false, key: 'pricing_type' },
        { name: 'employment.billingRules.table.rate', isTranslateName: true, sorter: false, key: 'rate' },
        { name: 'employment.billingRules.table.customerNumber', isTranslateName: true, sorter: false, key: 'customer_number' },
        { name: 'employment.billingRules.table.productNumber', isTranslateName: true, sorter: false, key: 'product_number' },
        { name: 'employment.billingRules.table.active', isTranslateName: true, sorter: false, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteOpen: false,
    },
    selectedBillingRule: {} as any,
    sortData: {
        sortField: 'name',
        sortOrder: 'ascend',
    },
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/settings/expense-categories')
        return
    }
    fetchBillingRules()
})

async function fetchBillingRules() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await employmentService.getBillingRules(params)
        if (response) {
            state.billingRules = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchBillingRules()
}

function next() {
    currentTablePage++
    fetchBillingRules()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchBillingRules()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchBillingRules()
}

function deleteBillingRuleConfirmation(billingRule: any) {
    state.selectedBillingRule = billingRule
    state.modal.isDeleteOpen = true
}

async function deleteBillingRule() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentService.deleteBillingRule(state.selectedBillingRule.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchBillingRules()
            successAlert(`${t('alert.success')}!`, `${t('employment.billingRules.table.alert.billingRuleSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
