<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('leads.leads') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('leads.leads') }}</template>

            <div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.leads"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.leads?.data?.length === 0))">
                                <tr v-for="(lead, index) in state.leads?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ lead?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ lead?.company }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ lead?.email }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ lead?.phone }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ lead?.message }}</span>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.leads" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { leadsService } from '@/components/api/user/LeadsService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'leads.leads',
        translate: true,
        href: '/leads',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'leads.table.name', isTranslateName: true, },
        { name: 'leads.table.company', isTranslateName: true, },
        { name: 'leads.table.email', isTranslateName: true, },
        { name: 'leads.table.phone', isTranslateName: true, },
        { name: 'leads.table.message', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    leads: [] as any,
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchleads()
})

async function fetchleads() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await leadsService.getLeads(params)
        if (response) {
            state.leads = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchleads()
}

function next() {
    currentTablePage++
    fetchleads()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchleads()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchleads()
}
</script>