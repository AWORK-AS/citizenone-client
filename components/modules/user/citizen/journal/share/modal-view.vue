<template>
    <div>
        <Modal size="2xl" :title="$t('citizens.citizenJournals.shareJournals.sharedJournals')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="flex justify-end items-center gap-x-5 mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="state.modal.isShareJournalsOpen = true">
                        <Icon name="ph:share-fat" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.citizenJournals.shareJournals.shareJournals') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.shared_journals"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.shared_journals?.data?.length === 0))">
                                <tr v-for="(shared_journal, index) in state.shared_journals?.data" :key="index">
                                    <td width="35%">
                                        <p class="text-primary hover:text-primary-700 cursor-pointer"
                                            @click="navigateToExternalLink(`${runtimeConfig.public.appBaseURL}/guest/citizen-journals/${shared_journal?.uuid}`)">
                                            {{
                                                `${runtimeConfig.public.appBaseURL}/guest/citizen-journals/${shared_journal?.uuid}`
                                            }}
                                        </p>
                                    </td>
                                    <td width="35%">
                                        <div class="text-xs flex flex-wrap gap-1">
                                            <span v-for="(citizen, index) in shared_journal?.share_link_details"
                                                :key=index class="bg-primary px-2 py-1 text-white rounded-md">
                                                {{ citizen?.shareable?.firstname + ' ' + (citizen?.shareable?.lastname
                                                    ?? '') }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteSharedJournalConfirmation(shared_journal)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('absences.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.shared_journals" @previous="previous" @next="next" />
                </div>

                <ModulesUserCitizenJournalShareModalShare :isModalOpen="state.modal.isShareJournalsOpen"
                    @close="state.modal.isShareJournalsOpen = false" @refreshSharedJournals="fetchSharedJournals" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteSharedJournalLink"
                    :message="$t('citizens.citizenJournals.shareJournals.table.confirmation.deleteLinkConfirmation') + '?'"
                    @close="state.modal.isDeleteSharedJournalLink = false" @confirm="deleteSharedJournalLink" />
            </template>
        </Modal>
    </div>
</template>


<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { successAlert } = useAlert()
const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const customPagesStore = useCustomPagesStore() as any
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'citizens.citizenJournals.shareJournals.table.link', isTranslateName: true, },
        { name: customPagesStore.getCustomPagesName?.citizens, isTranslateName: false, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    shared_journals: [] as any,
    isTableLoading: false,
    modal: {
        isShareJournalsOpen: false,
        isDeleteSharedJournalLink: false,
    },
    selectedSharedJournal: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchSharedJournals()
        state.columnHeaders[1].name = customPagesStore.getCustomPagesName?.citizens
    }
})

async function fetchSharedJournals() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await journalService.getSharedJournals(params)
        if (response) {
            state.shared_journals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchSharedJournals()
}

function next() {
    currentTablePage++
    fetchSharedJournals()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchSharedJournals()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchSharedJournals()
}

function deleteSharedJournalConfirmation(sharedJournal: any) {
    state.selectedSharedJournal = sharedJournal
    state.modal.isDeleteSharedJournalLink = true
}

async function deleteSharedJournalLink() {
    state.error = {}
    state.isTableLoading = true
    try {
        const selectedSharedJournalUuid = state.selectedSharedJournal.uuid
        const response = await journalService.deleteSharedJournals(selectedSharedJournalUuid)
        if (response) {
            fetchSharedJournals()
            successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.shareJournals.table.alert.linkSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function navigateToExternalLink(link: any) {
    await navigateTo(link, {
        external: true,
        open: {
            target: '_blank',
        }
    })
}
</script>