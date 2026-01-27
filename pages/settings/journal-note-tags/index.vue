<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalNoteTags.journalNoteTags') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('journalNoteTags.journalNoteTags') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

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
                        <Table :columnHeaders="state.columnHeaders" :data="state.journalNoteTags"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.journalNoteTags?.data?.length === 0))">
                                <tr v-for="(journalNoteTag, index) in state.journalNoteTags?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ journalNoteTag?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <span :style="{ backgroundColor: journalNoteTag?.color }"
                                            class="inline-block w-8 h-8 rounded" />
                                    </td>
                                    <td width="30%">
                                        <div class="text-xxs flex flex-wrap gap-1">
                                            <span v-for="(department, index) in journalNoteTag?.departments" :key=index
                                                class="bg-primary px-2 py-1 text-white rounded-md">
                                                {{ department?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/journal-note-tags/${journalNoteTag.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('journalNoteTags.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteJournalNoteTagConfirmation(journalNoteTag)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('journalNoteTags.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.journalNoteTags" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteJournalNoteTagOpen"
                :message="$t('journalNoteTags.table.confirmation.deleteJournalTagConfirmation') + '?'"
                @close="state.modal.isDeleteJournalNoteTagOpen = false" @confirm="deleteJournalNoteTag" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { journalNoteTagService } from '@/components/api/user/JournalNoteTagService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'journalNoteTags.journalNoteTags',
        translate: true,
        href: '/settings/journal-note-tags',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'journalNoteTags.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'journalNoteTags.table.color', isTranslateName: true, sorter: false, key: 'color' },
        { name: customPagesStore.getCustomPagesName?.department, isTranslateName: false },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    journalNoteTags: [] as any,
    modal: {
        isDeleteJournalNoteTagOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    isTableLoading: false,
    selectedJournalNoteTag: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchJournalNoteTags()
})

watch(() => customPagesStore.getCustomPagesName, (newValue: any) => {
    if (newValue) {
        state.columnHeaders = [
            { name: 'calendarTags.table.name', isTranslateName: true, sorter: true, key: 'tag' },
            { name: 'calendarTags.table.color', isTranslateName: true, },
            { name: customPagesStore.getCustomPagesName?.department, isTranslateName: false },
            { name: '' }
        ]
    }
}, { deep: true })

async function fetchJournalNoteTags() {
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
        if (response) {
            state.journalNoteTags = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchJournalNoteTags()
}

function next() {
    currentTablePage++
    fetchJournalNoteTags()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchJournalNoteTags()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchJournalNoteTags()
}

function deleteJournalNoteTagConfirmation(journalNoteTag: any) {
    state.selectedJournalNoteTag = journalNoteTag
    state.modal.isDeleteJournalNoteTagOpen = true
}

async function deleteJournalNoteTag() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await journalNoteTagService.deleteJournalNoteTag(state.selectedJournalNoteTag.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchJournalNoteTags()
            successAlert(`${t('alert.success')}!`, `${t('journalNoteTags.alert.journalTagSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
