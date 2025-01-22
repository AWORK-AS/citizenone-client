<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalNoteTags.journalNoteTags') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('journalNoteTags.journalNoteTags') }}</template>

            <ModulesSettingsTab />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/journal-note-tags/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('journalNoteTags.addNewTag') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.tags" :isLoading="state.isTableLoading"
                            :sortData="state.sortData" @sort="sort">

                            <!-- Custom Body -->
                            <template #body v-if="!(state.isTableLoading || state.tags.length === 0)">
                                <tr v-for="(tag, index) in state.tags" :key="index">
                                    <td width="40%">
                                        <span>{{ tag?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <span :style="{ backgroundColor: tag?.color }"
                                            class="inline-block w-8 h-8 rounded" />
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/journal-note-tags/edit/${tag.uuid}`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('journalNoteTags.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteTag(tag.uuid)">
                                                <Icon name="ph:trash" class="size-4" />
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>

                    </div>
                    <Pagination :data="state.tags" @previous="previous" @next="next" />
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { journalNoteTagService } from '@/components/api/JournalNoteTagService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'journalNoteTags.table.name', sorter: true, key: 'name' },
        { name: 'journalNoteTags.table.color', sorter: false, key: 'color' },
        { name: "" }
    ],
    dataFilter: {
        search: ''
    },
    tags: [] as any,
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchTags()
})

async function fetchTags() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await journalNoteTagService.getJournalNoteTags(params)
        if (response?.data) {
            state.tags = response.data
            state.pagination = {
                current_page: response.meta?.current_page || 1,
                last_page: response.meta?.last_page || 1,
                total: response.meta?.total || 0,
            }
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

const deleteTag = async (uuid: string) => {
    try {
        await journalNoteTagService.deleteJournal(uuid)
        state.tags = state.tags.filter(tag => tag.uuid !== uuid)
    } catch (error) {
        console.error('Error deleting tag:', error)
    }
}

function previous() {
    if (currentTablePage > 1) {
        currentTablePage--
        fetchTags()
    }
}

function next() {
    if (currentTablePage < state.pagination.last_page) {
        currentTablePage++
        fetchTags()
    }
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchTags()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchTags()
}
</script>
