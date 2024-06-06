<template>
    <div>

        <Head>
            <Title>Citizen Journal - {{ runtimeConfig?.public?.appName }}</Title>
        </Head>

        <CitizenDetails>
            <LoadingSpinner :isActive="state.isPageLoading">
                <div class="space-y-3">
                    <BaseMessage color="danger" icon v-if="errorMessage" :message="errorMessage" />
                    <BaseCard rounded="md" class="p-10">
                        <div
                            class="border-muted-200 dark:border-muted-700 mb-8 w-full flex gap-2 border-b pb-8 flex-col md:flex-row md:items-center">
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
                                <BaseButtonIcon rounded="full" size="md"
                                    data-nui-tooltip="Sort journal by date (ascending)">
                                    <Icon name="mdi:sort-ascending" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md"
                                    data-nui-tooltip="Sort journal by date (descending)">
                                    <Icon name="mdi:sort-descending" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md" data-nui-tooltip="Show locked journals">
                                    <Icon name="ph:lock" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md" data-nui-tooltip="Show favorite journals">
                                    <Icon name="ph:star" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md" data-nui-tooltip="Reset Filter">
                                    <Icon name="mdi:refresh" class="size-4" />
                                </BaseButtonIcon>
                                <BaseButtonIcon rounded="full" size="md" data-nui-tooltip="Add new journal"
                                    @click="state.modal.isAddJournalOpen = true">
                                    <Icon name="lucide:plus" class="size-4" />
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
                                            <BaseDropdownItem title="Favorite" text="Add journal to favorite">
                                                <template #start>
                                                    <Icon name="ph:star" class="me-2 block size-5" />
                                                </template>
                                            </BaseDropdownItem>
                                            <BaseDropdownItem title="Lock" text="Lock journal">
                                                <template #start>
                                                    <Icon name="ph:lock" class="me-2 block size-5" />
                                                </template>
                                            </BaseDropdownItem>
                                            <BaseDropdownItem title="Print" text="Print journal">
                                                <template #start>
                                                    <Icon name="ph:printer" class="me-2 block size-5" />
                                                </template>
                                            </BaseDropdownItem>
                                            <BaseDropdownItem title="Delete" text="Delete journal">
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
            uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
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

function previous() {
    currentTablePage--
    fetchJournals()
}

function next() {
    currentTablePage++
    fetchJournals()
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('LL')
}
</script>