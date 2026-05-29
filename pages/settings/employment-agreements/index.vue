<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('employment.agreements.agreements') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('employment.agreements.agreements') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/employment-agreements/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employment.agreements.addNewAgreement') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.agreements"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.agreements?.data?.length === 0))">
                                <tr v-for="(agreement, index) in state.agreements?.data" :key="index">
                                    <td width="25%"><span>{{ agreement?.name }}</span></td>
                                    <td width="25%"><span>{{ agreement?.jobcenter?.name }}</span></td>
                                    <td width="15%"><span>{{ agreement?.default_duration_weeks }}</span></td>
                                    <td width="10%"><span>{{ agreement?.sort_order }}</span></td>
                                    <td width="10%"><span>{{ agreement?.is_active ? $t('yes') : $t('no') }}</span></td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/employment-agreements/${agreement.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('employment.agreements.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteAgreementConfirmation(agreement)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('employment.agreements.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.agreements" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('employment.agreements.table.confirmation.deleteAgreementConfirmation')"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteAgreement" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentAgreementService } from '@/components/api/user/EmploymentService'
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
    { name: 'employment.agreements.agreements', translate: true, href: '/settings/employment-agreements' },
]

const state = reactive({
    agreements: [] as any,
    columnHeaders: [
        { name: 'employment.agreements.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'employment.agreements.table.jobcenter', isTranslateName: true, sorter: false, key: 'jobcenter' },
        { name: 'employment.agreements.table.defaultDurationWeeks', isTranslateName: true, sorter: false, key: 'default_duration_weeks' },
        { name: 'employment.agreements.table.sortOrder', isTranslateName: true, sorter: true, key: 'sort_order' },
        { name: 'employment.agreements.table.active', isTranslateName: true, sorter: false, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: { search: '' },
    error: {} as Error,
    isTableLoading: false,
    modal: { isDeleteOpen: false },
    selectedAgreement: {} as any,
    sortData: { sortField: 'sort_order', sortOrder: 'ascend' },
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/settings/expense-categories')
        return
    }
    fetchAgreements()
})

async function fetchAgreements() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentAgreementService.getAgreements({
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        })
        if (response) state.agreements = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() { currentTablePage--; fetchAgreements() }
function next() { currentTablePage++; fetchAgreements() }

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchAgreements()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchAgreements()
}

function deleteAgreementConfirmation(agreement: any) {
    state.selectedAgreement = agreement
    state.modal.isDeleteOpen = true
}

async function deleteAgreement() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentAgreementService.deleteAgreement(state.selectedAgreement.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchAgreements()
            successAlert(`${t('alert.success')}!`, `${t('employment.agreements.table.alert.agreementSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
