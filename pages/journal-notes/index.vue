<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('journalNotes.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('journalNotes.title') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="mt-8 space-y-5">
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
                                <FormButton buttonStyle="action" @click="state.modal.isAddJournalOpen = true">
                                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('journalNotes.newNote') }}
                                </FormButton>
                                <FormButton buttonStyle="action" @click="state.modal.isDeletedJournalHistoriesOpen = true">
                                    <Icon name="ph:clock-clockwise" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.journalLogs.deletedNotes') }}
                                </FormButton>
                            </div>
                        </div>

                        <div>
                            <div class="flex flex-wrap justify-end items-end gap-2">
                                <FormTextField id="filter_journal" name="filter_journal"
                                    :placeholder="$t('citizens.citizenJournals.filter.searchJournal')"
                                    v-model="state.filter.journal" class="flex-1" @blur="filterJournal"
                                    @keyup.enter="filterJournal" />
                                <FormDateRangeField id="date_range" name="date_range"
                                    :placeholder="$t('citizens.citizenJournals.filter.filterDate')"
                                    v-model="state.filter.date_range" class="w-full md:w-96 h-11" />
                                <FormButton buttonSize="sm" :class="[
                                    ['Journal ascending', ''].includes(citizenJournalStore.getSortDataBy) && 'border-secondary bg-secondary text-white',
                                    'w-full md:w-fit']" @click="sortJournalAscending('Journal ascending')">
                                    <Icon name="mdi:sort-ascending" class="size-4" />
                                </FormButton>
                                <FormButton buttonSize="sm" :class="[
                                    ['Journal descending'].includes(citizenJournalStore.getSortDataBy) && 'border-secondary bg-secondary text-white',
                                    'w-full md:w-fit']" @click="sortJournalDescending('Journal descending')">
                                    <Icon name="mdi:sort-descending" class="size-4" />
                                </FormButton>
                                <FormButton buttonSize="sm" :class="[
                                    citizenJournalStore.getFilterDataBy === 'Locked journals' && 'border-secondary bg-secondary text-white',
                                    'w-full md:w-fit']" @click="fetchLockedJournals('Locked journals')">
                                    <Icon name="ph:lock" class="size-4" />
                                </FormButton>
                                <FormButton buttonSize="sm" :class="[
                                    citizenJournalStore.getFilterDataBy === 'Favorite journals' && 'border-secondary bg-secondary text-white',
                                    'w-full md:w-fit']" @click="fetchFavoriteJournals('Favorite journals')">
                                    <Icon name="ph:star" class="size-4" />
                                </FormButton>
                                <FormButton class="w-full md:w-fit" buttonSize="sm" @click="resetFilter">
                                    <Icon name="mdi:refresh" class="size-4" />
                                </FormButton>
                            </div>
                        </div>

                        <div class="mt-5 space-y-5">
                            <div :class="[
                                'bg-white ring-1 rounded-md p-5 border-l-4',
                                journal.is_pinned ? 'ring-primary/40 border-primary' : 'ring-gray-200 border-secondary'
                            ]" v-for="(journal, index) in state.journals?.data" :key="index"
                                :data-uuid="journal.uuid">
                                <div class="space-y-3">
                                    <div class="space-y-1.5">
                                        <div>
                                            <div class="flex items-center gap-x-3 justify-between">
                                                <div class="flex items-center gap-x-3 flex-wrap">
                                                    <NuxtLink
                                                        :to="'/citizens/' + journal.citizen?.uuid + '/journals'"
                                                        class="text-sm font-medium text-primary hover:text-primary-700">
                                                        {{ journal.citizen?.firstname }} {{ journal.citizen?.lastname }}
                                                    </NuxtLink>
                                                    <h3 class="text-md font-semibold">
                                                        {{ journal.title }}
                                                    </h3>
                                                    <div v-if="journal.is_pinned"
                                                        class="flex items-center gap-x-1 text-primary text-xs font-medium">
                                                        <Icon name="ph:push-pin-fill" class="size-3.5" />
                                                    </div>
                                                    <div v-if="journal.is_draft">
                                                        <Badge type="primary">
                                                            <p class="text-xs">
                                                                {{ $t('citizens.citizenJournals.form.draft') }}
                                                            </p>
                                                        </Badge>
                                                    </div>
                                                    <div v-if="journal.is_ai_used">
                                                        <span
                                                            class="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xxs font-medium text-violet-700">
                                                            <Icon name="ph:sparkle-fill" class="size-3 shrink-0" />
                                                            {{ $t('citizens.citizenJournals.aiUsed') }}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div
                                                    v-if="['Standard view', 'Risk assessment view'].includes(citizenJournalStore.getFilterView)">
                                                    <Badge type="no-risk" v-if="journal.assessment === 'no risk'">
                                                        <p class="text-xs">
                                                            {{ $t('citizens.citizenJournals.form.risk.noRisk') }}
                                                        </p>
                                                    </Badge>
                                                    <Badge type="increased-risk"
                                                        v-if="journal.assessment === 'increased risk'">
                                                        <p class="text-xs">
                                                            {{ $t('citizens.citizenJournals.form.risk.increasedRisk') }}
                                                        </p>
                                                    </Badge>
                                                    <Badge type="acute-increased-risk"
                                                        v-if="journal.assessment === 'acute increased risk'">
                                                        <p class="text-xs">
                                                            {{ $t('citizens.citizenJournals.form.risk.acuteIncreasedRisk') }}
                                                        </p>
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p class="mt-1 text-xs text-muted-400">
                                                <span>{{ formatDateToReadable(journal.date) }}</span>
                                            </p>
                                            <div class="mt-1">
                                                <Badge type="primary" class="w-fit" v-if="journal.score">
                                                    <p class="text-xxs" v-if="journal.score === 1">
                                                        {{ $t('plansandgoals.table.expectedLevels.minorChallenges') }}
                                                    </p>
                                                    <p class="text-xxs" v-if="journal.score === 2">
                                                        {{ $t('plansandgoals.table.expectedLevels.moderateChallenges') }}
                                                    </p>
                                                    <p class="text-xxs" v-if="journal.score === 3">
                                                        {{ $t('plansandgoals.table.expectedLevels.significantChallenges') }}
                                                    </p>
                                                    <p class="text-xxs" v-if="journal.score === 4">
                                                        {{ $t('plansandgoals.table.expectedLevels.severeChallenges') }}
                                                    </p>
                                                    <p class="text-xxs" v-if="journal.score === 5">
                                                        {{ $t('plansandgoals.table.expectedLevels.verySubstantialChallenges') }}
                                                    </p>
                                                </Badge>
                                            </div>
                                        </div>
                                        <p class="text-sm text-muted-400"
                                            v-if="['Standard view', 'Journal note view'].includes(citizenJournalStore.getFilterView)">
                                            <div v-html="journal.content" class="content" />
                                        </p>
                                        <div class="flex items-center gap-x-1"
                                            v-if="['Standard view', 'Journal note view'].includes(citizenJournalStore.getFilterView)">
                                            <div class="px-2 py-1 rounded-full text-white text-xxs"
                                                :style="`background:${journalTag?.color};`"
                                                v-for="(journalTag, tagIndex) in journal?.journal_tags"
                                                :key="tagIndex">
                                                {{ journalTag?.name }}
                                            </div>
                                        </div>
                                        <div class="text-sm text-muted-400"
                                            v-if="['Standard view', 'Risk assessment view'].includes(citizenJournalStore.getFilterView)">
                                            <p class="font-semibold">
                                                {{ customPagesStore.getCustomPagesName?.riskAssessment }}:
                                            </p>
                                            <div v-html="journal.note" class="content" />
                                        </div>
                                        <div class="flex items-center gap-x-1"
                                            v-if="['Standard view', 'Risk assessment view'].includes(citizenJournalStore.getFilterView)">
                                            <div class="px-2 py-1 rounded-full text-white text-xxs"
                                                :style="`background:${riskTag?.color};`"
                                                v-for="(riskTag, riskIndex) in journal?.risk_tags"
                                                :key="riskIndex">
                                                {{ riskTag?.name }}
                                            </div>
                                        </div>
                                        <div class="text-sm">
                                            <p v-for="(tooth, toothIndex) in journal?.teeth" :key="toothIndex">
                                                {{ tooth?.number }}.
                                                {{ language.locale.value === 'en' ? tooth?.en_name : tooth?.dk_name }}
                                            </p>
                                        </div>
                                        <p class="text-xs">
                                            {{ $t('citizens.citizenJournals.createdBy') }}:
                                            {{ journal.user?.firstname }} {{ journal.user?.lastname }}
                                            <span class="lowercase">{{ $t('citizens.citizenJournals.on') }}</span>
                                            {{ formatDateTimeToReadable(journal.created_at) }}
                                        </p>
                                    </div>
                                    <div class="ms-auto">
                                        <div class="flex items-center gap-x-2">
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.edit')"
                                                v-if="journal?.is_editable">
                                                <FormButton buttonStyle="primary" buttonSize="xs"
                                                    @click="editJournal(journal)">
                                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.copy')"
                                                v-if="journal?.is_copyable">
                                                <FormButton buttonStyle="primary" buttonSize="xs"
                                                    @click="copyJournal(journal)">
                                                    <Icon name="ph:copy" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.move')"
                                                v-if="journal?.is_movable">
                                                <FormButton buttonStyle="primary" buttonSize="xs"
                                                    @click="moveJournal(journal)">
                                                    <Icon name="ph:arrows-out-cardinal" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="journal?.is_favorite ? $t('citizens.citizenJournals.actions.removeFromFavorite') : $t('citizens.citizenJournals.actions.addToFavorite')">
                                                <FormButton buttonSize="xs" :class="[
                                                    journal?.is_favorite && 'border-secondary bg-secondary text-white',
                                                    'w-full md:w-fit']"
                                                    @click="addRemoveJournalToFavorite(journal.uuid)">
                                                    <Icon name="ph:star" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="journal?.is_locked ? $t('citizens.citizenJournals.actions.unlock') : $t('citizens.citizenJournals.actions.lock')">
                                                <FormButton buttonSize="xs" :class="[
                                                    journal?.is_locked && 'border-secondary bg-secondary text-white',
                                                    'w-full md:w-fit']" @click="lockUnlockJournal(journal.uuid)">
                                                    <Icon name="ph:lock" class="size-4" v-if="journal.is_locked" />
                                                    <Icon name="ph:lock-open" class="size-4" v-else />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="journal?.is_pinned ? $t('citizens.citizenJournals.actions.unpin') : $t('citizens.citizenJournals.actions.pin')">
                                                <FormButton buttonSize="xs" :class="[
                                                    journal?.is_pinned && 'border-primary bg-primary text-white',
                                                    'w-full md:w-fit']" @click="pinUnpinJournal(journal.uuid)">
                                                    <Icon name="ph:push-pin-fill" class="size-4"
                                                        v-if="journal.is_pinned" />
                                                    <Icon name="ph:push-pin" class="size-4" v-else />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.journalLogs')">
                                                <FormButton buttonStyle="primary" buttonSize="xs"
                                                    @click="viewJournalLogs(journal)">
                                                    <Icon name="ph:clock-clockwise" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.delete')">
                                                <FormButton buttonStyle="danger" buttonSize="xs"
                                                    @click="confirmJournalDeletion(journal)"
                                                    v-if="journal?.is_deletable">
                                                    <Icon name="ph:trash-duotone" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
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

            <ModulesUserJournalNotesModalFilter :isModalOpen="state.modal.isFilterJournalOpen"
                :citizenOptions="state.citizenOptions" @close="state.modal.isFilterJournalOpen = false"
                @setFilter="setFilter" />
            <ModulesUserJournalNotesModalNew :isModalOpen="state.modal.isAddJournalOpen"
                :citizenOptions="state.citizenOptions" @close="state.modal.isAddJournalOpen = false"
                @refreshJournal="fetchJournals" />
            <ModulesUserCitizenJournalModalEdit :isModalOpen="state.modal.isEditJournalOpen"
                :selectedJournal="state.selectedJournal" @close="closeEditJournalModal"
                @refreshJournal="fetchJournals" />
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
            <DialogConfirmation :isModalOpen="state.modal.isDeleteJournalOpen"
                :message="$t('citizens.citizenJournals.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteJournalOpen = false" @confirm="deleteJournal" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { citizenService } from '@/components/api/user/CitizenService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useAlert } from '@/composables/alert'
