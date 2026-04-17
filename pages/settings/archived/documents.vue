<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedDocuments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('archived.tabs.archivedDocuments') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsArchiveSubTab id="archived" class="mt-5" />

            <div class="mt-10">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.archivedDocuments"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.archivedDocuments?.data?.length === 0))">
                                <tr v-for="(document, index) in state.archivedDocuments?.data" :key="index">
                                    <td width="20%">
                                        <p>
                                            {{ formatDateToReadable(document?.date_archived) }}
                                        </p>
                                    </td>
                                    <td width="25%">
                                        <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            v-if="document?.file_url" @click="downloadFile(document)">
                                            <Icon name="ph:file" class="size-6" />
                                            <span>{{ document?.name }}</span>
                                        </div>
                                        <div v-else class="flex items-center gap-x-1">
                                            <Icon name="ph:folder" class="size-6" />
                                            <span>{{ document?.name }}</span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <p>
                                            {{ document?.owner_name }}
                                        </p>
                                    </td>
                                    <td width="15%">
                                        <div class="w-fit">
                                            <Badge :type="document?.owner_type === 'citizen' ? 'active' : 'primary'">
                                                <p class="text-xs truncate">
                                                    {{ document?.owner_type === 'citizen' ?
                                                        $t('archived.table.type.citizen') :
                                                        $t('archived.table.type.employee') }}
                                                </p>
                                            </Badge>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="confirmDocumentUnarchiving(document)">
                                                <Icon name="mdi:archive-cancel-outline" class="size-4" />
                                                {{ $t('archived.table.actions.unarchive') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.archivedDocuments" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isUnarchiveDocumentOpen"
                :message="$t('archived.confirmation.unarchiveDocument') + '?'"
                @close="state.modal.isUnarchiveDocumentOpen = false" @confirm="unarchiveDocument" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { documentService } from '@/components/api/user/DocumentService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'archived.tabs.archivedDocuments',
        translate: true,
        href: '/settings/archived/documents',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'archived.table.date', isTranslateName: true, },
        { name: 'archived.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'archived.table.belongsTo', isTranslateName: true, },
        { name: 'archived.table.type.type', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    archivedDocuments: [] as any,
    modal: {
        isUnarchiveDocumentOpen: false
    },
    selectedDocument: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchArchivedDocuments()
})

async function fetchArchivedDocuments() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await documentService.getArchivedDocuments(params)
        if (response) {
            state.archivedDocuments = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchArchivedDocuments()
}

function next() {
    currentTablePage++
    fetchArchivedDocuments()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchArchivedDocuments()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchArchivedDocuments()
}

async function downloadFile(document: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = document?.uuid
        const response = await documentService.downloadArchivedDocument(documentUuid)
        if (response) {
            saveAs(response, document?.name)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function confirmDocumentUnarchiving(document: any) {
    state.selectedDocument = document
    state.modal.isUnarchiveDocumentOpen = true
}

async function unarchiveDocument() {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = state.selectedDocument?.uuid
        const response = await documentService.unarchiveDocument(documentUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('archived.alert.documentSuccessfullyUnarchive')}.`)
            fetchArchivedDocuments()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>