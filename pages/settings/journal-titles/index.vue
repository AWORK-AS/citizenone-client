<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalTitles.journalTitles') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('journalTitles.journalTitles') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/journal-titles/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('journalTitles.newJournalTitle') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.journalTitles"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.journalTitles?.data?.length === 0))">
                                <tr v-for="(journalTitle, index) in state.journalTitles?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ journalTitle?.title }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/journal-titles/${journalTitle.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('journalTitles.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteJournalTitleConfirmation(journalTitle)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('journalTitles.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.journalTitles" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteJournalTitleOpen"
                :message="$t('journalTitles.table.confirmation.deleteJournalTitleConfirmation') + '?'"
                @close="state.modal.isDeleteJournalTitleOpen = false" @confirm="deleteJournalTitle" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { journalTitleService } from '@/components/api/user/JournalTitleService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'journalTitles.journalTitles',
        translate: true,
        href: '/settings/journal-titles',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'journalTitles.table.title', isTranslateName: true, sorter: true, key: 'title' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    journalTitles: [] as any,
    modal: {
        isDeleteJournalTitleOpen: false,
    },
    selectedJournalTitle: {} as any,
    sortData: {
        sortField: 'title',
        sortOrder: 'ascend',
    },
})

onMounted(() => {
    fetchJournalTitles()
})

async function fetchJournalTitles() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await journalTitleService.getJournalTitles(params)
        if (response) {
            state.journalTitles = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchJournalTitles()
}

function next() {
    currentTablePage++
    fetchJournalTitles()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchJournalTitles()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchJournalTitles()
}

function deleteJournalTitleConfirmation(department: any) {
    state.selectedJournalTitle = department
    state.modal.isDeleteJournalTitleOpen = true
}

async function deleteJournalTitle() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await journalTitleService.deleteJournalTitle(state.selectedJournalTitle.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchJournalTitles()
            successAlert(`${t('alert.success')}!`, `${t('journalTitles.table.alert.journalTitleSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>