<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedDocuments') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('archived.tabs.archivedDocuments') }}</template>

            <ModulesSettingsTab />

            <ModulesArchivedTab class="mt-5" />

            <div class="mt-10">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.archivedDocuments"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.archivedDocuments?.data?.length === 0))">
                                <tr v-for="(document, index) in state.archivedDocuments?.data" :key="index">
                                    <td width="30%">
                                        <div class="text-tertiary hover:text-tertiary-700 cursor-pointer flex items-center gap-x-1"
                                            v-if="document?.file_url" @click="openFile(document)">
                                            <Icon name="ph:file" class="size-6" />
                                            <span>{{ document?.name }}</span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
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
import { citizenDocumentService } from '@/components/api/CitizenDocumentService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'archived.table.name', sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: [],
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
        const response = await citizenDocumentService.getArchivedDocuments(params)
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchArchivedDocuments()
}

function openFile(document: any) {
    navigateTo(document?.file_url, {
        external: true,
        open: {
            target: '_blank',
        }
    })
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
        const response = await citizenDocumentService.unarchiveDocument(documentUuid)
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