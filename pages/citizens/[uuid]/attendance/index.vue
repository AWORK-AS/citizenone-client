<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.attendance') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ $t('citizens.tabs.attendance') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <div>
                    <div class="mt-8 space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <TableSearch @search="handleSearch" />
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
                                            <div class="flex items-end justify-end gap-2">
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="navigateTo(`/citizens/${citizenUuid}/attendance/${protocol.uuid}`)">
                                                    <Icon name="ph:eye" class="size-4" />
                                                    {{ $t('protocols.table.actions.view') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="action"
                                                    @click="downloadProtocol(protocol)">
                                                    <Icon name="ph:download" class="size-4" />
                                                    {{ $t('protocols.table.actions.download') }}
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
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenProtocolService } from '@/components/api/user/CitizenProtocolService'
import { protocolService } from '@/components/api/user/ProtocolService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.attendance',
        translate: true,
        href: `/citizens/${citizenUuid}/attendance`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'protocols.table.protocolName', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'protocols.table.startDate', isTranslateName: true, sorter: true, key: 'start_date' },
        { name: 'protocols.table.endDate', isTranslateName: true, sorter: true, key: 'end_date' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    protocols: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProtocols()
})

async function fetchProtocols() {
    state.error = {}
    state.isTableLoading = true
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchProtocols()
}

async function downloadProtocol(protocol: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const protocolUuid = protocol?.uuid
        const params = {
            citizen_uuid: citizenUuid
        }
        const response = await citizenProtocolService.downloadCitizenProtocol(protocolUuid, params)
        if (response) {
            saveAs(response, protocolUuid)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>