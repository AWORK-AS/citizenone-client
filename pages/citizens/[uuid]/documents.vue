<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.documents') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.documents') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div class="flex justify-end items-center gap-x-3">
                    <FormButton buttonStyle="action" class="rounded-md" @click="state.modal.isAddDirectoryOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.documents.createNewFolder') }}
                    </FormButton>
                    <FormButton buttonStyle="action" class="rounded-md" @click="state.modal.isUploadFileOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.documents.uploadFile') }}
                    </FormButton>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.documents"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.documents?.data?.length === 0))">
                                <tr v-for="(document, index) in state.documents?.data" :key="index">
                                    <td width="25%">
                                        <span>{{ document?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ formatDateToReadable(document?.created_at) }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ document?.owner }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ formatDateToReadable(document?.updated_at) }}</span>
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editDirectory(document)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.documents.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewDirectory(document)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.documents.table.actions.view') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.documents" @previous="previous" @next="next" />
                </div>
                <ModulesCitizenDocumentModalNewDirectory :isModalOpen="state.modal.isAddDirectoryOpen"
                    @close="state.modal.isAddDirectoryOpen = false" @refreshDocuments="fetchDocuments" />
                <!-- <ModulesCitizenMedicineModalEdit :isModalOpen="state.modal.isEditMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isEditMedicineOpen = false"
                    @refreshDocuments="fetchCitizenMedicines" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicineOpen"
                    :message="$t('citizens.medicineJournals.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteMedicineOpen = false" @confirm="deleteMedicne" /> -->
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { documentService } from '@/components/api/DocumentService';
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'citizens.documents.table.filename', sorter: true, key: 'name' },
        { name: 'citizens.documents.table.dateCreated', sorter: true, key: 'created_at' },
        { name: 'citizens.documents.table.owner' },
        { name: 'citizens.documents.table.lastModified', sorter: true, key: 'updated_at' },
        { name: '' },
    ],
    dataFilter: [],
    error: [],
    isTableLoading: false,
    documents: [],
    modal: {
        isAddDirectoryOpen: false,
        isDeleteDirectoryOpen: false,
        isDeleteFileOpen: false,
        isEditDirectoryOpen: false,
        isUploadFileOpen: false,
    },
    selectedDirectory: [],
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchDocuments()
})

async function fetchDocuments() {
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await documentService.getCitizenFileFolders(params)
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

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchDocuments()
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('LL')
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>