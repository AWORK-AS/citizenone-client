<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('normPeriod.normPeriod') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('normPeriod.normPeriod') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/norm-periods/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('normPeriod.newNormPeriod') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.normPeriods"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.normPeriods?.data?.length === 0))">
                                <tr v-for="(normPeriod, index) in state.normPeriods?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ normPeriod?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ normPeriod?.period_range }}</span>
                                    </td>
                                    <td width="20%" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div class="text-xxs flex flex-wrap gap-1">
                                            <span v-for="(department, index) in normPeriod?.departments" :key=index
                                                class=" px-2 py-1 text-white rounded-md"
                                                :style="{ backgroundColor: department?.color }">
                                                {{ department?.name }}
                                            </span>
                                        </div>
                                    </td>
                                    <td width="20%">
                                        <span>{{ normPeriod?.description }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/norm-periods/${normPeriod.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('normPeriod.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteNormPeriodConfirmation(normPeriod)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('normPeriod.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.normPeriods" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteNormPeriodOpen"
                :message="$t('normPeriod.table.confirmation.deleteNormPeriodConfirmation')"
                @close="state.modal.isDeleteNormPeriodOpen = false" @confirm="deleteNormPeriod" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { normPeriodService } from '@/components/api/user/NormPeriodService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'normPeriod.normPeriod',
        translate: true,
        href: '/settings/norm-periods',
    },
]

const state = reactive({
    normPeriods: [] as any,
    columnHeaders: [
        { name: 'normPeriod.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: 'normPeriod.table.currentPeriod', isTranslateName: true, sorter: true, key: 'period_range' },
        { name: 'normPeriod.table.department', isTranslateName: true, sorter: false, key: 'departments' },
        { name: 'normPeriod.table.description', isTranslateName: true, sorter: false, key: 'description' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteNormPeriodOpen: false,
    },
    selectedNormPeriod: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchNormPeriods()
})

async function fetchNormPeriods() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await normPeriodService.getNormPeriods(params)
        if (response) {
            state.normPeriods = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchNormPeriods()
}

function next() {
    currentTablePage++
    fetchNormPeriods()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchNormPeriods()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchNormPeriods()
}

function deleteNormPeriodConfirmation(normPeriod: any) {
    state.selectedNormPeriod = normPeriod
    state.modal.isDeleteNormPeriodOpen = true
}

async function deleteNormPeriod() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await normPeriodService.deleteNormPeriod(state.selectedNormPeriod.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchNormPeriods()
            successAlert(`${t('alert.success')}!`, `${t('normPeriod.table.alert.normPeriodSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>