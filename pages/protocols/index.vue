<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('protocols.protocols') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('protocols.protocols') }}</template>

            <div>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/protocols/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('protocols.newProtocol') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="grid grid-cols-1 md:grid-cols-11 gap-3">
                        <div class="space-y-1 col-span-1 md:col-span-3">
                            <FormLabel for="start_date" :label="$t('protocols.form.startDate')" />
                            <FormDateField id="start_date" name="start_date"
                                :placeholder="$t('protocols.table.startDate')"
                                v-model="state.searchFilter.start_date" />
                        </div>
                        <div class="space-y-1 col-span-1 md:col-span-3">
                            <FormLabel for="end_date" :label="$t('protocols.form.endDate')" />
                            <FormDateField id="end_date" name="end_date" :placeholder="$t('protocols.table.endDate')"
                                v-model="state.searchFilter.end_date" />
                        </div>
                        <div class="space-y-1 col-span-1 md:col-span-3">
                            <FormLabel for="citizens" :label="$t('protocols.form.citizens')" />
                            <FormSelectMultiple id="citizens" name="citizens" :options="state.citizenOptions"
                                v-model="state.searchFilter.citizens" />
                        </div>
                        <div class="space-y-1 flex items-end col-span-1 md:col-span-2">
                            <FormButton type="button" buttonStyle="primary" class="w-full rounded-md"
                                @click="handleFilter">
                                {{ $t('search') }}
                            </FormButton>
                        </div>
                    </div>
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
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/protocols/${protocol.uuid}`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('protocols.table.actions.view') }}
                                            </FormButton>
                                            <!-- <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/protocols/${protocol.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('protocols.table.actions.edit') }}
                                            </FormButton> -->
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
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenService } from '@/components/api/CitizenService'
import { protocolService } from '@/components/api/ProtocolService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
let currentTablePage = 1

const state = reactive({
    citizenOptions: [],
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'protocols.table.protocolName', sorter: true, key: 'name' },
        { name: 'protocols.table.startDate', sorter: true, key: 'start_date' },
        { name: 'protocols.table.endDate', sorter: true, key: 'end_date' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    protocols: [] as any,
    searchFilter: {
        'end_date': '',
        'start_date': '',
        'citizens': [],
    },
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProtocols()
    fetchAllCitizens()
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
            date: {
                end_date: state.searchFilter.end_date,
                start_date: state.searchFilter.start_date,
            },
            ...(state.searchFilter.citizens.length > 0 && { citizen_ids: Array(state.searchFilter.citizens) }),
        }
        const response = await protocolService.getProtocols(params)
        if (response) {
            state.protocols = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function fetchAllCitizens() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await citizenService.getAllCitizens()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (citizen: any) => options.push({
                    value: citizen?.id,
                    label: citizen?.firstname + " " + citizen?.lastname,
                })
            )
            state.citizenOptions = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
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
    state.dataFilter.search = value
    fetchProtocols()
}

function handleFilter() {
    currentTablePage = 1
    fetchProtocols()
}
</script>