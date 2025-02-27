<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedCitizens') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('archived.tabs.archivedCitizens') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsArchiveSubTab id="archived" class="mt-5" />

            <div class="mt-10">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.archivedCitizens"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.archivedCitizens?.data?.length === 0))">
                                <tr v-for="(citizen, index) in state.archivedCitizens?.data" :key="index">
                                    <td width="20%">
                                        <p>
                                            {{ formatDateToReadable(citizen?.date_archived) }}
                                        </p>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                                                class="rounded-full w-11 h-11 object-cover" />
                                            <span>{{ citizen?.firstname }} {{ citizen?.lastname }}</span>
                                        </div>
                                    </td>
                                    <td width="25%">
                                        <span>{{ citizen?.email }}</span>
                                    </td>
                                    <td width="15%">
                                        <span>{{ citizen?.phone }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="confirmCitizenUnarchiving(citizen)">
                                                <Icon name="mdi:archive-cancel-outline" class="size-4" />
                                                {{ $t('archived.table.actions.unarchive') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.archivedCitizens" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isUnarchiveCitizenOpen"
                :message="$t('archived.confirmation.unarchiveCitizen') + '?'"
                @close="state.modal.isUnarchiveCitizenOpen = false" @confirm="unarchiveCitizen" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const departmentStore = useDepartmentStore()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'archived.tabs.archivedCitizens',
        translate: true,
        href: '/settings/archived/citizens',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'archived.table.date' },
        { name: 'citizens.table.name', sorter: true, key: 'firstname' },
        { name: 'citizens.table.email', sorter: true, key: 'email' },
        { name: 'citizens.table.phone', sorter: true, key: 'phone' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    archivedCitizens: [] as any,
    modal: {
        isUnarchiveCitizenOpen: false,
    },
    selectedCitizen: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchArchivedCitizens()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        fetchArchivedCitizens()
    }
})

async function fetchArchivedCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await citizenService.getArchivedCitizens(params)
        if (response) {
            state.archivedCitizens = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchArchivedCitizens()
}

function next() {
    currentTablePage++
    fetchArchivedCitizens()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchArchivedCitizens()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchArchivedCitizens()
}

function confirmCitizenUnarchiving(citizen: any) {
    state.selectedCitizen = citizen
    state.modal.isUnarchiveCitizenOpen = true
}

async function unarchiveCitizen() {
    state.error = {}
    state.isTableLoading = true
    try {
        const citizenUuid = state.selectedCitizen?.uuid
        const response = await citizenService.archiveUnarchiveCitizen(citizenUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('archived.alert.citizenSuccessfullyUnarchive')}.`)
            fetchArchivedCitizens()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>