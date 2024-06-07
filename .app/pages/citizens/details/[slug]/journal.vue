<template>
    <div>

        <Head>
            <Title>Citizen Journal - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-3">
                    <BaseMessage color="danger" icon v-if="errorMessage" :message="errorMessage" />
                    <BaseCard rounded="md" class="p-4 md:p-10">
                        <div class="border-muted-200 dark:border-muted-700 mb-8 w-full border-b pb-8 space-y-3">
                            <div class="flex gap-2 items-center">
                                <div class="flex items-center gap-2">
                                    <div
                                        class="bg-muted-100 dark:bg-muted-700/60 text-muted-400 flex size-[50px] items-center justify-center rounded-full">
                                        <Icon name="ph:book-open-duotone" class="size-5" />
                                    </div>
                                    <div>
                                        <BaseHeading tag="h3" size="md" weight="medium">
                                            Journal
                                        </BaseHeading>
                                    </div>
                                </div>

                                <div class="ms-auto flex flex-wrap items-center gap-2">
                                    <BaseButton color="primary" shape="full"
                                        @click="state.modal.isAddJournalOpen = true">
                                        <Icon name="lucide:plus" class="h-4 w-4" />
                                        <span>New Journal</span>
                                    </BaseButton>
                                </div>
                            </div>

                            <div class="flex gap-2 justify-center md:justify-end">
                                <BaseButtonIcon rounded="full" size="md"
                                    data-nui-tooltip="Sort journal by date (ascending)" @click="sortJournalAscending">
                                    <Icon name="mdi:sort-ascending" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md"
                                    data-nui-tooltip="Sort journal by date (descending)" @click="sortJournalDescending">
                                    <Icon name="mdi:sort-descending" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md" data-nui-tooltip="Show locked journals"
                                    @click="fetchLockedJournals">
                                    <Icon name="ph:lock" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md" data-nui-tooltip="Show favorite journals"
                                    @click="fetchFavoriteJournals">
                                    <Icon name="ph:star" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md" data-nui-tooltip="Reset Filter"
                                    @click="resetFilter">
                                    <Icon name="mdi:refresh" class="size-4" />
                                </BaseButtonIcon>
                            </div>
                        </div>
                        <div class="space-y-5 w-full">
                            <div class="border-muted-200 dark:border-muted-700 mb-8 flex w-full items-center gap-2 border-b border-dashed pb-8"
                                v-for="(journal, index) in state.journals?.data" :key="index">
                                <div class="flex w-full items-center gap-2">
                                    <div class="space-y-1.5">
                                        <BaseHeading tag="h3" size="md" weight="medium">
                                            {{ journal.title }}
                                        </BaseHeading>
                                        <BaseParagraph size="sm" class="text-muted-400">
                                            <span>{{ journal.content }}</span>
                                        </BaseParagraph>
                                        <BaseParagraph size="xs" class="text-muted-400">
                                            <span>{{ formatDateToReadable(journal.date) }}</span>
                                        </BaseParagraph>
                                    </div>
                                    <div class="ms-auto">
                                        <BaseDropdown variant="context" label="Dropdown" placement="bottom-end"
                                            size="md" class="z-20" rounded="lg">
                                            <BaseDropdownItem title="Edit" text="Edit journal">
                                                <template #start>
                                                    <Icon name="ph:pencil-duotone" class="me-2 block size-5" />
                                                </template>
                                            </BaseDropdownItem>
                                            <BaseDropdownItem :title="journal.is_favorite ? 'Unfavorite' : 'Favorite'"
                                                :text="journal.is_locked ? 'Remove journal to favorite' : 'Add journal to favorite'"
                                                @click="addRemoveJournalToFavorite(journal.uuid)">
                                                <template #start>
                                                    <Icon name="ph:star" class="me-2 block size-5" />
                                                </template>
                                            </BaseDropdownItem>
                                            <BaseDropdownItem :title="journal.is_locked ? 'Unlock' : 'Lock'"
                                                :text="journal.is_locked ? 'Unlock journal' : 'Lock journal'"
                                                @click="lockUnlockJournal(journal.uuid)">
                                                <template #start>
                                                    <Icon name="ph:lock-open" class="me-2 block size-5"
                                                        v-if="journal.is_locked" />
                                                    <Icon name="ph:lock" class="me-2 block size-5" v-else />
                                                </template>
                                            </BaseDropdownItem>
                                            <!-- <BaseDropdownItem title="Print" text="Print journal">
                                                <template #start>
                                                    <Icon name="ph:printer" class="me-2 block size-5" />
                                                </template>
                                            </BaseDropdownItem> -->
                                            <BaseDropdownItem title="Delete" text="Delete journal"
                                                @click="confirmJournalDeletion(journal.uuid)">
                                                <template #start>
                                                    <Icon name="ph:trash-duotone" class="me-2 block size-5" />
                                                </template>
                                            </BaseDropdownItem>
                                        </BaseDropdown>
                                    </div>
                                </div>
                            </div>
                            <Pagination :data="state.journals" @previous="previous" @next="next" />
                        </div>
                    </BaseCard>
                </div>
            </LoadingSpinner>
        </CitizenDetails>
        <ModulesCitizenJournalModalNewJournal :isModalOpen="state.modal.isAddJournalOpen"
            @close="state.modal.isAddJournalOpen = false" @refreshJournal="fetchJournals" />
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { journalService } from '@/components/api/JournalService'

