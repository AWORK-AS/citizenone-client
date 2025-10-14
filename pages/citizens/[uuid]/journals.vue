<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.journals') }} - {{ runtimeConfig?.public?.appName }}</Title>
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

            <template #header>{{ $t('citizens.tabs.journals') }}</template>

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
                                <FormButton buttonStyle="action" class="rounded-lg"
                                    @click="state.modal.isAddJournalOpen = true">
                                    <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.newNote') }}
                                </FormButton>
                                <FormButton buttonStyle="action" class="rounded-lg" @click="showDownloadJournal">
                                    <Icon name="ph:download" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.download') }}
                                </FormButton>
                                <FormButton buttonStyle="action" class="rounded-lg"
                                    @click="showDeletedJournalHistories">
                                    <Icon name="ph:clock-clockwise" class="h-4 w-4" aria-hidden="true" />
                                    {{ $t('citizens.citizenJournals.journalLogs.deleletedNotes') }}
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
                                    'rounded-md w-full md:w-fit']" @click="sortJournalAscending('Journal ascending')">
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
                                    'rounded-md w-full md:w-fit']" @click="fetchFavoriteJournals('Favorite journals')">
                                    <Icon name="ph:star" class="size-4" />
                                </FormButton>
                                <FormButton class="rounded-md w-full md:w-fit" buttonSize="sm" @click="resetFilter">
                                    <Icon name="mdi:refresh" class="size-4" />
                                </FormButton>
                            </div>
                        </div>
                        <div class="mt-5 space-y-5">
                            <div class="bg-white ring-1 ring-gray-200 rounded-md p-5 border-l-4 border-secondary"
                                v-for="(journal, index) in state.journals?.data" :key="index">
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
                                            <div class="mt-1">
                                                <Badge type="primary" class="w-fit" v-if="journal.score">
                                                    <p class="text-xxs" v-if="journal.score === 1">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="journal.score === 2">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="journal.score === 3">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="journal.score === 4">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="journal.score === 5">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                        }}
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
                                                v-for="(journalTag, index) in journal?.journal_tags" :index="index">
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
                                                v-for="(riskTag, index) in journal?.risk_tags" :index="index">
                                                {{ riskTag?.name }}
                                            </div>
                                        </div>
                                        <div class="text-sm">
                                            <p v-for="(tooth, index) in journal?.teeth" :key="index">
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
                                                <FormButton class="rounded-md" buttonStyle="primary" buttonSize="xs"
                                                    @click="editJournal(journal)">
                                                    <Icon name="ph:pencil-duotone" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.copy')">
                                                <FormButton class="rounded-md" buttonStyle="primary" buttonSize="xs"
                                                    @click="copyJournal(journal)">
                                                    <Icon name="ph:copy" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.move')">
                                                <FormButton class="rounded-md" buttonStyle="primary" buttonSize="xs"
                                                    @click="moveJournal(journal)">
                                                    <Icon name="ph:arrows-out-cardinal" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="journal?.is_favorite ? $t('citizens.citizenJournals.actions.removeFromFavorite') : $t('citizens.citizenJournals.actions.addToFavorite')">
                                                <FormButton buttonSize="xs" :class="[
                                                    journal?.is_favorite && 'border-secondary bg-secondary text-white',
                                                    'rounded-md w-full md:w-fit']"
                                                    @click="addRemoveJournalToFavorite(journal.uuid)">
                                                    <Icon name="ph:star" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip
                                                :text="journal?.is_locked ? $t('citizens.citizenJournals.actions.unlock') : $t('citizens.citizenJournals.actions.lock')">
                                                <FormButton buttonSize="xs" :class="[
                                                    journal?.is_locked && 'border-secondary bg-secondary text-white',
                                                    'rounded-md w-full md:w-fit']"
                                                    @click="lockUnlockJournal(journal.uuid)">
                                                    <Icon name="ph:lock" class="size-4" v-if="journal.is_locked" />
                                                    <Icon name="ph:lock-open" class="size-4" v-else />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.journalLogs')">
                                                <FormButton class="rounded-md" buttonStyle="primary" buttonSize="xs"
                                                    @click="viewJournalLogs(journal)">
                                                    <Icon name="ph:clock-clockwise" class="size-4" />
                                                </FormButton>
                                            </Tooltip>
                                            <Tooltip :text="$t('citizens.citizenJournals.actions.delete')">
                                                <FormButton class="rounded-md" buttonStyle="danger" buttonSize="xs"
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
            <ModulesUserCitizenJournalModalFilter :isModalOpen="state.modal.isFilterJournalOpen"
                @close="state.modal.isFilterJournalOpen = false" @setFilter="setFilter" />
            <ModulesUserCitizenJournalModalNew :isModalOpen="state.modal.isAddJournalOpen"
                @close="state.modal.isAddJournalOpen = false" @refreshJournal="fetchJournals" />
            <ModulesUserCitizenJournalModalEdit :isModalOpen="state.modal.isEditJournalOpen"
                :selectedJournal="state.selectedJournal" @close="closeEditJournalModal"
                @refreshJournal="fetchJournals" />
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
            <DialogConfirmation :isModalOpen="state.modal.isDeleteJournalOpen"
                :message="$t('citizens.citizenJournals.confirmation.deleteConfirmation') + '?'"
                @close="state.modal.isDeleteJournalOpen = false" @confirm="deleteJournal" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { journalService } from '@/components/api/user/JournalService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCitizenJournalStore } from '@/store/citizen-journal'
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenJournalStore = useCitizenJournalStore()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const breadcrumbLinks = [
    {
        name: 'citizens.tabs.journals',
        translate: true,
        href: `/citizens/${citizenUuid}/journals`,
    },
]

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
        state.dataFilter.lock = true
    } else if (citizenJournalStore.getFilterDataBy === 'Favorite journals') {
        state.dataFilter.favorite = true
    }

    fetchJournals()
})

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

function viewJournalLogs(journal: any) {
    state.selectedJournal = journal
    state.modal.isViewLogsOpen = true
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