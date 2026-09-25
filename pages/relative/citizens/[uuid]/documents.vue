<template>
    <div>
        <NuxtLayout name="relative">

            <Head>
                <Title>{{ $t('citizens.tabs.documents') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbRelative :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/relative/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </BreadcrumbRelative>
            </template>

            <template #header>{{ $t('citizens.tabs.documents') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesRelativeCitizenDetailsHeader />
                <ModulesRelativeCitizenJournalTabs />

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <div class="flex items-center gap-x-2">
                        <TableSearch @search="handleSearch" class="flex-1" />
                        <FormButton buttonStyle="action" :disabled="!state.selectedDocuments.length"
                            @click="openSelectedDocuments">
                            <Icon name="ph:arrow-square-out" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.documents.table.actions.openSelected') }} ({{ state.selectedDocuments.length }})
                        </FormButton>
                    </div>
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.documents"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" :selection="true"
                            rowKey="uuid" @sort="sort" @selection-change="onSelectionChange">
                            <template #body="{ selectedRows, handleRowSelect }"
                                v-if="!(state.isTableLoading || (state.documents?.data?.length === 0))">
                                <tr v-for="(document, index) in state.documents?.data" :key="index">
                                    <td width="50">
                                        <input v-if="document?.file_url" type="checkbox"
                                            :checked="selectedRows.some((row: any) => row.uuid === document.uuid)"
                                            @change="handleRowSelect(document)"
                                            class="peer w-5 h-5 appearance-none border bg-white border-primary rounded-sm checked:bg-secondary checked:border-secondary focus:ring-0 cursor-pointer" />
                                    </td>
                                    <td width="25%">
                                        <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            v-if="document?.file_url" @click="viewFile(document)">
                                            <Icon name="ph:file" class="size-6" />
                                            <span>{{ document?.name }}</span>
                                        </div>
                                        <span v-else class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            @click="viewDirectory(document)">
                                            <div>
                                                <Icon name="ph:folder-notch-open-light" class="size-6" />
                                            </div>
                                            <span>{{ document?.name }}</span>
                                        </span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ document?.user?.firstname }}</span>
                                        <span>{{ document?.user?.lastname }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ formatDateTimeToReadable(document?.created_at) }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>
                                            {{ document?.updated_at && formatDateTimeToReadable(document?.updated_at) }}
                                        </span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="viewDirectory(document)" v-if="document?.type === 'folder'">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizens.documents.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action"
                                                @click="downloadFile(document)" v-if="document?.file_url">
                                                <Icon name="ph:download-simple" class="size-4" />
                                                {{ $t('citizens.documents.table.actions.download') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.documents" @previous="previous" @next="next" />
                </div>
            </div>
            <ModulesUserDocumentDocsFileModalPreview :isModalOpen="preview.isOpen"
                :selectedDocument="preview.document" :loadFile="loadCitizenFile"
                @close="preview.isOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { citizenDocumentService } from '@/components/api/relative/CitizenDocumentService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { documentBlobViewer, documentFileName, canPreviewInApp } from '@/composables/documentBlobViewer'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const { openOrSaveOriginal } = documentBlobViewer()

// Word files are previewed in the app from the stored original instead of a
// blob: tab, which a browser cannot render and saved as a nameless, blank file.
const preview = reactive({
    isOpen: false,
    document: {} as any,
})

function loadCitizenFile(document: any): Promise<Blob> {
    return citizenDocumentService.downloadCitizenFile(document?.uuid)
}

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid as any
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.documents',
        translate: true,
        href: `/relative/citizens/${citizenUuid}/documents`,
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'citizens.documents.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'citizens.documents.table.owner', isTranslateName: true, },
        { name: 'citizens.documents.table.dateCreated', isTranslateName: true, sorter: true, key: 'created_at' },
        { name: 'citizens.documents.table.lastModified', isTranslateName: true, sorter: true, key: 'updated_at' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    documents: [] as any,
    selectedDocuments: [] as any[],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchDocuments()
})

watch(() => router?.currentRoute?.value?.query, (newParams, oldParams) => {
    handleRouteChange()
}, { deep: true })

const handleRouteChange = () => {
    fetchDocuments()
}

async function fetchDocuments(folderUuid: any = null) {
    state.error = {}
    state.isTableLoading = true
    try {
        const folderUuid = router?.currentRoute?.value?.query?.folder_uuid
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
            ...(folderUuid && { folder_uuid: folderUuid }),
        }
        const response = await citizenDocumentService.getCitizenDocuments(params)
        if (response) {
            state.documents = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchDocuments()
}

function next() {
    currentTablePage++
    fetchDocuments()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchDocuments()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDocuments()
}

async function downloadFile(document: any) {
    state.error = {}
    state.isTableLoading = true
    try {
        const documentUuid = document?.uuid
        const response = await citizenDocumentService.downloadCitizenFile(documentUuid)
        if (response) {
            saveAs(response, documentFileName(document))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function viewFile(document: any, allowPreview = true) {
    if (allowPreview && canPreviewInApp(document)) {
        preview.document = document
        preview.isOpen = true
        return
    }

    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenDocumentService.downloadCitizenFile(document?.uuid)
        if (response) {
            openOrSaveOriginal(response, documentFileName(document))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function onSelectionChange(rows: any[]) {
    state.selectedDocuments = rows
}

async function openSelectedDocuments() {
    for (const document of state.selectedDocuments.filter((d: any) => d?.file_url)) {
        await viewFile(document, false)
    }
    state.selectedDocuments = []
}

async function viewDirectory(document: any) {
    await navigateTo(`/relative/citizens/${citizenUuid}/documents?folder_uuid=${document.uuid}`)
}
</script>