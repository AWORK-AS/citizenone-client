<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.archivedCitizens') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.archivedCitizens') }}</template>

            <ModulesArchivedTab />

            <div class="mt-5">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.archivedCitizens"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.archivedCitizens?.data?.length === 0))">
                                <tr v-for="(citizen, index) in state.archivedCitizens?.data" :key="index">
                                    <td width="30%">
                                        <div class="flex items-center gap-x-2">
                                            <img :src="citizen?.image ?? `https://ui-avatars.com/api/?background=42AED9&color=fff&name=${citizen?.firstname + ' ' + citizen?.lastname}`"
                                                class="rounded-full w-11 h-11 object-cover" />
                                            <span>{{ citizen?.firstname }} {{ citizen?.lastname }}</span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <span>{{ citizen?.email }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ citizen?.phone }}</span>
                                    </td>
                                    <!-- <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/citizens/${citizen.uuid}/journals`)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizens.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/citizens/${citizen.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="showCitizenNote(citizen)">
                                                <Icon name="ph:note-blank" class="size-4" />
                                                {{ $t('citizens.table.actions.latestJournalEntry') }}
                                            </FormButton>
                                        </div>
                                    </td> -->
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.archivedCitizens" @previous="previous" @next="next" />
                </div>
            </div>

            <ModulesCitizenModalLatestJournal :isModalOpen="state.modal.showNote"
                :selectedCitizen="state.selectedCitizen" @close="state.modal.showNote = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/CitizenService'
import { useDepartmentStore } from '@/store/department'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const departmentStore = useDepartmentStore()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
        { column: 'email' },
        { column: 'phone' },
    ],
    columnHeaders: [
        { name: 'citizens.table.name', sorter: true, key: 'firstname' },
        { name: 'citizens.table.email', sorter: true, key: 'email' },
        { name: 'citizens.table.phone', sorter: true, key: 'phone' },
        // { name: '' },
    ],
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    archivedCitizens: [] as any,
    modal: {
        showNote: false,
    },
    selectedCitizen: [],
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchArchivedCitizens()
}

function showCitizenNote(citizen: any) {
    state.selectedCitizen = citizen
    state.modal.showNote = true
}
</script>