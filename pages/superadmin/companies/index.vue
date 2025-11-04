<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.companies') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.companies') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5 gap-2">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isImportCompanyOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.companies.importCompanies.importCompanies') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/superadmin/companies/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('superadmin.companies.newCompany') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.companies"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.companies?.data?.length === 0))">
                                <tr v-for="(company, index) in state.companies?.data" :key="index">
                                    <td width="10%">
                                        <span>74312{{ company?.id }}</span>
                                    </td>
                                    <td width="15%">
                                        <p>{{ company?.name }}</p>
                                    </td>
                                    <td width="15%">
                                        <p>
                                            {{ company?.phone }}
                                        </p>
                                    </td>
                                    <td width="10%">
                                        <span>{{ company?.cvr }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ company?.website }}</span>
                                    </td>
                                    <td width="20%">
                                        <Badge type="primary" class="w-fit" v-if="company?.is_active">
                                            {{ $t('superadmin.companies.table.active') }}
                                        </Badge>
                                        <Badge type="inactive" class="w-fit" v-else>
                                            {{ $t('superadmin.companies.table.inactive') }}
                                        </Badge>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/companies/${company.uuid}/accounts`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('superadmin.companies.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/superadmin/companies/${company.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('superadmin.companies.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button"
                                                :buttonStyle="company.is_active ? 'danger' : 'success'"
                                                class="rounded-md" @click="activateDeactivateCompany(index, company)">
                                                <Icon name="ph:x" class="size-4" v-if="company.is_active" />
                                                <Icon name="ph:check" class="size-4" v-else />
                                                {{ company.is_active ?
                                                    $t('superadmin.companies.table.actions.deactivate') :
                                                    $t('superadmin.companies.table.actions.activate') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.companies" @previous="previous" @next="next" />
                </div>
            </div>
            <ModulesSuperadminCompanyModalImport :isModalOpen="state.modal.isImportCompanyOpen"
                @close="state.modal.isImportCompanyOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const paying = router?.currentRoute?.value?.query?.paying
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    companies: [] as any,
    columnFilter: [
        { column: 'name' },
        { column: 'cvr' },
        { column: 'website' },
        { column: '' },
    ],
    columnHeaders: [
        { name: 'superadmin.companies.table.id', sorter: true, key: 'id' },
        { name: 'superadmin.companies.table.name', sorter: true, key: 'name' },
        { name: 'superadmin.companies.table.phone', sorter: true, key: 'phone' },
        { name: 'superadmin.companies.table.cvr', sorter: true, key: 'cvr' },
        { name: 'superadmin.companies.table.website', sorter: true, key: 'website' },
        { name: 'superadmin.companies.table.status' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isImportCompanyOpen: false,
    },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCompanies()
})

async function fetchCompanies() {
    state.error = {}
    state.isTableLoading = true
    try {
        let params = {}
        if (paying) {
            params = {
                paying: paying,
                page: currentTablePage,
                sortField: state.sortData.sortField,
                sortOrder: state.sortData.sortOrder,
                ...state.dataFilter
            }
        } else {
            params = {
                page: currentTablePage,
                sortField: state.sortData.sortField,
                sortOrder: state.sortData.sortOrder,
                ...state.dataFilter
            }
        }
        const response = await companyService.getCompanies(params)
        if (response) {
            state.companies = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCompanies()
}

function next() {
    currentTablePage++
    fetchCompanies()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCompanies()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCompanies()
}

async function activateDeactivateCompany(index: number, company: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            is_active: !company.is_active,
        }
        const response = await companyService.activateDeactiveCompany(company.uuid, params)
        if (response) {
            state.companies.data[index].is_active = response?.data?.is_active
            if (response?.data?.is_active) {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.companySuccessfullyActivated')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.form.alert.companySuccessfullyDeactivated')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>