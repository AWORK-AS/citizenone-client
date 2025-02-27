<template>
    <div>
        <div class="flex justify-end items-center mb-5">
            <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/procedures/new')">
                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                {{ $t('procedures.newProcedure') }}
            </FormButton>
        </div>
        <div class="space-y-5">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />
            <TableSearch @search="handleSearch" />
            <div class="table-responsive">
                <Table :columnHeaders="state.columnHeaders" :data="state.procedures" :isLoading="state.isTableLoading"
                    :sortData="state.sortData" @sort="sort">
                    <template #body v-if="!(state.isTableLoading || (state.procedures?.data?.length === 0))">
                        <tr v-for="(procedure, index) in state.procedures?.data" :key="index">
                            <td width="15%">
                                <span>{{ procedure?.title }}</span>
                            </td>
                            <td width="60%">
                                <div v-html="procedure.content" class="content"
                                    :class="expandedRecords[index] ? '' : 'line-clamp-2'" />
                                <button @click="toggleExpanded(index)"
                                    class="text-primary text-sm hover:text-primary-700">
                                    {{ expandedRecords[index] ?
                                        $t('showLess') :
                                        $t('showMore') }}
                                </button>
                            </td>
                            <td width="10%">
                                <div class="flex items-center gap-x-2">
                                    <Badge :type="procedure?.is_active ? 'active' : 'inactive'">
                                        <p class="text-xs">
                                            {{ procedure?.is_active ? $t('procedures.table.active') :
                                                $t('procedures.table.inactive') }}
                                        </p>
                                    </Badge>
                                </div>
                            </td>
                            <td width="15%">
                                <div class="flex items-end gap-2">
                                    <FormButton type="button" buttonStyle="action" class="rounded-md"
                                        @click="navigateTo(`/procedures/${procedure.uuid}`)">
                                        <Icon name="ph:eye" class="size-4" />
                                        {{ $t('procedures.table.actions.view') }}
                                    </FormButton>
                                    <FormButton type="button" buttonStyle="action" class="rounded-md"
                                        @click="seeProgress(procedure)">
                                        <Icon name="ph:eye" class="size-4" />
                                        {{ $t('procedures.table.actions.seeProgress') }}
                                    </FormButton>
                                    <FormButton type="button" buttonStyle="action" class="rounded-md"
                                        @click="navigateTo(`/procedures/${procedure.uuid}/edit`)">
                                        <Icon name="ph:pencil" class="size-4" />
                                        {{ $t('procedures.table.actions.edit') }}
                                    </FormButton>
                                </div>
                            </td>
                        </tr>
                    </template>
                </Table>
            </div>
            <Pagination :data="state.procedures" @previous="previous" @next="next" />
        </div>
        <ModulesUserProcedureModalProgressView :isModalOpen="state.modal.isViewProgressOpen"
            :selectedProcedure="state.selectedProcedure" @close="state.modal.isViewProgressOpen = false" />
    </div>
</template>

<script setup lang="ts">
import { procedureService } from '@/components/api/ProcedureService'
import type { Error } from '@/types'

let currentTablePage = 1
const expandedRecords = reactive([] as boolean[])

const state = reactive({
    columnFilter: [
        { column: 'title' },
    ],
    columnHeaders: [
        { name: 'procedures.table.title', sorter: true, key: 'title' },
        { name: 'procedures.table.content' },
        { name: 'procedures.table.status' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    procedures: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isViewProgressOpen: false,
    },
    selectedProcedure: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProcedures()
})

async function fetchProcedures() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await procedureService.getProcedures(params)
        if (response) {
            state.procedures = response
            expandedRecords.splice(0, expandedRecords.length, ...response.data.map(() => false))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchProcedures()
}

function next() {
    currentTablePage++
    fetchProcedures()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchProcedures()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchProcedures()
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}

function seeProgress(task: any) {
    state.selectedProcedure = task
    state.modal.isViewProgressOpen = true
}
</script>