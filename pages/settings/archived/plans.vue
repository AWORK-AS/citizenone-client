<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('archived.tabs.archivedPlans') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('archived.tabs.archivedPlans') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsArchiveSubTab id="archived" class="mt-5" />

            <div class="mt-10">
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.archivedPlans"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.archivedPlans?.data?.length === 0))">
                                <tr v-for="(plan, index) in state.archivedPlans?.data" :key="index">
                                    <td width="20%">
                                        <p>
                                            {{ formatDateToReadable(plan?.date_archived) }}
                                        </p>
                                    </td>
                                    <td width="25%">
                                        <span>{{ plan?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <p>
                                            {{ plan?.owner_name }}
                                        </p>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="confirmPlanUnarchiving(plan)">
                                                <Icon name="mdi:archive-cancel-outline" class="size-4" />
                                                {{ $t('archived.table.actions.unarchive') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.archivedPlans" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isUnarchivePlanOpen"
                :message="$t('archived.confirmation.unarchivePlan') + '?'"
                @close="state.modal.isUnarchivePlanOpen = false" @confirm="unarchivePlan" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { planService } from '@/components/api/user/PlanService'
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
        name: 'archived.tabs.archivedPlans',
        translate: true,
        href: '/settings/archived/plans',
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
    archivedPlans: [] as any,
    modal: {
        isUnarchivePlanOpen: false
    },
    selectedPlan: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchArchivedPlans()
})

async function fetchArchivedPlans() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await planService.getArchivePlans(params)
        if (response) {
            state.archivedPlans = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchArchivedPlans()
}

function next() {
    currentTablePage++
    fetchArchivedPlans()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchArchivedPlans()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchArchivedPlans()
}

function confirmPlanUnarchiving(document: any) {
    state.selectedPlan = document
    state.modal.isUnarchivePlanOpen = true
}

async function unarchivePlan() {
    state.error = {}
    state.isTableLoading = true
    try {
        const planUuid = state.selectedPlan?.uuid
        const response = await planService.archiveUnarchivePlan(planUuid)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('archived.alert.planSuccessfullyUnarchive')}.`)
            fetchArchivedPlans()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>