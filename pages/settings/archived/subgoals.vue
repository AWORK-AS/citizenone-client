<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedSubgoals') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('archived.tabs.archivedSubgoals') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsArchiveSubTab id="archived" class="mt-5" />

            <div class="mt-10">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.archivedSubgoals"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.archivedSubgoals?.data?.length === 0))">
                                <tr v-for="(goal, index) in state.archivedSubgoals?.data" :key="index">
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
                                                @click="confirmSubgoalUnarchiving(goal)">
                                                <Icon name="mdi:archive-cancel-outline" class="size-4" />
                                                {{ $t('archived.table.actions.unarchive') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.archivedSubgoals" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isUnarchiveSubgoalOpen"
                :message="$t('archived.confirmation.unarchiveSubgoal') + '?'"
                @close="state.modal.isUnarchiveSubgoalOpen = false" @confirm="unarchiveSubgoal" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { subgoalService } from '@/components/api/user/SubgoalService'
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
        name: 'archived.tabs.archivedSubgoals',
        translate: true,
        href: '/settings/archived/subgoals',
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
    archivedSubgoals: [] as any,
    modal: {
        isUnarchiveSubgoalOpen: false
    },
    selectedSubgoal: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchArchivedSubgoals()
})

async function fetchArchivedSubgoals() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await subgoalService.getArchiveSubgoals(params)
        if (response) {
            state.archivedSubgoals = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchArchivedSubgoals()
}

function next() {
    currentTablePage++
    fetchArchivedSubgoals()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchArchivedSubgoals()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchArchivedSubgoals()
}

function confirmSubgoalUnarchiving(document: any) {
    state.selectedSubgoal = document
    state.modal.isUnarchiveSubgoalOpen = true
}

async function unarchiveSubgoal() {
    state.error = {}
    state.isTableLoading = true
    try {
        const goalUuid = state.selectedSubgoal?.uuid
        const response = await subgoalService.archiveUnarchiveSubgoal(goalUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('archived.alert.goalSuccessfullyUnarchive')}.`)
            fetchArchivedSubgoals()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>