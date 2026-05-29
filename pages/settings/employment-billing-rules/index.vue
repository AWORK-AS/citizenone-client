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
                            <template #body
                                v-if="!(state.isTableLoading || (state.billingRules?.data?.length === 0))">
                                <tr v-for="(billingRule, index) in state.billingRules?.data" :key="index">
                                    <td width="25%">
                                        <span>{{ billingRule?.name }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ billingRule?.rate }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ billingRule?.frequency }}</span>
                                    </td>
                                    <td width="25%">
                                        <span>{{ billingRule?.description }}</span>
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
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const userStore = useUserStore()
let currentTablePage = 1
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
        { name: 'employment.billingRules.table.rate', isTranslateName: true, sorter: false, key: 'rate' },
        { name: 'employment.billingRules.table.frequency', isTranslateName: true, sorter: false, key: 'frequency' },
        { name: 'employment.billingRules.table.description', isTranslateName: true, sorter: false, key: 'description' },
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
