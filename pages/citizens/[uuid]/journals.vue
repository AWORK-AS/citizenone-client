<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>
                    {{ term('journals', $t('citizens.tabs.journals')) }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </Breadcrumb>
            </template>

            <template #header>{{ term('journals', $t('citizens.tabs.journals')) }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-8 space-y-5">
                        <!-- The wellbeing ruler's development over time, one line per
                             child. Only offered where the ruler is in use. -->
                        <div v-if="showWellbeing" class="rounded-lg border border-gray-200 bg-white">
                            <button type="button"
                                class="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900"
                                :aria-expanded="state.isWellbeingOpen"
                                @click="state.isWellbeingOpen = !state.isWellbeingOpen">
                                {{ $t('wellbeing.development.title') }}
                                <Icon :name="state.isWellbeingOpen ? 'ph:caret-up' : 'ph:caret-down'" class="size-4 text-gray-500" />
                            </button>
                            <div v-if="state.isWellbeingOpen" class="border-t border-gray-100 p-4">
                                <ModulesUserCitizenWellbeingDevelopmentChart :key="state.wellbeingChartKey"
                                    :citizenUuid="String(citizenUuid)" />
                            </div>
                        </div>
                        <div class="flex justify-between flex-col-reverse md:flex-row gap-3">
                            <button class="flex items-center gap-x-1 text-sm text-primary group"
                                @click="state.modal.isFilterJournalOpen = true">
                                <Icon name="ic:outline-filter-list"
                                    class="text-primary w-6 h-6 group-hover:text-primary-700" />
                                <span class="group-hover:text-primary-700">
                                    {{ $t('filter') }}
                                </span>
                            </button>
                            <div class="flex items-center gap-x-2 justify-end">
                                <FormButton buttonStyle="action" @click="state.modal.isAddJournalOpen = true"
                                    v-if="isAtLeast('Admin') || can('create_citizen_journal')">
                                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.newNote') }}
                                </FormButton>
                                <FormButton buttonStyle="action" @click="showDownloadJournal"
                                    v-if="isAtLeast('Admin') || can('view_citizen_journal')">
                                    <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.download') }}
                                </FormButton>
                                <FormButton buttonStyle="action" @click="showDeletedJournalHistories"
                                    v-if="isAtLeast('Admin') || can('view_citizen_journal')">
                                    <Icon name="ph:clock-clockwise" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.journalLogs.deletedNotes') }}
                                </FormButton>
                            </div>
                        </div>

                        <div>
                            <div class="flex flex-col md:flex-row md:items-center gap-2">
                                <FormTextField id="filter_journal" name="filter_journal"
                                    :placeholder="`${$t('search')} ${term('journal', $t('citizens.citizenJournals.filter.searchJournal'))}`"
                                    v-model="state.filter.journal" class="flex-1" @blur="filterJournal"
                                    @keyup.enter="filterJournal" />
                                <FormDateRangeField id="date_range" name="date_range"
                                    :placeholder="$t('citizens.citizenJournals.filter.filterDate')"
                                    v-model="state.filter.date_range" class="w-full md:w-72 h-11" />
                                <div class="flex items-center gap-1.5 shrink-0">
                                    <Tooltip :text="$t('citizens.citizenJournals.filter.oldestFirst')">
                                        <FormButton :aria-label="$t('citizens.citizenJournals.filter.oldestFirst')" buttonSize="sm" :class="[
                                            ['Journal ascending', ''].includes(citizenJournalStore.getSortDataBy) && 'border-secondary bg-secondary text-white',
                                            'w-full md:w-fit']" @click="sortJournalAscending('Journal ascending')">
                                            <Icon name="mdi:sort-ascending" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                    <Tooltip :text="$t('citizens.citizenJournals.filter.newestFirst')">
                                        <FormButton :aria-label="$t('citizens.citizenJournals.filter.newestFirst')" buttonSize="sm" :class="[
                                            ['Journal descending'].includes(citizenJournalStore.getSortDataBy) && 'border-secondary bg-secondary text-white',
                                            'w-full md:w-fit']" @click="sortJournalDescending('Journal descending')">
                                            <Icon name="mdi:sort-descending" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                    <Tooltip :text="$t('citizens.citizenJournals.filter.showLockedOnly')">
                                        <FormButton :aria-label="$t('citizens.citizenJournals.filter.showLockedOnly')" buttonSize="sm" :class="[
                                            citizenJournalStore.getFilterDataBy === 'Locked journals' && 'border-secondary bg-secondary text-white',
                                            'w-full md:w-fit']" @click="fetchLockedJournals('Locked journals')">
                                            <Icon name="ph:lock" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                    <Tooltip :text="$t('citizens.citizenJournals.filter.showFavoritesOnly')">
                                        <FormButton :aria-label="$t('citizens.citizenJournals.filter.showFavoritesOnly')" buttonSize="sm" :class="[
                                            citizenJournalStore.getFilterDataBy === 'Favorite journals' && 'border-secondary bg-secondary text-white',
                                            'w-full md:w-fit']" @click="fetchFavoriteJournals('Favorite journals')">
                                            <Icon name="ph:star" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                    <Tooltip :text="$t('citizens.citizenJournals.filter.resetFilters')">
                                        <FormButton :aria-label="$t('citizens.citizenJournals.filter.resetFilters')" class="w-full md:w-fit" buttonSize="sm" @click="resetFilter">
                                            <Icon name="mdi:refresh" class="size-4" />
                                        </FormButton>
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div class="mt-5 space-y-5 stagger-children">
                            <ModulesUserCitizenJournalCard v-for="(journal, index) in state.journals?.data" :key="index"
                                :journal="journal" :filterView="citizenJournalStore.getFilterView"
                                :plansAndGoalsBasePath="`/citizens/${citizenUuid}/plans-and-goals/all`"
                                @edit="editJournal" @copy="copyJournal" @move="moveJournal"
                                @favorite-updated="onJournalFavoriteUpdated" @lock-unlock="lockUnlockJournal"
                                @pin-unpin="pinUnpinJournal" @view-logs="viewJournalLogs"
                                @view-history="viewRecordHistory" @delete="confirmJournalDeletion" />
                            <div v-if="state.journals?.data?.length === 0"
                                class="flex flex-col items-center justify-center py-16 text-center">
                                <Icon name="ph:note-pencil" class="h-10 w-10 text-slate-300" aria-hidden="true" />
                                <p class="mt-3 text-slate-500">{{ $t('theresNoDataAvailableToDisplay') }}.</p>
                                <button type="button" v-if="isAtLeast('Admin') || can('create_citizen_journal')"
                                    @click="state.modal.isAddJournalOpen = true"
                                    class="mt-3 inline-flex items-center gap-x-1.5 rounded-lg bg-primary text-white px-3.5 py-2 text-sm font-medium hover:bg-[#0d3f61] transition-colors">
                                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.newNote') }}
                                </button>
                            </div>
                            <Pagination :data="state.journals" @previous="previous" @next="next" />
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
            <ModulesUserCitizenJournalModalFilter :isModalOpen="state.modal.isFilterJournalOpen"
                @close="state.modal.isFilterJournalOpen = false" @setFilter="setFilter" />
            <ModulesUserCitizenJournalModalNew :isModalOpen="state.modal.isAddJournalOpen"
                @close="state.modal.isAddJournalOpen = false" @refreshJournal="fetchJournals" />
            <ModulesUserCitizenJournalModalEdit :isModalOpen="state.modal.isEditJournalOpen"
                :selectedJournal="state.selectedJournal" :readonly="state.selectedJournalReadonly"
                @close="closeEditJournalModal" @refreshJournal="fetchJournals" />
            <ModulesUserCitizenJournalModalDownload :isModalOpen="state.modal.isDownloadJournalOpen"
                @close="state.modal.isDownloadJournalOpen = false" />
            <ModulesUserCitizenJournalModalDeletedLogs :isModalOpen="state.modal.isDeletedJournalHistoriesOpen"
                @close="state.modal.isDeletedJournalHistoriesOpen = false" />
            <ModulesUserCitizenJournalModalCopy :isModalOpen="state.modal.isCopyJournalOpen"
                :selectedJournal="state.selectedJournal" @close="state.modal.isCopyJournalOpen = false"
                @refreshJournal="fetchJournals" />
            <ModulesUserCitizenJournalModalMove :isModalOpen="state.modal.isMoveJournalOpen"
                :selectedJournal="state.selectedJournal" @close="state.modal.isMoveJournalOpen = false"
                @refreshJournal="fetchJournals" />
            <ModulesUserCitizenJournalModalIndividualLogs :isModalOpen="state.modal.isViewLogsOpen"
                :selectedJournal="state.selectedJournal" @close="state.modal.isViewLogsOpen = false" />
            <ModulesUserHistoryModalRecordHistory :isModalOpen="state.modal.isRecordHistoryOpen" type="journal"
                :uuid="state.selectedJournal?.uuid" :title="$t('recordHistory.title')"
                @close="state.modal.isRecordHistoryOpen = false" />
            <DialogConfirmation :isModalOpen="state.modal.isDeleteJournalOpen"
                :message="$t('citizens.citizenJournals.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteJournalOpen = false" @confirm="deleteJournal" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { formFieldConfigService } from '@/components/api/user/FormFieldConfigService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCitizenJournalStore } from '@/store/citizen-journal'
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'
import { usePermissions } from '@/composables/usePermissions'
import { useTerminology } from '@/composables/useTerminology'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()
const customPagesStore = useCustomPagesStore() as any
const { term } = useTerminology()
const router = useRouter()
const citizenJournalStore = useCitizenJournalStore()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const breadcrumbLinks = computed(() => [
    {
        name: term('journals', t('citizens.tabs.journals')),
        translate: false,
        href: `/citizens/${citizenUuid}/journals`,
    },
])

