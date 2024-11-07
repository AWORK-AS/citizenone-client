<template>
    <div>
        <NuxtLayout name="superadmin">

            <Head>
                <Title>{{ $t('superadmin.orders.orders') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('superadmin.orders.orders') }}</template>

            <div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.externalData"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.externalData?.data?.length === 0))">
                                <tr v-for="(data, index) in state.externalData?.data" :key="index">
                                    <td width="20%">
                                        <div>
                                            {{ formatDateTimeToReadable(data?.created_at) }}
                                        </div>
                                    </td>
                                    <td width="10%">
                                        <div>
                                            <Badge type="primary" class="w-fit" v-if="data?.status === 'recurring'">
                                                {{ $t('superadmin.orders.table.recurring') }}
                                            </Badge>
                                            <Badge type="active" class="w-fit" v-else>
                                                {{ $t('superadmin.orders.table.new') }}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="25%">
                                        <div>
                                            {{ data?.reference_number }}
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <p class="capitalize">
                                            {{ data?.external_data_type }}
                                        </p>
                                    </td>
                                    <td width="30%">
                                        <div>
                                            <p>
                                                {{ $t('superadmin.orders.table.companyName') }}:
                                                {{ data?.user?.company?.name }}
                                            </p>
                                            <p>
                                                {{ $t('superadmin.orders.table.user') }}:
                                                {{ data?.user?.firstname + ' ' + data?.user?.lastname }}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.externalData" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { externalDataService } from '@/components/api/superadmin/ExternalDataService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'status' },
        { column: 'reference_number' },
    ],
    columnHeaders: [
        { name: 'superadmin.orders.table.date', sorter: true, key: 'created_at' },
        { name: 'superadmin.orders.table.status' },
        { name: 'superadmin.orders.table.referenceNumber', sorter: true, key: 'reference_number' },
        { name: 'superadmin.orders.table.type', sorter: true, key: 'type' },
        { name: 'superadmin.orders.table.data' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    externalData: [] as any,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchExternalData()
})

async function fetchExternalData() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await externalDataService.getExternalData(params)
        if (response) {
            state.externalData = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchExternalData()
}

function next() {
    currentTablePage++
    fetchExternalData()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchExternalData()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value
    fetchExternalData()
}
</script>