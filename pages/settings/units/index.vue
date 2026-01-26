<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('units.units') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('units.units') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/units/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('units.addNewUnit') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.units"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.units?.data?.length === 0))">
                                <tr v-for="(unit, index) in state.units?.data" :key="index">
                                    <td width="70%">
                                        <span>{{ unit?.name }}</span>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/units/${unit.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('units.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteUnitConfirmation(unit)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('units.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.units" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteUnitOpen"
                :message="$t('units.table.confirmation.deleteUnitConfirmation') + '?'"
                @close="state.modal.isDeleteUnitOpen = false" @confirm="deleteUnit" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { unitService } from '@/components/api/user/UnitService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'units.units',
        translate: true,
        href: '/settings/units',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'units.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteUnitOpen: false,
    },
    units: [] as any,
    selectedUnit: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchUnits()
})

async function fetchUnits() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await unitService.getUnits(params)
        if (response) {
            state.units = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchUnits()
}

function next() {
    currentTablePage++
    fetchUnits()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchUnits()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchUnits()
}

function deleteUnitConfirmation(unit: any) {
    state.selectedUnit = unit
    state.modal.isDeleteUnitOpen = true
}

async function deleteUnit() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await unitService.deleteUnit(state.selectedUnit.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchUnits()
            successAlert(`${t('alert.success')}!`, `${t('units.alert.unitSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