const state = reactive({
    dataFilter: [] as any,
    error: {} as Error,
    filter: {
        date_range: [] as any,
        journal: '' as any,
        view: "Standard view"
    },
    isPageLoading: false,
    journals: [] as any,
    modal: {
        isAddJournalOpen: false,
        isCopyJournalOpen: false,
        isDeleteJournalOpen: false,
        isDeletedJournalHistoriesOpen: false,
        isDownloadJournalOpen: false,
        isEditJournalOpen: false,
        isFilterJournalOpen: false,
        isMoveJournalOpen: false,
        isViewLogsOpen: false,
        isRecordHistoryOpen: false,
    },
    selectedJournal: [] as any,
    selectedJournalReadonly: false,
    isWellbeingRulerEnabled: false,
    isWellbeingOpen: false,
    wellbeingChartKey: 0,
    sortData: {
        sortField: 'date',
        sortOrder: 'descend',
    },
})

// Shown when the company has the ruler on, or when notes on this page already
// carry scores from before it was switched off.
const showWellbeing = computed(() => state.isWellbeingRulerEnabled
    || (state.journals?.data ?? []).some((journal: any) => journal?.wellbeing_scores?.length > 0))

async function fetchWellbeingRulerConfig() {
    try {
        const response = await formFieldConfigService.getFormConfigs({ entity_type: 'citizen_journal' })
        state.isWellbeingRulerEnabled = (response?.data ?? [])
            .some((config: any) => config?.form_fields?.wellbeing_ruler === true)
    } catch {
        state.isWellbeingRulerEnabled = false
    }
}