definePageMeta({
    layout: 'user',
    title: 'Citizen Journal',
})

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const citizenUuid = route.params.slug
let currentTablePage = 1
let errorMessage = ''

const state = reactive({
    dataFilter: [],
    isPageLoading: false,
    modal: {
        isAddJournalOpen: false,
    },
    journals: [],
    sortData: {
        sortField: 'date',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchJournals()
})

async function fetchJournals() {
    state.isPageLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await journalService.getJournals(params)
        if (response) {
            state.journals = response
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

function sortJournalAscending() {
    currentTablePage = 1
    state.sortData = {
        sortField: 'date',
        sortOrder: 'descend',
    }
    fetchJournals()
}

function sortJournalDescending() {
    currentTablePage = 1
    state.sortData = {
        sortField: 'date',
        sortOrder: 'ascend',
    }
    fetchJournals()
}

function fetchLockedJournals() {
    currentTablePage = 1
    state.dataFilter = {
        lock: true
    }
    fetchJournals()
}

function fetchFavoriteJournals() {
    currentTablePage = 1
    state.dataFilter = {
        favorite: true
    }
    fetchJournals()
}

function resetFilter() {
    currentTablePage = 1
    state.dataFilter = []
    state.sortData = {
        sortField: 'date',
        sortOrder: 'descend',
    }
    fetchJournals()
}

function previous() {
    currentTablePage--
    fetchJournals()
}

function next() {
    currentTablePage++
    fetchJournals()
}

async function addRemoveJournalToFavorite(journalUuid: any) {
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalFavorite(journalUuid)
        if (response?.data) {
            fetchJournals()
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

async function lockUnlockJournal(journalUuid: any) {
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalLock(journalUuid)
        if (response?.data) {
            fetchJournals()
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

function confirmJournalDeletion(journalUuid: any) {
    if (confirm('Are you sure you want to delete this journal?')) {
        deleteJournal(journalUuid)
    }
}

async function deleteJournal(journalUuid: any) {
    state.isPageLoading = true
    try {
        const response = await journalService.deleteJournal(journalUuid)
        if (response?.message === 'Success') {
            if (state.journals?.data?.length === 1) {
                resetFilter()
            } else {
                fetchJournals()
            }
        }
    } catch (error: any) {
        errorMessage = error.message
    }
    state.isPageLoading = false
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('LL')
}
</script>