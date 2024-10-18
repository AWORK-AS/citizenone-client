<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('tasks.tasks') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('tasks.tasks') }}</template>

            <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/procedures">
                <Icon name="ph:arrow-left" size="20" class="text-black" />
                <span>{{ $t('back') }}</span>
            </NuxtLink>

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo(`/procedures/${procedureUuid}/new`)">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('tasks.newTask') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.proceduretasks"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.proceduretasks?.data?.length === 0))">
                                <tr v-for="(task, index) in state.proceduretasks?.data" :key="index">
                                    <td width="15%">
                                        <span>{{ task?.title }}</span>
                                    </td>
                                    <td width="60%">
                                        <div v-html="task.content" class="content" />
                                    </td>
                                    <td width="10%">
                                        <div class="flex items-center gap-x-2">
                                            <Badge :type="task?.is_active ? 'active' : 'inactive'">
                                                <p class="text-xs">
                                                    {{ task?.is_active ? $t('tasks.table.active') :
                                                        $t('tasks.table.inactive') }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewTask(task)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('procedures.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/procedures/${procedureUuid}/${task.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('tasks.table.actions.edit') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.proceduretasks" @previous="previous" @next="next" />
                </div>
            </div>
            <ModulesProcedureTaskModalView :isModalOpen="state.modal.isViewTaskOpen"
                :selectedProcedureTask="state.selectedProceduretask" @close="state.modal.isViewTaskOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { procedureTaskService } from '@/components/api/ProcedureTaskService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1
const router = useRouter()
const procedureUuid = router?.currentRoute?.value?.params?.procedure_uuid

const state = reactive({
    columnFilter: [
        { column: 'title' },
    ],
    columnHeaders: [
        { name: 'tasks.table.title', sorter: true, key: 'title' },
        { name: 'tasks.table.content' },
        { name: 'tasks.table.status' },
        { name: '' },
    ],
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isViewTaskOpen: false,
    },
    proceduretasks: [] as any,
    selectedProceduretask: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchProcedureTasks()
})

async function fetchProcedureTasks() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            procedure_uuid: procedureUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await procedureTaskService.getProcedureTasks(params)
        if (response) {
            state.proceduretasks = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchProcedureTasks()
}

function next() {
    currentTablePage++
    fetchProcedureTasks()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchProcedureTasks()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchProcedureTasks()
}

function viewTask(task: any) {
    state.selectedProceduretask = task
    state.modal.isViewTaskOpen = true
}
</script>