onMounted(() => {
    fetchWellbeingRulerConfig()

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
        state.dataFilter.lock = true
    } else if (citizenJournalStore.getFilterDataBy === 'Favorite journals') {
        state.dataFilter.favorite = true
    }

    fetchJournals()

    const journalUuid = router.currentRoute.value.query.open_journal as string
    if (journalUuid) {
        openJournalFromQuery(journalUuid)
    }
})

async function openJournalFromQuery(journalUuid: string) {
    try {
        const response = await journalService.getJournal(journalUuid)
        if (response?.data) {
            state.selectedJournal = response.data
            state.selectedJournalReadonly = response.data.is_editable === false
            state.modal.isEditJournalOpen = true
        }
    } catch (error: any) {
        state.error = error
    } finally {
        // Drop the param so a refresh, or closing the modal, doesn't reopen it.
        const { open_journal, ...rest } = router.currentRoute.value.query
        router.replace({ query: rest })
    }
}

watch(() => state.filter.date_range, (dates: any) => {
    state.dataFilter.start_date = dates?.[0]
    state.dataFilter.end_date = dates?.[1]
    fetchJournals()
})

function setFilter(filter: any) {
    citizenJournalStore.setFilterView(filter.selectedView.title)
    state.dataFilter.tags_uuid = JSON.stringify(filter.tags)
    state.dataFilter.created_by = JSON.stringify(filter.created_by)
    fetchJournals()
}

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
            // A saved note may have moved the curve.
            state.wellbeingChartKey++
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function showDownloadJournal() {
    state.modal.isDownloadJournalOpen = true
}

