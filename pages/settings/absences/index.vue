<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('absences.absences') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('absences.absences') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/absences/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('absences.newAbsence') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.absences"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.absences?.data?.length === 0))">
                                <tr v-for="(absence, index) in state.absences?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ absence?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/absences/${absence.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('absences.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteAbsenceConfirmation(absence)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('absences.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.absences" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteAbsenceOpen"
                :message="$t('absences.table.confirmation.deleteAbsenceConfirmation') + '?'"
                @close="state.modal.isDeleteAbsenceOpen = false" @confirm="deleteAbsence" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { absenceService } from '@/components/api/user/AbsenceService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'absences.absences',
        translate: true,
        href: '/settings/absences',
    },
]

const state = reactive({
    absences: [] as any,
    columnHeaders: [
        { name: 'absences.table.name', sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteAbsenceOpen: false,
    },
    selectedAbsence: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchAbsences()
})

async function fetchAbsences() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await absenceService.getAbsences(params)
        if (response) {
            state.absences = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchAbsences()
}

function next() {
    currentTablePage++
    fetchAbsences()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchAbsences()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchAbsences()
}

function deleteAbsenceConfirmation(absence: any) {
    state.selectedAbsence = absence
    state.modal.isDeleteAbsenceOpen = true
}

async function deleteAbsence() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await absenceService.deleteAbsence(state.selectedAbsence.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchAbsences()
            successAlert(`${t('alert.success')}!`, `${t('absences.table.alert.absenceSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>