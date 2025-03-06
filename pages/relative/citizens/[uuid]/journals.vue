<template>
    <div>
        <NuxtLayout name="relative">

            <Head>
                <Title>{{ $t('citizens.tabs.journals') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbRelative :links="breadcrumbLinks">
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/relative/citizens')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ customPagesStore.getCustomPagesName?.citizens }}
                            </button>
                        </div>
                    </template>
                </BreadcrumbRelative>
            </template>

            <template #header>{{ $t('citizens.tabs.journals') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/relative/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesRelativeCitizenDetailsHeader />
                <!-- <ModulesRelativeCitizenJournalTabs /> -->

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
                        </div>

                        <div>
                            <div class="flex flex-wrap justify-end items-end gap-2">
                                <FormTextField id="filter_journal" name="filter_journal"
                                    :placeholder="$t('citizens.citizenJournals.filter.searchJournal')"
                                    v-model="state.filter.journal" class="flex-1" @blur="filterJournal"
                                    @keyup.enter="filterJournal" />
                                <FormDateRangeField id="date_range" name="date_range"
                                    :placeholder="$t('citizens.citizenJournals.filter.filterDate')"
                                    v-model="state.filter.date_range" class="w-full md:w-96 h-11"
                                    @change="filterJournalByDate" />
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
                                        <p class="text-xs">
                                            {{ $t('citizens.citizenJournals.createdBy') }}:
                                            {{ journal.user?.firstname }} {{ journal.user?.lastname }}
                                            <span class="lowercase">{{ $t('citizens.citizenJournals.on') }}</span>
                                            {{ formatDateTimeToReadable(journal.created_at) }}
                                        </p>
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
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { journalService } from '@/components/api/relative/JournalService'
import { useCitizenJournalStore } from '@/store/citizen-journal'
import type { Error } from '@/types'
import { useCustomPagesStore } from '@/store/custom-pages'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const customPagesStore = useCustomPagesStore() as any
const router = useRouter()
const citizenJournalStore = useCitizenJournalStore()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'citizens.tabs.journals',
        translate: true,
        href: `/relative/citizens/${citizenUuid}/journals`,
    },
]

const state = reactive({
    dataFilter: [] as any,
    error: {} as Error,
    filter: {
        date_range: null as any,
        journal: '' as any,
        view: "Standard view"
    },
    isPageLoading: false,
    journals: [] as any,
    modal: {
        isAddJournalOpen: false,
        isDeleteJournalOpen: false,
        isDownloadJournalOpen: false,
        isEditJournalOpen: false,
        isFilterJournalOpen: false,
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

function setFilter(filter: any) {
    citizenJournalStore.setFilterView(filter.selectedView.title)
    state.dataFilter.tags_uuid = JSON.stringify(filter.tags)
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

function filterJournal() {
    state.dataFilter.title = state.filter.journal
    fetchJournals()
}

function filterJournalByDate(event: any) {
    const dateRange = event.target.value
    const dates = dateRange.split(" to ")
    const startDate = moment(dates[0], "DD. MMMM YYYY").format("YYYY-MM-DD")
    const endDate = dates[1] ? moment(dates[1], "DD. MMMM YYYY").format("YYYY-MM-DD") : startDate
    if (startDate && endDate) {
        state.dataFilter.start_date = startDate
        state.dataFilter.end_date = endDate
        fetchJournals()
    }
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
    state.filter.date_range = null
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
</script>