function showDeletedJournalHistories() {
    state.modal.isDeletedJournalHistoriesOpen = true
}

function filterJournal() {
    state.dataFilter.title = state.filter.journal
    fetchJournals()
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
    state.dataFilter.lock = true
    fetchJournals()
}

function fetchFavoriteJournals(filterDataBy: any) {
    citizenJournalStore.setFilterDataBy(filterDataBy)
    currentTablePage = 1
    state.dataFilter.favorite = true
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
    state.filter.date_range = []
    state.filter.journal = ''
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
    state.selectedJournalReadonly = false
    state.modal.isEditJournalOpen = true
}

function copyJournal(journal: any) {
    state.selectedJournal = journal
    state.modal.isCopyJournalOpen = true
}

function moveJournal(journal: any) {
    state.selectedJournal = journal
    state.modal.isMoveJournalOpen = true
}

function closeEditJournalModal() {
    state.modal.isEditJournalOpen = false
    state.selectedJournal = []
    state.selectedJournalReadonly = false
}

function onJournalFavoriteUpdated(updatedJournal: any) {
    if (!updatedJournal) return
    fetchJournals()
    successAlert(`${t('alert.success')}!`, updatedJournal?.is_favorite ? t('citizens.citizenJournals.alert.addedToFavorites', { journal: term('journal', 'Journal') }) : t('citizens.citizenJournals.alert.removedToFavorites', { journal: term('journal', 'Journal') }))
}

async function lockUnlockJournal(journalUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalLock(journalUuid)
        if (response?.data) {
            fetchJournals()
            successAlert(`${t('alert.success')}!`, response?.data?.is_locked ? t('citizens.citizenJournals.alert.lockJournal', { journal: term('journal', 'Journal') }) : t('citizens.citizenJournals.alert.unlockJournal', { journal: term('journal', 'Journal') }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function pinUnpinJournal(journalUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalPin(journalUuid)
        if (response?.data) {
            fetchJournals()
            successAlert(`${t('alert.success')}!`, response?.data?.is_pinned ? t('citizens.citizenJournals.alert.pinJournal', { journal: term('journal', 'Journal') }) : t('citizens.citizenJournals.alert.unpinJournal', { journal: term('journal', 'Journal') }))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

function viewJournalLogs(journal: any) {
    state.selectedJournal = journal
    state.modal.isViewLogsOpen = true
}

function viewRecordHistory(journal: any) {
    state.selectedJournal = journal
    state.modal.isRecordHistoryOpen = true
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
</script>