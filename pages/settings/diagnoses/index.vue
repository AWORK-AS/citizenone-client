<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('diagnoses.diagnoses') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('diagnoses.diagnoses') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/diagnoses/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('diagnoses.newDiagnosis') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.diagnoses"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.diagnoses?.data?.length === 0))">
                                <tr v-for="(diagnosis, index) in state.diagnoses?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ diagnosis?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/diagnoses/${diagnosis.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('diagnoses.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteDiagnosisConfirmation(diagnosis)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('diagnoses.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.diagnoses" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteDiagnosisOpen"
                :message="$t('diagnoses.table.confirmation.deleteDiagnosisConfirmation') + '?'"
                @close="state.modal.isDeleteDiagnosisOpen = false" @confirm="deleteDiagnosis" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { diagnosisService } from '@/components/api/user/DiagnosisService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
const breadcrumbLinks = [
    {
        name: 'diagnoses.diagnoses',
        translate: true,
        href: '/settings/diagnoses',
    },
]

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'diagnoses.table.name', isTranslateName: true, sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    diagnoses: [] as any,
    error: {} as Error,
    modal: {
        isDeleteDiagnosisOpen: false,
    },
    isTableLoading: false,
    selectedDiagnosis: {} as any,
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
        const response = await diagnosisService.getDiagnoses(params)
        if (response) {
            state.diagnoses = response
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

function deleteDiagnosisConfirmation(diagnosis: any) {
    state.selectedDiagnosis = diagnosis
    state.modal.isDeleteDiagnosisOpen = true
}

async function deleteDiagnosis() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await diagnosisService.deleteDiagnosis(state.selectedDiagnosis.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchDiagnoses()
            successAlert(`${t('alert.success')}!`, `${t('diagnoses.table.alert.diagnosisSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>