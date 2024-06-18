<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ state.selectedProtocol?.data?.name }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ state.selectedProtocol?.data?.name }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/protocols">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>
                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                    @handleFilter="handleFilter" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.citizenProtocols"
                        :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.citizenProtocols?.data?.length === 0))">
                            <tr v-for="(citizenProtocol, index) in state.citizenProtocols?.data" :key="index">
                                <td width="25%">
                                    <span>{{ formatDateToReadable(citizenProtocol?.date) }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ citizenProtocol?.citizen }}</span>
                                </td>
                                <td width="25%">
                                    <span>{{ citizenProtocol?.status }}</span>
                                </td>
                                <td width="25%">
                                    <div class="flex items-end gap-2">
                                        <FormButton type="button" buttonStyle="action" class="rounded-md">
                                            <Icon name="material-symbols:event-available-outline" class="size-4" />
                                            {{ $t('protocols.table.actions.markCitizenAsAttended') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="action" class="rounded-md">
                                            <Icon name="material-symbols:event-busy-outline" class="size-4" />
                                            {{ $t('protocols.table.actions.markCitizenAsAbent') }}
                                        </FormButton>
                                        <FormButton type="button" buttonStyle="action" class="rounded-md">
                                            <Icon name="ph:trash" class="size-4" />
                                            {{ $t('protocols.table.actions.removeCitizenForThisDate') }}
                                        </FormButton>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.citizenProtocols" @previous="previous" @next="next" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { protocolService } from '@/components/api/ProtocolService'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    citizenProtocols: [],
    columnFilter: [
        { column: 'date' },
        { column: 'name' },
        { column: 'status' },
    ],
    columnHeaders: [
        { name: 'protocols.table.citizens.date', sorter: true, key: 'date' },
        { name: 'protocols.table.citizens.citizen', sorter: true, key: 'name' },
        { name: 'protocols.table.citizens.status', sorter: true, key: 'status' },
        { name: '' },
    ],
    dataFilter: [],
    error: [],
    isPageLoading: false,
    isTableLoading: false,
    selectedProtocol: [],
    searchFilter: [],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProtocol()
    fetchCitizenProtocols()
})

async function fetchProtocol() {
    state.isPageLoading = true
    state.error = []
    try {
        const response = await protocolService.getProtocol(uuid)
        if (response) {
            state.selectedProtocol = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCitizenProtocols() {
    state.isTableLoading = true
    state.error = []
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await protocolService.getCitizenProtocols(uuid, params)
        if (response) {
            state.citizenProtocols = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCitizenProtocols()
}

function next() {
    currentTablePage++
    fetchCitizenProtocols()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCitizenProtocols()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchCitizenProtocols()
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('LL')
}
</script>