<template>
    <div>
        <Modal size="3xl" :title="$t('citizens.citizenJournals.journalLogs.journalLogs')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="table-responsive">
                    <Table :columnHeaders="state.columnHeaders" :data="state.journalLogs"
                        :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                        <template #body v-if="!(state.isTableLoading || (state.journalLogs?.data?.length === 0))">
                            <tr v-for="(log, index) in state.journalLogs?.data" :key="index">
                                <td width="25%">
                                    <span>{{ log?.created_at ? formatDateTimeToReadable(log.created_at) : '' }}</span>
                                </td>
                                <td width="50%" class="pr-0">
                                    <div :class="expandedDescription[index] ? '' : 'line-clamp-2'">
                                        <div class="bg-green-200 rounded-md space-y-1.5 p-4">
                                            <div>
                                                <p class="text-sm font-semibold">
                                                    {{ $t('citizens.citizenJournals.journalLogs.newData') }}
                                                </p>
                                                <div class="flex items-center gap-x-3 justify-between">
                                                    <div class="flex items-center gap-x-3">
                                                        <h3 class="text-md font-semibold">
                                                            {{ getNewData(log)?.title }}
                                                        </h3>
                                                        <div v-if="getNewData(log)?.is_draft">
                                                            <Badge type="primary">
                                                                <p class="text-xxs">
                                                                    {{ $t('citizens.citizenJournals.form.draft') }}
                                                                </p>
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Badge type="no-risk"
                                                            v-if="getNewData(log)?.assessment === 'no risk'">
                                                            <p class="text-xxs">
                                                                {{ $t('citizens.citizenJournals.form.risk.noRisk') }}
                                                            </p>
                                                        </Badge>
                                                        <Badge type="increased-risk"
                                                            v-if="getNewData(log)?.assessment === 'increased risk'">
                                                            <p class="text-xxs">
                                                                {{
                                                                    $t('citizens.citizenJournals.form.risk.increasedRisk')
                                                                }}
                                                            </p>
                                                        </Badge>
                                                        <Badge type="acute-increased-risk"
                                                            v-if="getNewData(log)?.assessment === 'acute increased risk'">
                                                            <p class="text-xxs">
                                                                {{
                                                                    $t('citizens.citizenJournals.form.risk.acuteIncreasedRisk')
                                                                }}
                                                            </p>
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p class="mt-1 text-xs text-muted-400">
                                                    <span>{{ formatDateToReadable(getNewData(log)?.date)
                                                        }}</span>
                                                </p>
                                            </div>
                                            <div class="mt-1">
                                                <Badge type="primary" class="w-fit" v-if="getNewData(log)?.score">
                                                    <p class="text-xxs" v-if="getNewData(log)?.score === 1">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="getNewData(log)?.score === 2">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="getNewData(log)?.score === 3">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="getNewData(log)?.score === 4">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="getNewData(log)?.score === 5">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                        }}
                                                    </p>
                                                </Badge>
                                            </div>
                                            <p class="text-sm text-muted-400">
                                                <div v-html="getNewData(log)?.content" class="content" />
                                            </p>
                                            <div class="flex items-center gap-x-1">
                                                <div class="px-2 py-1 rounded-full text-white text-xxs"
                                                    :style="`background:${journalTag?.color};`"
                                                    v-for="(journalTag, index) in getNewData(log)?.journal_tags"
                                                    :index="index">
                                                    {{ journalTag?.name }}
                                                </div>
                                            </div>
                                            <div class="text-sm text-muted-400">
                                                <p class="font-semibold">
                                                    {{ customPagesStore.getCustomPagesName?.riskAssessment }}:
                                                </p>
                                                <div v-html="getNewData(log)?.note" class="content" />
                                            </div>
                                            <div class="flex items-center gap-x-1">
                                                <div class="px-2 py-1 rounded-full text-white text-xxs"
                                                    :style="`background:${riskTag?.color};`"
                                                    v-for="(riskTag, index) in getNewData(log)?.risk_tags"
                                                    :index="index">
                                                    {{ riskTag?.name }}
                                                </div>
                                            </div>
                                            <div class="text-sm">
                                                <p v-for="(tooth, index) in getNewData(log)?.teeth" :key="index">
                                                    {{ tooth?.number }}.
                                                    {{ language.locale.value === 'en' ? tooth?.en_name : tooth?.dk_name
                                                    }}
                                                </p>
                                            </div>
                                            <p class="text-xs">
                                                {{ $t('citizens.citizenJournals.createdBy') }}:
                                                {{ getNewData(log)?.user?.firstname }} {{
                                                    getNewData(log)?.user?.lastname }}
                                                <span class="lowercase">{{ $t('citizens.citizenJournals.on') }}</span>
                                                {{ formatDateTimeToReadable(getNewData(log)?.created_at) }}
                                            </p>
                                        </div>
                                        <div class="bg-yellow-100 rounded-md space-y-1.5 p-4 mt-3">
                                            <div>
                                                <p class="text-sm font-semibold">
                                                    {{ $t('citizens.citizenJournals.journalLogs.previousData') }}
                                                </p>
                                                <div class="flex items-center gap-x-3 justify-between">
                                                    <div class="flex items-center gap-x-3">
                                                        <h3 class="text-md font-semibold">
                                                            {{ getOldData(log)?.title }}
                                                        </h3>
                                                        <div v-if="getOldData(log)?.is_draft">
                                                            <Badge type="primary">
                                                                <p class="text-xxs">
                                                                    {{ $t('citizens.citizenJournals.form.draft') }}
                                                                </p>
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Badge type="no-risk"
                                                            v-if="getOldData(log)?.assessment === 'no risk'">
                                                            <p class="text-xxs">
                                                                {{ $t('citizens.citizenJournals.form.risk.noRisk') }}
                                                            </p>
                                                        </Badge>
                                                        <Badge type="increased-risk"
                                                            v-if="getOldData(log)?.assessment === 'increased risk'">
                                                            <p class="text-xxs">
                                                                {{
                                                                    $t('citizens.citizenJournals.form.risk.increasedRisk')
                                                                }}
                                                            </p>
                                                        </Badge>
                                                        <Badge type="acute-increased-risk"
                                                            v-if="getOldData(log)?.assessment === 'acute increased risk'">
                                                            <p class="text-xxs">
                                                                {{
                                                                    $t('citizens.citizenJournals.form.risk.acuteIncreasedRisk')
                                                                }}
                                                            </p>
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p class="mt-1 text-xs text-muted-400">
                                                    <span>{{ formatDateToReadable(getOldData(log)?.date)
                                                        }}</span>
                                                </p>
                                            </div>
                                            <div class="mt-1">
                                                <Badge type="primary" class="w-fit" v-if="getOldData(log)?.score">
                                                    <p class="text-xxs" v-if="getOldData(log)?.score === 1">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.minorChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="getOldData(log)?.score === 2">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.moderateChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="getOldData(log)?.score === 3">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.significantChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="getOldData(log)?.score === 4">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.severeChallenges')
                                                        }}
                                                    </p>
                                                    <p class="text-xxs" v-if="getOldData(log)?.score === 5">
                                                        {{
                                                            $t('plansandgoals.table.expectedLevels.verySubstantialChallenges')
                                                        }}
                                                    </p>
                                                </Badge>
                                            </div>
                                            <p class="text-sm text-muted-400">
                                                <div v-html="getOldData(log)?.content" class="content" />
                                            </p>
                                            <div class="flex items-center gap-x-1">
                                                <div class="px-2 py-1 rounded-full text-white text-xxs"
                                                    :style="`background:${journalTag?.color};`"
                                                    v-for="(journalTag, index) in getOldData(log)?.journal_tags"
                                                    :index="index">
                                                    {{ journalTag?.name }}
                                                </div>
                                            </div>
                                            <div class="text-sm text-muted-400">
                                                <p class="font-semibold">
                                                    {{ customPagesStore.getCustomPagesName?.riskAssessment }}:
                                                </p>
                                                <div v-html="getOldData(log)?.note" class="content" />
                                            </div>
                                            <div class="flex items-center gap-x-1">
                                                <div class="px-2 py-1 rounded-full text-white text-xxs"
                                                    :style="`background:${riskTag?.color};`"
                                                    v-for="(riskTag, index) in getOldData(log)?.risk_tags"
                                                    :index="index">
                                                    {{ riskTag?.name }}
                                                </div>
                                            </div>
                                            <div class="text-sm">
                                                <p v-for="(tooth, index) in getOldData(log)?.teeth" :key="index">
                                                    {{ tooth?.number }}.
                                                    {{ language.locale.value === 'en' ? tooth?.en_name : tooth?.dk_name
                                                    }}
                                                </p>
                                            </div>
                                            <p class="text-xs">
                                                {{ $t('citizens.citizenJournals.createdBy') }}:
                                                {{ getOldData(log)?.user?.firstname }} {{
                                                    getOldData(log)?.user?.lastname }}
                                                <span class="lowercase">{{ $t('citizens.citizenJournals.on') }}</span>
                                                {{ formatDateTimeToReadable(getOldData(log)?.created_at) }}
                                            </p>
                                        </div>
                                    </div>
                                    <button @click="toggleExpanded(index)"
                                        class="mt-3 text-primary text-sm hover:text-primary-700">
                                        {{ expandedDescription[index] ?
                                            $t('showLess') :
                                            $t('showMore') }}
                                    </button>
                                </td>
                                <td width="25%">
                                    <span>{{ log.causer?.firstname + ' ' + log.causer?.lastname }}</span>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.journalLogs" @previous="previous" @next="next" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { journalService } from '@/components/api/user/JournalService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useCustomPagesStore } from '@/store/custom-pages'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedJournal: {
        type: Object,
        required: true
    }
})
const emit = defineEmits(['close'])
const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const customPagesStore = useCustomPagesStore() as any
const language = useI18n()
const expandedDescription = reactive([] as boolean[])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'citizens.citizenJournals.journalLogs.date', sorter: true, key: 'ß' },
        { name: 'citizens.citizenJournals.journalLogs.description' },
        { name: 'citizens.citizenJournals.journalLogs.updatedBy' },
    ],
    error: {} as Error,
    isTableLoading: false,
    journalLogs: [] as any,
    showExpandedDescription: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchJournalLogs()
    }
})

function closeModal() {
    emit('close')
}

async function fetchJournalLogs() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            model_uuid: props.selectedJournal?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
        }
        const response = await journalService.getJournalLogs(params)
        if (response) {
            state.journalLogs = response
            expandedDescription.splice(0, expandedDescription.length, ...response.data.map(() => false))
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchJournalLogs()
}

function next() {
    currentTablePage++
    fetchJournalLogs()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchJournalLogs()
}

function getNewData(log: any) {
    try {
        return JSON.parse(log?.new_data || '{}')
    } catch {
        return {}
    }
}

function getOldData(log: any) {
    try {
        return JSON.parse(log?.old_data || '{}')
    } catch {
        return {}
    }
}

function toggleExpanded(index: number) {
    expandedDescription[index] = !expandedDescription[index]
}
</script>