import { useCitizenJournalStore } from '@/store/citizen-journal'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useDepartmentStore } from '@/store/department'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
const citizenJournalStore = useCitizenJournalStore()
const departmentStore = useDepartmentStore()
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'journalNotes.title',
        translate: true,
        href: '/journal-notes',
    },
]

const state = reactive({
    citizenOptions: [] as any,
    dataFilter: [] as any,
    error: {} as Error,
    filter: {
        date_range: [] as any,
        journal: '' as any,
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
    },
    selectedJournal: [] as any,
    sortData: {
        sortField: 'date',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    if (citizenJournalStore.getSortDataBy === 'Journal ascending') {
        state.sortData = { sortField: 'date', sortOrder: 'ascend' }
    } else if (citizenJournalStore.getSortDataBy === 'Journal descending') {
        state.sortData = { sortField: 'date', sortOrder: 'descend' }
    }

    if (citizenJournalStore.getFilterDataBy === 'Locked journals') {
        state.dataFilter.lock = true
    } else if (citizenJournalStore.getFilterDataBy === 'Favorite journals') {
        state.dataFilter.favorite = true
    }

    fetchJournals()
    fetchAllCitizens()
})

watch(() => departmentStore.getSelectedDepartmentName, (newValue: any) => {
    if (newValue != null) {
        currentTablePage = 1
        fetchJournals()
    }
})

watch(() => state.filter.date_range, (dates: any) => {
    state.dataFilter.start_date = dates?.[0]
    state.dataFilter.end_date = dates?.[1]
    fetchJournals()
})

function setFilter(filter: any) {
    citizenJournalStore.setFilterView(filter.selectedView.title)
    state.dataFilter.tagsUuid = JSON.stringify(filter.tags)
    state.dataFilter.createdBy = JSON.stringify(filter.created_by)
    state.dataFilter.citizen_uuid = filter.citizens?.[0] ?? ''
    state.dataFilter.citizen_name = ''
    state.dataFilter.department = filter.departments?.[0] ?? ''
    state.dataFilter.assessment = filter.assessment ?? ''
    fetchJournals()
}

async function fetchJournals() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            page: currentTablePage,
            sort_field: state.sortData.sortField,
            sort_order: state.sortData.sortOrder === 'ascend' ? 'asc' : 'desc',
            department: departmentStore.getSelectedDepartmentName,
            ...state.dataFilter
        }
        const response = await journalService.getJournalsOverview(params)
        if (response) {
            state.journals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function fetchAllCitizens() {
    try {
        const response = await citizenService.getAllCitizens({})
        if (response?.data) {
            state.citizenOptions = response.data.map((citizen: any) => ({
                value: citizen?.uuid,
                label: `${citizen?.firstname} ${citizen?.lastname}`,
            }))
        }
    } catch {
        // silently ignore - citizens list is optional for filters
    }
}

function filterJournal() {
    state.dataFilter.title = state.filter.journal
    fetchJournals()
}

function sortJournalAscending(filterDataBy: any) {
    citizenJournalStore.setSortDataBy(filterDataBy)
    currentTablePage = 1
    state.sortData = { sortField: 'date', sortOrder: 'ascend' }
    fetchJournals()
}

function sortJournalDescending(filterDataBy: any) {
    citizenJournalStore.setSortDataBy(filterDataBy)
    currentTablePage = 1
    state.sortData = { sortField: 'date', sortOrder: 'descend' }
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
    state.sortData = { sortField: 'date', sortOrder: 'descend' }
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
    state.modal.isEditJournalOpen = true
}

function closeEditJournalModal() {
    state.modal.isEditJournalOpen = false
    state.selectedJournal = []
}

function copyJournal(journal: any) {
    state.selectedJournal = journal
    state.modal.isCopyJournalOpen = true
}

function moveJournal(journal: any) {
    state.selectedJournal = journal
    state.modal.isMoveJournalOpen = true
}

function viewJournalLogs(journal: any) {
    state.selectedJournal = journal
    state.modal.isViewLogsOpen = true
}

function confirmJournalDeletion(journal: any) {
    state.selectedJournal = journal
    state.modal.isDeleteJournalOpen = true
}

async function addRemoveJournalToFavorite(journalUuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await journalService.updateJournalFavorite(journalUuid)
        if (response?.data) {
            fetchJournals()
            successAlert(`${t('alert.success')}!`, response?.data?.is_favorite
                ? `${t('citizens.citizenJournals.alert.addedToFavorites')}.`
                : `${t('citizens.citizenJournals.alert.removedToFavorites')}.`)
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
            successAlert(`${t('alert.success')}!`, response?.data?.is_locked
                ? `${t('citizens.citizenJournals.alert.lockJournal')}.`
                : `${t('citizens.citizenJournals.alert.unlockJournal')}.`)
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
            successAlert(`${t('alert.success')}!`, response?.data?.is_pinned
                ? `${t('citizens.citizenJournals.alert.pinJournal')}.`
                : `${t('citizens.citizenJournals.alert.unpinJournal')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
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
