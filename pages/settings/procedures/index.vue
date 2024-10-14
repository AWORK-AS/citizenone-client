<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('procedures.procedures') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('procedures.procedures') }}</template>

            <ModulesSettingsTab />

            <div class="mt-5">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/procedures/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('procedures.newProcedure') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.procedures"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.procedures?.data?.length === 0))">
                                <tr v-for="(procedure, index) in state.procedures?.data" :key="index">
                                    <td width="15%">
                                        <span>{{ procedure?.title }}</span>
                                    </td>
                                    <td width="60%">
                                        <div v-html="procedure.content" class="content" />
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
                                                @click="navigateTo(`/settings/procedures/${procedure.uuid}/edit`)">
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
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { procedureService } from '@/components/api/ProcedureService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

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
    dataFilter: [],
    procedures: [] as any,
    error: {} as Error,
    isTableLoading: false,
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchProcedures()
}
</script>