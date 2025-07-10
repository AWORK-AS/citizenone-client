<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('foreignCities.foreignCities') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('foreignCities.foreignCities') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/foreign-cities/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('foreignCities.newForeignCity') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.foreignCities"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.foreignCities?.data?.length === 0))">
                                <tr v-for="(foreignCity, index) in state.foreignCities?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ foreignCity?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/foreign-cities/${foreignCity.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('foreignCities.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteForeignCityConfirmation(foreignCity)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('foreignCities.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.foreignCities" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteForeignCityOpen"
                :message="$t('foreignCities.table.confirmation.deleteForeignCityConfirmation') + '?'"
                @close="state.modal.isDeleteForeignCityOpen = false" @confirm="deleteForeignCity" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { foreignCityService } from '@/components/api/user/ForeignCityService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
const breadcrumbLinks = [
    {
        name: 'foreignCities.foreignCities',
        translate: true,
        href: '/settings/foreign-cities',
    },
]

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'foreignCities.table.name', sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    foreignCities: [] as any,
    error: {} as Error,
    modal: {
        isDeleteForeignCityOpen: false,
    },
    isTableLoading: false,
    selectedForeignCity: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchDiagnoses()
})

async function fetchDiagnoses() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await foreignCityService.getForeignCities(params)
        if (response) {
            state.foreignCities = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchDiagnoses()
}

function next() {
    currentTablePage++
    fetchDiagnoses()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchDiagnoses()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchDiagnoses()
}

function deleteForeignCityConfirmation(foreignCity: any) {
    state.selectedForeignCity = foreignCity
    state.modal.isDeleteForeignCityOpen = true
}

async function deleteForeignCity() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await foreignCityService.deleteForeignCity(state.selectedForeignCity.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchDiagnoses()
            successAlert(`${t('alert.success')}!`, `${t('foreignCities.table.alert.foreignCitySuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>