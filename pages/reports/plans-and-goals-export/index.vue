<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('plansAndGoalsExport.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('plansAndGoalsExport.title') }}</template>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <div class="space-y-5" v-if="canAccess">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="text-sm text-gray-600">
                    {{ $t('plansAndGoalsExport.description') }}
                </p>

                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <TableSearch @search="handleSearch" />
                    <div class="flex items-center gap-3">
                        <span class="text-xs font-medium text-gray-500 whitespace-nowrap">
                            <template v-if="state.selectedCitizens.length > 0">
                                {{ $t('plansAndGoalsExport.selectedCount', { count: state.selectedCitizens.length }) }}
                            </template>
                            <template v-else>
                                {{ $t('plansAndGoalsExport.noneSelectedHint') }}
                            </template>
                        </span>
                        <FormButton v-if="state.selectedCitizens.length > 0" buttonStyle="cancel"
                            @click="clearSelection">
                            {{ $t('plansAndGoalsExport.clearSelection') }}
                        </FormButton>
                        <FormButton buttonStyle="primary" :disabled="state.isDownloading" @click="downloadBulk">
                            <Icon v-if="state.isDownloading" name="ph:spinner" class="h-4 w-4 animate-spin" />
                            <Icon v-else name="ph:download-simple" class="h-4 w-4" />
                            {{ state.isDownloading ? $t('plansAndGoalsExport.downloading') : $t('plansAndGoalsExport.download') }}
                        </FormButton>
                    </div>
                </div>

                <div class="table-responsive">
                    <Table :key="tableKey" :columnHeaders="state.columnHeaders" :data="state.citizens"
                        :isLoading="state.isTableLoading" :selection="true" rowKey="uuid"
                        @selection-change="onSelectionChange">
                        <template #body="{ selectedRows, handleRowSelect }"
                            v-if="!(state.isTableLoading || (state.citizens?.data?.length === 0))">
                            <tr v-for="(citizen, index) in state.citizens?.data" :key="index">
                                <td width="50">
                                    <input type="checkbox"
                                        :checked="selectedRows.some((row: any) => row.uuid === citizen.uuid)"
                                        @change="handleRowSelect(citizen)"
                                        class="peer w-5 h-5 appearance-none border bg-white border-primary rounded-sm checked:bg-secondary checked:border-secondary focus:ring-0 cursor-pointer" />
                                </td>
                                <td width="40%">
                                    <span>{{ citizen?.firstname }} {{ citizen?.lastname }}</span>
                                </td>
                                <td width="60%">
                                    <span>{{ citizen?.departments?.map((department: any) => department.name).join(', ') || '-' }}</span>
                                </td>
                            </tr>
                        </template>
                    </Table>
                </div>
                <Pagination :data="state.citizens" @previous="previous" @next="next" />
            </div>
            <Alert v-else-if="userStore.getUser" type="danger" :text="$t('plansAndGoalsExport.noPermission')" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { planService } from '@/components/api/user/PlanService'
import { usePermissions } from '@/composables/usePermissions'
import { useUserStore } from '@/store/user'
import { useI18n } from 'vue-i18n'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { isAtLeast, can } = usePermissions()
const userStore = useUserStore()
let currentTablePage = 1
const tableKey = ref(0)

const breadcrumbLinks = [
    { name: 'plansAndGoalsExport.title', translate: true, href: '/reports/plans-and-goals-export' },
]

// The layout fetches the current user asynchronously on mount, so the store
// is not populated yet when this page mounts - a computed (rather than a
// one-shot check in onMounted) re-evaluates once it lands instead of
// wrongly denying access on the first render.
const canAccess = computed(() => isAtLeast('Admin') || can('save_and_download_citizen_plan'))

onMounted(() => {
    fetchCitizens()
})

const state = reactive({
    columnHeaders: [
        { name: 'plansAndGoalsExport.table.name', isTranslateName: true, sorter: false, key: 'firstname' },
        { name: 'plansAndGoalsExport.table.departments', isTranslateName: true, sorter: false, key: 'departments' },
    ],
    dataFilter: {
        search: [] as any,
    },
    citizens: [] as any,
    selectedCitizens: [] as any[],
    error: {} as Error,
    isTableLoading: false,
    isDownloading: false,
})

function buildParams() {
    const params: any = {
        page: currentTablePage,
    }
    if (state.dataFilter.search && state.dataFilter.search.length > 0) {
        params.search = state.dataFilter.search
    }
    return params
}

async function fetchCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await citizenService.getCitizens(buildParams())
        if (response) {
            state.citizens = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function onSelectionChange(selectedRows: any[]) {
    state.selectedCitizens = selectedRows
}

function clearSelection() {
    state.selectedCitizens = []
    // The table keeps its own checked-rows state internally with no reset
    // method exposed, so a fresh key forces a clean remount instead.
    tableKey.value++
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchCitizens()
}

function previous() {
    currentTablePage--
    fetchCitizens()
}

function next() {
    currentTablePage++
    fetchCitizens()
}

async function downloadBulk() {
    state.error = {}
    state.isDownloading = true
    try {
        const citizenUuids = state.selectedCitizens.map((citizen: any) => citizen.uuid)
        const blob = await planService.downloadBulkPlansAndGoals(citizenUuids)
        if (blob) {
            const today = new Date().toISOString().slice(0, 10)
            saveAs(blob, `Plans-and-goals-bulk-${today}.zip`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isDownloading = false
}
</script>
