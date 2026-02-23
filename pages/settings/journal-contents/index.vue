<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalContents.journalContents') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('journalContents.journalContents') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/journal-contents/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('journalContents.newJournalContent') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.journalContents"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.journalContents?.data?.length === 0))">
                                <tr v-for="(journalContent, index) in state.journalContents?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ journalContent?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/journal-contents/${journalContent.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('journalContents.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteJournalContentConfirmation(journalContent)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('journalContents.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.journalContents" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteJournalContentOpen"
                :message="$t('journalContents.table.confirmation.deleteJournalContentConfirmation') + '?'"
                @close="state.modal.isDeleteJournalContentOpen = false" @confirm="deleteJournalContent" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { journalContentService } from '@/components/api/user/JournalContentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'journalContents.journalContents',
        translate: true,
        href: '/settings/journal-contents',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'journalContents.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    journalContents: [] as any,
    modal: {
        isDeleteJournalContentOpen: false,
    },
    selectedJournalContent: {} as any,
    sortData: {
        sortField: 'name',
        sortOrder: 'ascend',
    },
})

onMounted(() => {
    fetchJournalContents()
})

async function fetchJournalContents() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await journalContentService.getJournalContents(params)
        if (response) {
            state.journalContents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchJournalContents()
}

function next() {
    currentTablePage++
    fetchJournalContents()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchJournalContents()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchJournalContents()
}

function deleteJournalContentConfirmation(journalContent: any) {
    state.selectedJournalContent = journalContent
    state.modal.isDeleteJournalContentOpen = true
}

async function deleteJournalContent() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await journalContentService.deleteJournalContent(state.selectedJournalContent.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchJournalContents()
            successAlert(`${t('alert.success')}!`, `${t('journalContents.table.alert.journalContentSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
