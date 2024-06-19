<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.attendance') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.attendance') }}</template>

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
                        <Table :columnHeaders="state.columnHeaders" :data="state.protocols"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.protocols?.data?.length === 0))">
                                <tr v-for="(protocol, index) in state.protocols?.data" :key="index">
                                    <td width="25%">
                                        <span>{{ protocol?.name }}</span>
                                    </td>
                                    <td width="25%">
                                        <span>{{ formatDateToReadable(protocol?.start_date) }}</span>
                                    </td>
                                    <td width="25%">
                                        <span>{{ formatDateToReadable(protocol?.end_date) }}</span>
                                    </td>
                                    <td width="25%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/citizens/${citizenUuid}/attendance/${protocol.uuid}`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('protocols.table.actions.view') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.protocols" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { protocolService } from '@/components/api/ProtocolService'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'protocols.table.protocolName', sorter: true, key: 'name' },
        { name: 'protocols.table.startDate', sorter: true, key: 'start_date' },
        { name: 'protocols.table.endDate', sorter: true, key: 'end_date' },
        { name: '' },
    ],
    dataFilter: [],
    error: [],
    isTableLoading: false,
    protocols: [],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProtocols()
})

async function fetchProtocols() {
    state.isTableLoading = true
    state.error = []
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await protocolService.getProtocolsByCitizen(citizenUuid, params)
        if (response) {
            state.protocols = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchProtocols()
}

function next() {
    currentTablePage++
    fetchProtocols()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchProtocols()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchProtocols()
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('DD MMM, YYYY')
}
</script>