<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.logs') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.logs') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div class="space-y-5">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.logs" :isLoading="state.isTableLoading"
                            :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.logs?.data?.length === 0))">
                                <tr v-for="(log, index) in state.logs?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ formatDateToReadable(log?.created_at) }}</span>
                                    </td>
                                    <td width="50%">
                                        <span></span>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.logs" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
// import { citizenLogService } from '@/components/api/CitizenLogService'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'logs.table.createdAt', sorter: true, key: 'created_at' },
        { name: '' },
    ],
    dataFilter: [],
    error: [],
    isTableLoading: false,
    logs: [],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    // fetchCitizenLogs()
})

async function fetchCitizenLogs() {
    // state.isTableLoading = true
    // state.error = []
    // try {
    //     const params = {
    //         page: currentTablePage,
    //         sortField: state.sortData.sortField,
    //         sortOrder: state.sortData.sortOrder,
    //         ...state.dataFilter,
    //     }
    //     const response = await citizenLogService.getCitizenLogs(citizenUuid, params)
    //     if (response) {
    //         state.logs = response
    //     }
    // } catch (error: any) {
    //     state.error = error
    // }
    // state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCitizenLogs()
}

function next() {
    currentTablePage++
    fetchCitizenLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCitizenLogs()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchCitizenLogs()
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('DD MMM, YYYY')
}
</script>