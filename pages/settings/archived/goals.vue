<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedGoals') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('archived.tabs.archivedGoals') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsArchiveSubTab id="archived" class="mt-5" />

            <div class="mt-10">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.archivedGoals"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.archivedGoals?.data?.length === 0))">
                                <tr v-for="(goal, index) in state.archivedGoals?.data" :key="index">
                                    <td width="20%">
                                        <p>
                                            {{ formatDateToReadable(goal?.date_archived) }}
                                        </p>
                                    </td>
                                    <td width="25%">
                                        <span>{{ goal?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <p>
                                            {{ goal?.owner_name }}
                                        </p>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="confirmGoalUnarchiving(goal)">
                                                <Icon name="mdi:archive-cancel-outline" class="size-4" />
                                                {{ $t('archived.table.actions.unarchive') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.archivedGoals" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isUnarchiveGoalOpen"
                :message="$t('archived.confirmation.unarchiveGoal') + '?'"
                @close="state.modal.isUnarchiveGoalOpen = false" @confirm="unarchiveGoal" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { goalService } from '@/components/api/user/GoalService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'archived.tabs.archivedGoals',
        translate: true,
        href: '/settings/archived/goals',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'archived.table.date', isTranslateName: true, },
        { name: 'archived.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'archived.table.belongsTo', isTranslateName: true, },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    archivedGoals: [] as any,
    modal: {
        isUnarchiveGoalOpen: false
    },
    selectedGoal: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchArchivedGoals()
})

async function fetchArchivedGoals() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await goalService.getArchiveGoals(params)
        if (response) {
            state.archivedGoals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchArchivedGoals()
}

function next() {
    currentTablePage++
    fetchArchivedGoals()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchArchivedGoals()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchArchivedGoals()
}

function confirmGoalUnarchiving(document: any) {
    state.selectedGoal = document
    state.modal.isUnarchiveGoalOpen = true
}

async function unarchiveGoal() {
    state.error = {}
    state.isTableLoading = true
    try {
        const goalUuid = state.selectedGoal?.uuid
        const response = await goalService.archiveUnarchiveGoal(goalUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('archived.alert.goalSuccessfullyUnarchive')}.`)
            fetchArchivedGoals()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>