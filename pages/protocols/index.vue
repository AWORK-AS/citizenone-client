<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('protocols.protocols') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('protocols.protocols') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

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
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="start_date" :label="$t('protocols.form.startDate')" />
                            <FormDateField id="start_date" name="start_date"
                                :placeholder="$t('protocols.table.startDate')" v-model="state.dataFilter.start_date" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="end_date" :label="$t('protocols.form.endDate')" />
                            <FormDateField id="end_date" name="end_date" :placeholder="$t('protocols.table.endDate')"
                                v-model="state.dataFilter.end_date" />
                        </div>
                        <div class="space-y-1">
                            <FormLabel for="citizens" :label="$t('protocols.form.citizens')" />
                            <FormSelectMultiple id="citizens" name="citizens" :options="state.citizenOptions"
                                v-model="state.dataFilter.citizens" />
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
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="downloadProtocol(protocol)">
                                                <Icon name="ph:download" class="size-4" />
                                                {{ $t('protocols.table.actions.download') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteProtocolConfirmation(protocol)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('protocols.table.actions.delete') }}
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
            <DialogConfirmation :isModalOpen="state.modal.isDeleteProtocolOpen"
                :message="$t('protocols.table.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteProtocolOpen = false" @confirm="deleteProtocol" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenService } from '@/components/api/user/CitizenService'
import { protocolService } from '@/components/api/user/ProtocolService'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const departmentStore = useDepartmentStore()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'protocols.protocols',
        translate: true,
        href: '/protocols',
    },
]

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
        citizens: [],
        end_date: '',
        start_date: '',
        search: '',
    },
    error: {} as Error,
    isPageLoading: false,
    isTableLoading: false,
    modal: {
        isDeleteProtocolOpen: false,
    },
    protocols: [] as any,
    selectedProtocol: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProtocols()
    fetchAllCitizens()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchProtocols()
    }
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
            department: departmentStore.getSelectedDepartmentName,
            date: {
                end_date: state.dataFilter.end_date,
                start_date: state.dataFilter.start_date,
            },
            ...(state.dataFilter.citizens.length > 0 && { citizen_ids: Array(state.dataFilter.citizens) }),
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
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchProtocols()
}

async function downloadProtocol(protocol: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const protocolUuid = protocol?.uuid
        const params = {
            department: departmentStore.getSelectedDepartmentName,
        }
        const response = await protocolService.downloadProtocol(protocolUuid, params)
        if (response) {
            saveAs(response, protocolUuid)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function deleteProtocolConfirmation(protocol: any) {
    state.selectedProtocol = protocol
    state.modal.isDeleteProtocolOpen = true
}

async function deleteProtocol() {
    state.error = {}
    state.isTableLoading = true
    try {
        const protocolUuid = state.selectedProtocol.uuid
        const response = await protocolService.deleteProtocol(protocolUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchProtocols()
            successAlert(`${t('alert.success')}!`, `${t('protocols.table.alert.protocolSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>