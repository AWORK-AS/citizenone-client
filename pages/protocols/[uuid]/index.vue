<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ state.selectedProtocol?.data?.name }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ state.selectedProtocol?.data?.name }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="state.breadcrumbLinks" />
            </template>

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
                                            <span v-if="citizenProtocol?.absence?.name">
                                                - {{ citizenProtocol?.absence?.name }}
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
                                            @click="confirmMarkAsAbsent(citizenProtocol)"
                                            v-if="disableIfFutureDate(citizenProtocol)">
                                            <FormButton type="button" buttonStyle="warning" class="rounded-md">
                                                <Icon name="material-symbols:event-busy-outline" class="size-4" />
                                            </FormButton>
                                        </Tooltip>
                                        <Tooltip :text="$t('protocols.table.actions.removeCitizenForThisDate')"
                                            @click="confirmRemoving(citizenProtocol)">
                                            <FormButton type="button" buttonStyle="primary" class="rounded-md">
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
            <ModulesUserAbsenceModalAbsent :isModalOpen="state.modal.isMarkAsAbsentOpen"
                @close="state.modal.isMarkAsAbsentOpen = false" @markAsAbsent="markAsAbsent" />
            <DialogConfirmation :isModalOpen="state.modal.isRemoveCitizenProtocolOpen"
                :message="$t('protocols.table.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isRemoveCitizenProtocolOpen = false" @confirm="deleteCitizenProtocol" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenProtocolService } from '@/components/api/user/CitizenProtocolService'
import { protocolService } from '@/components/api/user/ProtocolService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const router = useRouter()
const protocolUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    breadcrumbLinks: [
        {
            name: 'protocols.protocols',
            translate: true,
            href: '/protocols',
        },
    ],
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
        isMarkAsAbsentOpen: false,
        isRemoveCitizenProtocolOpen: false,
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
        const response = await protocolService.getProtocol(protocolUuid)
        if (response) {
            state.selectedProtocol = response
            state.breadcrumbLinks.push({
                name: response?.data?.name ?? '',
                translate: false,
                href: `/protocols/${protocolUuid}`,
            })
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
        const response = await protocolService.getCitizenProtocols(protocolUuid, params)
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
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCitizenProtocols()
}

async function markAsAbsent(citizenProtocolDetails: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const citizenProtocolUuid = state.selectedCitizenProtocol?.uuid
        const params = {
            absence_uuid: citizenProtocolDetails.absence,
            status: 'absent',
        }
        const response = await citizenProtocolService.updateCitizenProtocol(citizenProtocolUuid, params)
        if (response?.data) {
            fetchCitizenProtocols()
            state.modal.isMarkAsAbsentOpen = false
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

function confirmMarkAsAbsent(citizenProtocol: any) {
    state.selectedCitizenProtocol = citizenProtocol
    state.modal.isMarkAsAbsentOpen = true
}

function confirmRemoving(citizenProtocol: any) {
    state.selectedCitizenProtocol = citizenProtocol
    state.modal.isRemoveCitizenProtocolOpen = true
}

async function deleteCitizenProtocol() {
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