<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ state.selectedProtocol?.data?.name ?? '' }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>
                {{ $t('citizens.attendance.protocol') + ': ' + (state.selectedProtocol?.data?.name ?? '') }}
            </template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer"
                    :to="`/citizens/${citizenUuid}/attendance`">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div>
                    <div class="mt-8 space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="flex justify-between flex-col-reverse md:flex-row md:items-center gap-3">
                            <div class="w-48 flex items-center gap-2">
                                {{ $t('show') }}:
                                <FormSelect id="page_limit" name="page_limit" :options="state.options.page_limit"
                                    v-model="state.page_limit" />
                            </div>
                            <div class="flex gap-x-2">
                                <Badge type="primary" class="w-fit">
                                    {{ $t('protocols.table.status.attended') }}:
                                    {{ state.citizenProtocolsCount?.data?.attended ?? 0 }}
                                </Badge>
                                <Badge type="inactive" class="w-fit">
                                    {{ $t('protocols.table.status.absent') }}:
                                    {{ state.citizenProtocolsCount?.data?.absent ?? 0 }}
                                </Badge>
                            </div>
                        </div>
                        <TableSearch @search="handleSearch" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.citizenProtocols"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.citizenProtocols?.data?.length === 0))">
                                    <tr v-for="(citizenProtocol, index) in state.citizenProtocols?.data" :key="index">
                                        <td width="50%">
                                            <span>{{ formatDateToReadable(citizenProtocol?.date) }}</span>
                                        </td>
                                        <td width="50%">
                                            <Badge
                                                :type="citizenProtocol?.status === 'attended' ? 'primary' : 'inactive'"
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
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.citizenProtocols" @previous="previous" @next="next" />
                    </div>
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isRemoveCitizenOpen"
                :message="$t('citizens.citizenJournals.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isRemoveCitizenOpen = false" @confirm="removeCitizen" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenProtocolService } from '@/components/api/CitizenProtocolService'
import { protocolService } from '@/components/api/ProtocolService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const citizenProtocolUuid = router?.currentRoute?.value?.params?.citizen_protocol_uuid
let currentTablePage = 1

const state = reactive({
    citizenProtocols: [] as any,
    citizenProtocolsCount: [] as any,
    columnFilter: [
        { column: 'status' },
    ],
    columnHeaders: [
        { name: 'protocols.table.citizens.date', sorter: true, key: 'date' },
        { name: 'protocols.table.citizens.status', sorter: true, key: 'status' },
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
    options: {
        page_limit: [
            { value: 20, label: "20" },
            { value: 50, label: "50" },
            { value: 100, label: "100" },
            { value: 'all', label: "All" },
        ]
    },
    page_limit: 20,
    selectedCitizenProtocol: [] as any,
    selectedProtocol: [] as any,
    searchFilter: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProtocol()
    fetchCitizenProtocolsCount()
    fetchCitizenProtocols()
})

watch(() => state.page_limit, (newValue: any) => {
    if (newValue != null) {
        fetchCitizenProtocols()
    }
})
async function fetchProtocol() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await protocolService.getProtocol(citizenProtocolUuid)
        if (response) {
            state.selectedProtocol = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchCitizenProtocolsCount() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await protocolService.getCitizenProtocolsCount(citizenUuid)
        if (response) {
            state.citizenProtocolsCount = response
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
            protocol_uuid: citizenProtocolUuid,
            page: currentTablePage,
            page_limit: state.page_limit,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await protocolService.getCitizenProtocolsByCitizen(citizenUuid, params)
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
</script>