<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.citizenJournals') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.citizenJournals') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="space-y-2">

                        <div class="flex justify-end items-center mb-5 gap-x-2">
                            <FormButton buttonStyle="" class="rounded-lg bg-white"
                                @click="state.modal.isAddJournalOpen = true">
                                <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.citizenJournals.newJournal') }}
                            </FormButton>
                            <FormButton buttonStyle="action" class="rounded-lg" @click="showDownloadJournalModal">
                                <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                {{ $t('citizens.citizenJournals.download') }}
                            </FormButton>
                        </div>

                        <div class="border-b border-dashed border-tertiary">
                            <div class="pb-4 space-y-3 md:flex md:justify-between">
                                <div class="space-y-1">
                                    <p>{{ $t('filter') }}:</p>
                                    <div class="space-y-3 flex-none md:space-y-0 md:flex items-center gap-2">
                                        <FormButton buttonSize="sm" :class="[
                                            citizenJournalStore.getFilterView === 'Standard view' && 'border-secondary bg-secondary text-white',
                                            'rounded-md w-full md:w-fit'
                                        ]" @click="setFilterView('Standard view')">
                                            {{ $t('citizens.citizenJournals.filter.standardView') }}
                                        </FormButton>
                                        <FormButton buttonSize="sm" :class="[
                                            citizenJournalStore.getFilterView === 'Journal note view' && 'border-secondary bg-secondary text-white',
                                            'rounded-md w-full md:w-fit'
                                        ]" @click="setFilterView('Journal note view')">
                                            {{ $t('citizens.citizenJournals.filter.journalNoteView') }}
                                        </FormButton>
                                        <FormButton buttonSize="sm" :class="[
                                            citizenJournalStore.getFilterView === 'Risk assessment view' && 'border-secondary bg-secondary text-white',
                                            'rounded-md w-full md:w-fit'
                                        ]" @click="setFilterView('Risk assessment view')">
                                            {{ $t('citizens.citizenJournals.filter.riskAssessmentView') }}
                                        </FormButton>
                                    </div>
                                </div>
                                <div class="flex justify-end items-end gap-x-1">
                                    <FormButton buttonSize="sm" :class="[
                                        ['Journal ascending', ''].includes(citizenJournalStore.getSortDataBy) && 'border-secondary bg-secondary text-white',
                                        'rounded-md w-full md:w-fit']"
                                        @click="sortJournalAscending('Journal ascending')">
                                        <Icon name="mdi:sort-ascending" class="size-4" />
                                    </FormButton>
                                    <FormButton buttonSize="sm" :class="[
                                        ['Journal descending'].includes(citizenJournalStore.getSortDataBy) && 'border-secondary bg-secondary text-white',
                                        'rounded-md w-full md:w-fit']"
                                        @click="sortJournalDescending('Journal descending')">
                                        <Icon name="mdi:sort-descending" class="size-4" />
                                    </FormButton>
                                    <FormButton buttonSize="sm" :class="[
                                        citizenJournalStore.getFilterDataBy === 'Locked journals' && 'border-secondary bg-secondary text-white',
                                        'rounded-md w-full md:w-fit']" @click="fetchLockedJournals('Locked journals')">
                                        <Icon name="ph:lock" class="size-4" />
                                    </FormButton>
                                    <FormButton buttonSize="sm" :class="[
                                        citizenJournalStore.getFilterDataBy === 'Favorite journals' && 'border-secondary bg-secondary text-white',
                                        'rounded-md w-full md:w-fit']"
                                        @click="fetchFavoriteJournals('Favorite journals')">
                                        <Icon name="ph:star" class="size-4" />
                                    </FormButton>
                                    <FormButton class="rounded-md" buttonSize="sm" @click="resetFilter">
                                        <Icon name="mdi:refresh" class="size-4" />
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-5">
                            <div class="mb-2 gap-2 border-b pb-5 px-2" v-for="(journal, index) in state.journals?.data"
                                :key="index">
                                <div class="space-y-3">
                                    <div class="space-y-1.5">
                                        <div>
                                            <div class="flex items-center gap-x-3 justify-between">
                                                <div class="flex items-center gap-x-3">
                                                    <h3 class="text-md font-semibold">
                                                        {{ journal.title }}
                                                    </h3>
                                                    <div v-if="journal.is_draft">
                                                        <Badge type="primary">
                                                            <p class="text-xs">
                                                                {{ $t('citizens.citizenJournals.form.draft') }}
                                                            </p>
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Badge type="none" v-if="journal.assessment === null">
                                                        <p class="text-xs">
                                                            {{ $t('citizens.citizenJournals.form.risk.none') }}
                                                        </p>
                                                    </Badge>
                                                    <Badge type="no-risk" v-if="journal.assessment === 'no risk'">
                                                        <p class="text-xs">
                                                            {{ $t('citizens.citizenJournals.form.risk.noRisk') }}
                                                        </p>
                                                    </Badge>
                                                    <Badge type="increased-risk"
                                                        v-if="journal.assessment === 'increased risk'">
                                                        <p class="text-xs">
                                                            {{
                                                                $t('citizens.citizenJournals.form.risk.increasedRisk')
                                                            }}
                                                        </p>
                                                    </Badge>
                                                    <Badge type="acute-increased-risk"
                                                        v-if="journal.assessment === 'acute increased risk'">
                                                        <p class="text-xs">
                                                            {{
                                                                $t('citizens.citizenJournals.form.risk.acuteIncreasedRisk')
                                                            }}
                                                        </p>
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p class="mt-1 text-xs text-muted-400">
                                                <span>{{ formatDateToReadable(journal.date) }}</span>
                                            </p>
                                        </div>
                                        <p class="text-sm text-muted-400"
                                            v-if="['Standard view', 'Journal note view'].includes(citizenJournalStore.getFilterView)">
                                            <div v-html="journal.content" id="content" />
                                        </p>
                                        <div class="text-sm text-muted-400"
                                            v-if="['Standard view', 'Risk assessment view'].includes(citizenJournalStore.getFilterView)">
                                            <p class="font-semibold">
                                                {{ $t('citizens.citizenJournals.riskAssessment') }}:
                                            </p>
                                            <div v-html="journal.note" id="note" />
                                        </div>
                                    </div>
                                    <div class="ms-auto">
                                        <div class="flex items-center gap-x-2">
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="editJournal(journal)">
                                                <Icon name="ph:pencil-duotone" class="size-4" />
                                            </FormButton>
                                            <FormButton buttonSize="sm" :class="[
                                                journal?.is_favorite && 'border-secondary bg-secondary text-white',
                                                'rounded-md w-full md:w-fit']"
                                                @click="addRemoveJournalToFavorite(journal.uuid)">
                                                <Icon name="ph:star" class="size-4" />
                                            </FormButton>
                                            <FormButton buttonSize="sm" :class="[
                                                journal?.is_locked && 'border-secondary bg-secondary text-white',
                                                'rounded-md w-full md:w-fit']"
                                                @click="lockUnlockJournal(journal.uuid)">
                                                <Icon name="ph:lock" class="size-4" v-if="journal.is_locked" />
                                                <Icon name="ph:lock-open" class="size-4" v-else />
                                            </FormButton>
                                            <FormButton class="rounded-md" buttonSize="sm"
                                                @click="confirmJournalDeletion(journal)">
                                                <Icon name="ph:trash-duotone" class="size-4" />
                                            </FormButton>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="state.journals?.data?.length === 0">
                                <p class="text-center py-10">
                                    {{ $t('theresNoDataAvailableToDisplay') }}.
                                </p>
                            </div>
                            <Pagination :data="state.journals" @previous="previous" @next="next" />
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
            <ModulesCitizenJournalModalNew :isModalOpen="state.modal.isAddJournalOpen"
                @close="state.modal.isAddJournalOpen = false" @refreshJournal="fetchJournals" />
            <ModulesCitizenJournalModalEdit :isModalOpen="state.modal.isEditJournalOpen"
                :selectedJournal="state.selectedJournal" @close="closeEditJournalModal"
                @refreshJournal="fetchJournals" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteJournalOpen"
                :message="$t('citizens.citizenJournals.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteJournalOpen = false" @confirm="deleteJournal" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { journalService } from '@/components/api/JournalService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import { useCitizenJournalStore } from '@/store/citizen-journal'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const citizenJournalStore = useCitizenJournalStore()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    dataFilter: [] as any,
    error: {} as Error,
    filter: {
        view: "Standard view"
    },
    isPageLoading: false,
    journals: [] as any,
    modal: {
        isAddJournalOpen: false,
        isDeleteJournalOpen: false,
        isEditJournalOpen: false,
    },
    selectedJournal: [] as any,
    sortData: {
        sortField: 'date',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    if (citizenJournalStore.getSortDataBy === 'Journal ascending') {
        state.sortData = {
            sortField: 'date',
            sortOrder: 'ascend',
        }
    } else if (citizenJournalStore.getSortDataBy === 'Journal descending') {
        state.sortData = {
            sortField: 'date',
            sortOrder: 'descend',
        }
    }

    if (citizenJournalStore.getFilterDataBy === 'Locked journals') {
        state.dataFilter = {
            lock: true
        }
    } else if (citizenJournalStore.getFilterDataBy === 'Favorite journals') {
        state.dataFilter = {
            favorite: true
        }
    }

    fetchJournals()
})

