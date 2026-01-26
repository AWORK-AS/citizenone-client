<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('tasks.tasks') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

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
                    <TableSearch @search="handleSearch" />
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
                                        <div v-html="task.content" class="content"
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
                                                @click="seeProgress(task)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('procedures.table.actions.seeProgress') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/procedures/${procedureUuid}/${task.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
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
            <ModulesUserProcedureTaskModalProgressView :isModalOpen="state.modal.isViewProgressOpen"
                :selectedProcedureTask="state.selectedProceduretask" @close="state.modal.isViewProgressOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { procedureTaskService } from '@/components/api/user/ProcedureTaskService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1
const router = useRouter()
const procedureUuid = router?.currentRoute?.value?.params?.procedure_uuid
const expandedRecords = reactive([] as boolean[])
const breadcrumbLinks = [
    {
        name: 'procedures.procedures',
        translate: true,
        href: '/procedures',
    },
    {
        name: 'tasks.tasks',
        translate: true,
        href: `/procedures/${procedureUuid}`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'tasks.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: 'tasks.table.content', isTranslateName: true, },
        { name: 'tasks.table.status', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isViewProgressOpen: false,
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
            expandedRecords.splice(0, expandedRecords.length, ...response.data.map(() => false))
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

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchProcedureTasks()
}

function toggleExpanded(index: number) {
    expandedRecords[index] = !expandedRecords[index]
}

function seeProgress(task: any) {
    state.selectedProceduretask = task
    state.modal.isViewProgressOpen = true
}
</script>