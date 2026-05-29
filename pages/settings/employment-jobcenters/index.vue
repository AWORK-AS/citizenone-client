<template>
    <div>
        <NuxtLayout name="user">
            <Head>
                <Title>{{ $t('employment.jobcenters.jobcenters') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>
            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>
            <template #header>{{ $t('employment.jobcenters.jobcenters') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/employment-jobcenters/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('employment.jobcenters.addNewJobcenter') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.jobcenters"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.jobcenters?.data?.length === 0))">
                                <tr v-for="(jobcenter, index) in state.jobcenters?.data" :key="index">
                                    <td width="25%"><span>{{ jobcenter?.name }}</span></td>
                                    <td width="25%"><span>{{ jobcenter?.municipality }}</span></td>
                                    <td width="20%"><span>{{ jobcenter?.contact_person }}</span></td>
                                    <td width="10%"><span>{{ jobcenter?.sort_order }}</span></td>
                                    <td width="10%"><span>{{ jobcenter?.is_active ? $t('yes') : $t('no') }}</span></td>
                                    <td width="10%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/employment-jobcenters/${jobcenter.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('employment.jobcenters.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteJobcenterConfirmation(jobcenter)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('employment.jobcenters.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.jobcenters" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteOpen"
                :message="$t('employment.jobcenters.table.confirmation.deleteJobcenterConfirmation')"
                @close="state.modal.isDeleteOpen = false" @confirm="deleteJobcenter" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { employmentJobcenterService } from '@/components/api/user/EmploymentService'
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
    { name: 'employment.jobcenters.jobcenters', translate: true, href: '/settings/employment-jobcenters' },
]

const state = reactive({
    jobcenters: [] as any,
    columnHeaders: [
        { name: 'employment.jobcenters.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'employment.jobcenters.table.municipality', isTranslateName: true, sorter: true, key: 'municipality' },
        { name: 'employment.jobcenters.table.contactPerson', isTranslateName: true, sorter: false, key: 'contact_person' },
        { name: 'employment.jobcenters.table.sortOrder', isTranslateName: true, sorter: true, key: 'sort_order' },
        { name: 'employment.jobcenters.table.active', isTranslateName: true, sorter: false, key: 'is_active' },
        { name: '' },
    ],
    dataFilter: { search: '' },
    error: {} as Error,
    isTableLoading: false,
    modal: { isDeleteOpen: false },
    selectedJobcenter: {} as any,
    sortData: { sortField: 'sort_order', sortOrder: 'ascend' },
})

onMounted(() => {
    if (userStore.getUser?.company?.industry?.system_name !== 'employment_services') {
        navigateTo('/settings/expense-categories')
        return
    }
    fetchJobcenters()
})

async function fetchJobcenters() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentJobcenterService.getJobcenters({
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        })
        if (response) state.jobcenters = response
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() { currentTablePage--; fetchJobcenters() }
function next() { currentTablePage++; fetchJobcenters() }

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = { sortField: sortingData.column, sortOrder: sortingData.sort }
    fetchJobcenters()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchJobcenters()
}

function deleteJobcenterConfirmation(jobcenter: any) {
    state.selectedJobcenter = jobcenter
    state.modal.isDeleteOpen = true
}

async function deleteJobcenter() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await employmentJobcenterService.deleteJobcenter(state.selectedJobcenter.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchJobcenters()
            successAlert(`${t('alert.success')}!`, `${t('employment.jobcenters.table.alert.jobcenterSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
