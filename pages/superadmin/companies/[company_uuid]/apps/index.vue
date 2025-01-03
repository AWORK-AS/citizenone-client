<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.companies.companyApps.companyApps') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #header>{{ $t('superadmin.companies.companyApps.companyApps') }}</template>

            <div>
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    to="/superadmin/companies">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesSuperadminCompanyTab />

                <div class="mt-10 space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.companyApps"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.companyApps?.data?.length === 0))">
                                <tr v-for="(companyApp, index) in state.companyApps?.data" :key="index">
                                    <td width="40%">
                                        <span>{{ companyApp?.deal?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <Badge type="primary" class="w-fit" v-if="companyApp?.is_active">
                                            {{ $t('superadmin.companies.companyApps.table.active') }}
                                        </Badge>
                                        <Badge type="inactive" class="w-fit" v-else>
                                            {{ $t('superadmin.companies.companyApps.table.inactive') }}
                                        </Badge>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button"
                                                :buttonStyle="companyApp.is_active ? 'warning' : 'success'"
                                                class="rounded-md"
                                                @click="activateDeactivateCompanyApp(index, companyApp)">
                                                <Icon name="ph:x" class="size-4" v-if="companyApp.is_active" />
                                                <Icon name="ph:check" class="size-4" v-else />
                                                {{ companyApp.is_active ?
                                                    $t('superadmin.companies.companyApps.table.actions.deactivate') :
                                                    $t('superadmin.companies.companyApps.table.actions.activate') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.companyApps" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { companyService } from '@/components/api/superadmin/CompanyService'
import { appService } from '@/components/api/superadmin/AppService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const companyUuid = router?.currentRoute?.value?.params?.company_uuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
        { column: '' },
    ],
    columnHeaders: [
        { name: 'superadmin.companies.companyApps.table.name', sorter: true, key: 'name' },
        { name: 'superadmin.companies.companyApps.table.status' },
        { name: '' },
    ],
    companyApps: [] as any,
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchCompanyApps()
})

async function fetchCompanyApps() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await companyService.getCompanyApps(companyUuid, params)
        if (response) {
            state.companyApps = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCompanyApps()
}

function next() {
    currentTablePage++
    fetchCompanyApps()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCompanyApps()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCompanyApps()
}

async function activateDeactivateCompanyApp(index: number, companyApp: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            is_active: !companyApp.is_active,
        }
        const response = await appService.activateDeactiveApp(companyApp.uuid, params)
        if (response) {
            state.companyApps.data[index].is_active = response?.data?.is_active
            if (response?.data?.is_active) {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.companyApps.alert.appSuccessfullyActivated')}.`)
            } else {
                successAlert(`${t('alert.success')}!`, `${t('superadmin.companies.companyApps.alert.appSuccessfullyDeactivated')}.`)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>