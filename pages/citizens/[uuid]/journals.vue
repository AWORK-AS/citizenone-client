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
                        <!-- Filtering used to live in three places: a Filter modal (view, tags,
                             author), the search row and the chip row, and the modal hid what was
                             on. Everything now sits here and applies at once; what narrows the
                             list is always visible and removable. Search, date and the page's
                             actions share one row instead of the actions floating alone above. -->
                        <div class="space-y-2">
                            <div class="flex flex-col lg:flex-row lg:items-center gap-2">
                                <div class="relative flex-1">
                                    <Icon name="ph:magnifying-glass" aria-hidden="true"
                                        class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                    <!-- Searches as you type; it used to wait for Enter or a click elsewhere. -->
                                    <input id="filter_journal" name="filter_journal" type="text" autocomplete="off"
                                        :placeholder="$t('citizens.citizenJournals.filter.searchJournal')"
                                        v-model="state.filter.journal" @keyup.enter="filterJournal"
                                        class="block h-11 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-900 placeholder-gray-500 focus:border-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700" />
                                    <button v-if="state.filter.journal" type="button"
                                        :aria-label="$t('citizens.citizenJournals.filter.clear')"
                                        class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-gray-100 hover:text-slate-600"
                                        @click="state.filter.journal = ''">
                                        <Icon name="ph:x" class="size-3.5" aria-hidden="true" />
                                    </button>
                                </div>
                                <div class="relative w-full lg:w-64">
                                    <Icon name="ph:calendar-blank" aria-hidden="true"
                                        class="pointer-events-none absolute left-3 top-1/2 z-20 size-4 -translate-y-1/2 text-slate-400" />
                                    <FormDateRangeField id="date_range" name="date_range"
                                        :placeholder="$t('citizens.citizenJournals.filter.filterDate')"
                                        v-model="state.filter.date_range" class="!pl-9 h-11 bg-white" />
                                </div>
                                <div class="flex items-center justify-end gap-x-2 lg:ms-2">
                                    <!-- Rarely needed, so a quiet link beside the actions. -->
                                    <button v-if="isAtLeast('Admin') || can('view_citizen_journal')"
                                        class="me-1 flex items-center gap-x-1.5 whitespace-nowrap text-sm text-slate-600 hover:text-primary-700"
                                        @click="showDeletedJournalHistories">
                                        <Icon name="ph:trash" class="size-4" aria-hidden="true" />
                                        {{ $t('citizens.citizenJournals.journalLogs.deletedNotes') }}
                                    </button>
                                    <FormButton buttonStyle="action" class="h-11" @click="showDownloadJournal"
                                        v-if="isAtLeast('Admin') || can('view_citizen_journal')">
                                        <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('citizens.citizenJournals.download') }}
                                    </FormButton>
                                    <FormButton buttonStyle="primary" class="h-11" @click="state.modal.isAddJournalOpen = true"
                                        v-if="isAtLeast('Admin') || can('create_citizen_journal')">
                                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                        {{ $t('citizens.citizenJournals.newNote') }}
                                    </FormButton>
                                </div>
                            </div>
                            <div class="flex flex-wrap items-center gap-2">
                                <ModulesUserCitizenJournalFilterDropdown icon="ph:tag"
                                    :label="term('journalNoteTag', $t('journalNoteTags.journalNoteTags'))"
                                    :options="state.options.tags" v-model="state.filter.tags" />
                                <ModulesUserCitizenJournalFilterDropdown icon="ph:user"
                                    :label="$t('journalNoteTags.createdBy')"
                                    :options="state.options.users" v-model="state.filter.created_by" />
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
                                <!-- How the list is shown, not which notes: kept apart from the filters. -->
                                <div class="ms-auto flex items-center gap-2">
                                    <button type="button" :class="chipClass(false)" @click="toggleSortOrder"
                                        data-testid="journal-sort">
                                        <Icon :name="isNewestFirst ? 'ph:sort-descending' : 'ph:sort-ascending'"
                                            class="size-4" aria-hidden="true" />
                                        {{ isNewestFirst ? $t('citizens.citizenJournals.filter.newestFirst') : $t('citizens.citizenJournals.filter.oldestFirst') }}
                                    </button>
                                    <Menu as="div" class="relative">
                                        <MenuButton :class="chipClass(false)">
                                            <Icon name="ph:eye" class="size-4" aria-hidden="true" />
                                            {{ $t('citizens.citizenJournals.filter.view') }}: {{ viewLabel(citizenJournalStore.getFilterView) }}
                                            <Icon name="ph:caret-down" class="size-3" aria-hidden="true" />
                                        </MenuButton>
                                        <MenuItems
                                            class="absolute right-0 z-30 mt-2 w-60 origin-top-right rounded-md bg-white p-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                                            <MenuItem v-for="view in VIEWS" :key="view" v-slot="{ active }">
                                                <button type="button" @click="setView(view)"
                                                    :class="[active && 'bg-gray-100', 'flex w-full items-center justify-between gap-2 rounded-md px-2 py-2.5 text-sm']">
                                                    {{ viewLabel(view) }}
                                                    <Icon v-if="citizenJournalStore.getFilterView === view" name="ph:check"
                                                        class="size-4 text-primary" aria-hidden="true" />
                                                </button>
                                            </MenuItem>
                                        </MenuItems>
                                    </Menu>
                                </div>
                            </div>
                            <div v-if="activePills.length" class="flex flex-wrap items-center gap-1.5">
                                <span v-for="pill in activePills" :key="pill.key"
                                    class="inline-flex items-center gap-1 rounded-full bg-primary-50 py-1 ps-2.5 pe-1 text-xs font-medium text-primary">
                                    {{ pill.label }}
                                    <button type="button" class="rounded-full p-0.5 hover:bg-primary-100"
                                        :aria-label="`${$t('citizens.citizenJournals.filter.clear')}: ${pill.label}`"
                                        @click="pill.remove()">
                                        <Icon name="ph:x" class="size-3" aria-hidden="true" />
                                    </button>
                                </span>
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
import { journalListFilterParams, hasActiveJournalFilters } from '@/utils/journalFilters'
import { journalNoteTagService } from '@/components/api/user/JournalNoteTagService'
import { userService } from '@/components/api/user/UserService'
import { useDepartmentStore } from '@/store/department'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

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
        tags: [] as string[],
        created_by: [] as string[],
        view: "Standard view"
    },
    isPageLoading: false,
    journals: [] as any,
    options: {
        tags: [] as { value: string, label: string }[],
        users: [] as { value: string, label: string }[],
    },
    modal: {
        isAddJournalOpen: false,
        isCopyJournalOpen: false,
        isDeleteJournalOpen: false,
        isDeletedJournalHistoriesOpen: false,
        isDownloadJournalOpen: false,
        isEditJournalOpen: false,
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
    fetchFilterOptions()

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

const departmentStore = useDepartmentStore() as any

const VIEWS = ['Standard view', 'Journal note view', 'Risk assessment view']

function viewLabel(view: string) {
    if (view === 'Journal note view') return term('journalNoteTag', t('citizens.citizenJournals.filter.journalNoteView'))
    if (view === 'Risk assessment view') return customPagesStore.getCustomPagesName?.riskAssessment
    return t('citizens.citizenJournals.filter.standardView')
}

function setView(view: string) {
    citizenJournalStore.setFilterView(view)
}

watch(() => [state.filter.tags, state.filter.created_by], ([tags, createdBy]) => {
    delete state.dataFilter.tags_uuid
    delete state.dataFilter.created_by
    Object.assign(state.dataFilter, journalListFilterParams(tags, createdBy))
    currentTablePage = 1
    fetchJournals()
})

const activePills = computed(() => {
    const pill = (list: 'tags' | 'users', key: 'tags' | 'created_by', prefix: string) =>
        state.filter[key].map((value) => ({
            key: `${key}-${value}`,
            label: `${prefix}: ${state.options[list].find((option) => option.value === value)?.label ?? value}`,
            remove: () => { state.filter[key] = state.filter[key].filter((item) => item !== value) },
        }))
    return [
        ...pill('tags', 'tags', term('journalNoteTag', t('journalNoteTags.journalNoteTags'))),
        ...pill('users', 'created_by', t('journalNoteTags.createdBy')),
    ]
})

async function fetchFilterOptions() {
    try {
        const [tags, users] = await Promise.all([
            journalNoteTagService.getAllJournalNoteTags({ department: departmentStore.getSelectedDepartmentName }),
            userService.getAllUsersWithoutAllUsersOption(),
        ])
        state.options.tags = (tags?.data ?? []).map((tag: any) => ({ value: tag?.uuid, label: tag?.name }))
        state.options.users = (users?.data ?? []).map((user: any) => ({
            value: user?.uuid,
            label: `${user?.firstname ?? ''} ${user?.lastname ?? ''}`.trim(),
        }))
    } catch (error: any) {
        state.error = error
    }
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

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(() => state.filter.journal, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(filterJournal, 300)
})

onBeforeUnmount(() => clearTimeout(searchTimer))

function filterJournal() {
    clearTimeout(searchTimer)
    if ((state.dataFilter.title ?? '') === state.filter.journal) return
    state.dataFilter.title = state.filter.journal
    currentTablePage = 1
    fetchJournals()
}

const isNewestFirst = computed(() => state.sortData.sortOrder !== 'ascend')

const hasActiveFilters = computed(() => hasActiveJournalFilters({
    sortOrder: state.sortData.sortOrder,
    lock: state.dataFilter.lock,
    favorite: state.dataFilter.favorite,
    search: state.filter.journal ?? '',
    dateRange: state.filter.date_range,
    tags: state.filter.tags,
    createdBy: state.filter.created_by,
}))

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
    state.filter.tags = []
    state.filter.created_by = []
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