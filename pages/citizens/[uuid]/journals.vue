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
                        <ModulesUserCitizenBreadcrumbTrail />
                    </template>
                </Breadcrumb>
            </template>


            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />


                <ModulesUserCitizenDetailsHeader />
                <ModulesUserCitizenJournalTabs />
                <ModulesUserCitizenJournalPendingSurveysWarning ref="pendingSurveysWarning" :citizenUuid="String(citizenUuid)" />

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
                            <div class="flex items-center gap-x-5">
                                <button class="flex items-center gap-x-1 text-sm text-primary group"
                                    @click="state.modal.isFilterJournalOpen = true">
                                    <Icon name="ic:outline-filter-list"
                                        class="text-primary w-6 h-6 group-hover:text-primary-700" />
                                    <span class="group-hover:text-primary-700">
                                        {{ $t('filter') }}
                                    </span>
                                </button>
                                <!-- Rarely needed, so it sits with the filters rather than next to New note. -->
                                <button v-if="isAtLeast('Admin') || can('view_citizen_journal')"
                                    class="flex items-center gap-x-1.5 text-sm text-slate-600 hover:text-primary-700"
                                    @click="showDeletedJournalHistories">
                                    <Icon name="ph:trash" class="size-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.journalLogs.deletedNotes') }}
                                </button>
                            </div>
                            <div class="flex items-center gap-x-2 justify-end">
                                <FormButton buttonStyle="action" @click="showDownloadJournal"
                                    v-if="isAtLeast('Admin') || can('view_citizen_journal')">
                                    <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.download') }}
                                </FormButton>
                                <FormButton buttonStyle="primary" @click="state.modal.isAddJournalOpen = true"
                                    v-if="isAtLeast('Admin') || can('create_citizen_journal')">
                                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.newNote') }}
                                </FormButton>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <div class="flex flex-col md:flex-row md:items-center gap-2">
                                <FormTextField id="filter_journal" name="filter_journal"
                                    :placeholder="$t('citizens.citizenJournals.filter.searchJournal')"
                                    v-model="state.filter.journal" class="flex-1" @blur="filterJournal"
                                    @keyup.enter="filterJournal" />
                                <FormDateRangeField id="date_range" name="date_range"
                                    :placeholder="$t('citizens.citizenJournals.filter.filterDate')"
                                    v-model="state.filter.date_range" class="w-full md:w-72 h-11" />
                            </div>
                            <!-- Sort and quick filters say what they do, and show when they are on. -->
                            <div class="flex flex-wrap items-center gap-2">
                                <button type="button" :class="chipClass(false)" @click="toggleSortOrder"
                                    data-testid="journal-sort">
                                    <Icon :name="isNewestFirst ? 'ph:sort-descending' : 'ph:sort-ascending'"
                                        class="size-4" aria-hidden="true" />
                                    {{ isNewestFirst ? $t('citizens.citizenJournals.filter.newestFirst') : $t('citizens.citizenJournals.filter.oldestFirst') }}
                                </button>
                                <button type="button" :class="chipClass(!!state.dataFilter.lock)"
                                    :aria-pressed="!!state.dataFilter.lock" @click="toggleQuickFilter('lock')">
                                    <Icon name="ph:lock" class="size-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.filter.locked') }}
                                </button>
                                <button type="button" :class="chipClass(!!state.dataFilter.favorite)"
                                    :aria-pressed="!!state.dataFilter.favorite" @click="toggleQuickFilter('favorite')">
                                    <Icon name="ph:star" class="size-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.filter.favorites') }}
                                </button>
                                <button v-if="hasActiveFilters" type="button"
                                    class="ms-1 text-sm text-slate-600 underline-offset-2 hover:text-primary-700 hover:underline"
                                    @click="resetFilter">
                                    {{ $t('citizens.citizenJournals.filter.resetFilters') }}
                                </button>
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
                @close="state.modal.isAddJournalOpen = false"
                @refreshJournal="() => { fetchJournals(); pendingSurveysWarning?.refresh() }" />
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
// Answering the questionnaire inside a new note clears the warning.
const pendingSurveysWarning = ref<any>(null)
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

const isNewestFirst = computed(() => state.sortData.sortOrder !== 'ascend')

const hasActiveFilters = computed(() => !isNewestFirst.value
    || !!state.dataFilter.lock
    || !!state.dataFilter.favorite
    || !!state.filter.journal
    || !!state.filter.date_range?.length)

function chipClass(active: boolean) {
    return [
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
        active
            ? 'border-primary bg-primary text-white'
            : 'border-gray-200 bg-white text-slate-700 hover:border-primary hover:text-primary',
    ]
}

function toggleSortOrder() {
    const ascending = isNewestFirst.value
    citizenJournalStore.setSortDataBy(ascending ? 'Journal ascending' : 'Journal descending')
    currentTablePage = 1
    state.sortData = {
        sortField: 'date',
        sortOrder: ascending ? 'ascend' : 'descend',
    }
    fetchJournals()
}

// Locked and favourites can be combined, and clicking an active one turns it off again.
function toggleQuickFilter(key: 'lock' | 'favorite') {
    currentTablePage = 1
    if (state.dataFilter[key]) {
        delete state.dataFilter[key]
    } else {
        state.dataFilter[key] = true
    }
    if (state.dataFilter.lock) {
        citizenJournalStore.setFilterDataBy('Locked journals')
    } else if (state.dataFilter.favorite) {
        citizenJournalStore.setFilterDataBy('Favorite journals')
    } else {
        citizenJournalStore.resetFilterDataBy()
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