async function fetchJournals() {
    state.error = {}
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
        state.error = error
    }
    state.isPageLoading = false
}

function showDownloadJournalModal() {

}

function setFilterView(view: any) {
    citizenJournalStore.setFilterView(view)
}

function sortJournalAscending(filterDataBy: any) {
    citizenJournalStore.setSortDataBy(filterDataBy)
    currentTablePage = 1
    state.sortData = {
        sortField: 'date',
        sortOrder: 'ascend',
    }
    fetchJournals()
}

function sortJournalDescending(filterDataBy: any) {
    citizenJournalStore.setSortDataBy(filterDataBy)
    currentTablePage = 1
    state.sortData = {
        sortField: 'date',
        sortOrder: 'descend',
    }
    fetchJournals()
}

function fetchLockedJournals(filterDataBy: any) {
    citizenJournalStore.setFilterDataBy(filterDataBy)
    currentTablePage = 1
    state.dataFilter = {
        lock: true
    }
    fetchJournals()
}

function fetchFavoriteJournals(filterDataBy: any) {
    citizenJournalStore.setFilterDataBy(filterDataBy)
    currentTablePage = 1
    state.dataFilter = {
        favorite: true
    }
    fetchJournals()
}

function resetFilter() {
    citizenJournalStore.resetFilterDataBy()
    citizenJournalStore.resetSortDataBy()
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

function editJournal(journal: any) {
    state.selectedJournal = journal
    state.modal.isEditJournalOpen = true
}

function closeEditJournalModal() {
    state.modal.isEditJournalOpen = false
    state.selectedJournal = []
}

async function addRemoveJournalToFavorite(journalUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalFavorite(journalUuid)
        if (response?.data) {
            fetchJournals()
            successAlert(`${t('alert.success')}!`, response?.data?.is_favorite ? `${t('citizens.citizenJournals.alert.addedToFavorites')}.` : `${t('citizens.citizenJournals.alert.removedToFavorites')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function lockUnlockJournal(journalUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalLock(journalUuid)
        if (response?.data) {
            fetchJournals()
            successAlert(`${t('alert.success')}!`, response?.data?.is_locked ? `${t('citizens.citizenJournals.alert.lockJournal')}.` : `${t('citizens.citizenJournals.alert.unlockJournal')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function confirmJournalDeletion(journal: any) {
    state.selectedJournal = journal
    state.modal.isDeleteJournalOpen = true
}

async function deleteJournal() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.deleteJournal(state.selectedJournal.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.journals?.data?.length === 1) {
                resetFilter()
            } else {
                fetchJournals()
            }
            successAlert(`${t('alert.success')}!`, `${t('citizens.citizenJournals.alert.deletedSuccessfully')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('DD MMM, YYYY')
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>