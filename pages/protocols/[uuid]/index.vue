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
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <TableSearch @search="handleSearch" />
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.citizenProtocols"
                        :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.citizenProtocols?.data?.length === 0))">
                            <tr v-for="(citizenProtocol, index) in state.citizenProtocols?.data" :key="index">
                                <td width="25%">
                                    <span>{{ formatDateToReadable(citizenProtocol?.date) }}</span>
                                </td>
                                <td width="25%">
                                    <span>
                                        {{ citizenProtocol?.citizen?.firstname }}
                                        {{ citizenProtocol?.citizen?.lastname }}
                                    </span>
                                </td>
                                <td width="25%">
                                    <Badge :type="citizenProtocol?.status === 'attended' ? 'primary' : 'inactive'"
                                        class="w-fit" v-if="citizenProtocol?.status">
                                        <p class="text-xs">
                                            <span v-if="citizenProtocol?.status === 'attended'">
                                                {{ $t('protocols.table.status.attended') }}
                                            </span>
                                            <span v-if="citizenProtocol?.status === 'absent'">
                                                {{ $t('protocols.table.status.absent') }}
                                            </span>
                                        </p>
                                    </Badge>
                                    <span v-else>-</span>
                                </td>
                                <td width="25%">
                                    <div class="flex items-center gap-2">
                                        <Tooltip :text="$t('protocols.table.actions.markCitizenAsAttended')"
                                            @click="markAsPresent(citizenProtocol?.uuid)"
                                            v-if="disableIfFutureDate(citizenProtocol)">
                                            <FormButton type="button" buttonStyle="primary" class="rounded-md">
                                                <Icon name="material-symbols:event-available-outline" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('protocols.table.actions.markCitizenAsAbent')"
                                            @click="markAsAbsent(citizenProtocol?.uuid)"
                                            v-if="disableIfFutureDate(citizenProtocol)">
                                            <FormButton type="button" buttonStyle="warning" class="rounded-md">
                                                <Icon name="material-symbols:event-busy-outline" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('protocols.table.actions.removeCitizenForThisDate')"
                                            @click="confirmRemoving(citizenProtocol)">
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md">
                                                <Icon name="ph:trash" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.citizenProtocols" @previous="previous" @next="next" />
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isRemoveCitizenOpen"
                :message="$t('citizens.citizenJournals.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isRemoveCitizenOpen = false" @confirm="removeCitizen" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenProtocolService } from '@/components/api/CitizenProtocolService'
import { protocolService } from '@/components/api/ProtocolService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const uuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    citizenProtocols: [] as any,
    columnFilter: [
        { column: 'citizen' },
        { column: 'status' },
    ],
    columnHeaders: [
        { name: 'protocols.table.citizens.date', sorter: true, key: 'date' },
        { name: 'protocols.table.citizens.citizen' },
        { name: 'protocols.table.citizens.status', sorter: true, key: 'status' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    modal: {
        isRemoveCitizenOpen: false
    },
    selectedCitizenProtocol: [] as any,
    selectedProtocol: [] as any,
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
    state.error = {}
    state.isPageLoading = true
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
    state.error = {}
    state.isTableLoading = true
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value
    fetchCitizenProtocols()
}

async function markAsAbsent(citizenProtocolUuid: string) {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            status: 'absent',
        }
        const response = await citizenProtocolService.updateCitizenProtocol(citizenProtocolUuid, params)
        if (response?.data) {
            fetchCitizenProtocols()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function markAsPresent(citizenProtocolUuid: string) {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            status: 'attended',
        }
        const response = await citizenProtocolService.updateCitizenProtocol(citizenProtocolUuid, params)
        if (response?.data) {
            fetchCitizenProtocols()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmRemoving(citizenProtocol: any) {
    state.selectedCitizenProtocol = citizenProtocol
    state.modal.isRemoveCitizenOpen = true
}

async function removeCitizen() {
    state.error = {}
    state.isTableLoading = true
    try {
        const citizenProtocolUuid = state.selectedCitizenProtocol?.uuid
        const response = await citizenProtocolService.deleteCitizenProtocol(citizenProtocolUuid)
        if (response) {
            fetchCitizenProtocols()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function disableIfFutureDate(citizenProtocol: any) {
    return moment() > moment(citizenProtocol?.date)
}
</script>