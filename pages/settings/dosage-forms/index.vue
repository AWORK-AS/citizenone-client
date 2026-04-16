<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('dosageForms.dosageForms') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('dosageForms.dosageForms') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" @click="navigateTo('/settings/dosage-forms/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('dosageForms.addNewDosageForm') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.dosageForms"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.dosageForms?.data?.length === 0))">
                                <tr v-for="(dosageForm, index) in state.dosageForms?.data" :key="index">
                                    <td width="30%">
                                        <span>{{ dosageForm?.en_name }}</span>
                                    </td>
                                    <td width="30%">
                                        <span>{{ dosageForm?.dk_name }}</span>
                                    </td>
                                    <td width="40%">
                                        <div class="flex items-center justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action"
                                                @click="navigateTo(`/settings/dosage-forms/${dosageForm.uuid}/edit`)"
                                                v-if="dosageForm?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('dosageForms.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger"
                                                @click="deleteDosageFormConfirmation(dosageForm)"
                                                v-if="dosageForm?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('dosageForms.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.dosageForms" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteDosageFormOpen"
                :message="$t('dosageForms.table.confirmation.deleteDosageFormConfirmation') + '?'"
                @close="state.modal.isDeleteDosageFormOpen = false" @confirm="deleteDosageForm" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { dosageFormService } from '@/components/api/user/DosageFormService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'dosageForms.dosageForms',
        translate: true,
        href: '/settings/dosage-forms',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'dosageForms.table.nameEnglish', isTranslateName: true, sorter: true, key: 'en_name' },
        { name: 'dosageForms.table.nameDanish', isTranslateName: true, sorter: true, key: 'dk_name' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    dosageForms: [] as any,
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteDosageFormOpen: false,
    },
    selectedDosageForm: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchDosageForms()
})

async function fetchDosageForms() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await dosageFormService.getDosageForms(params)
        if (response) {
            state.dosageForms = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchDosageForms()
}

function next() {
    currentTablePage++
    fetchDosageForms()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchDosageForms()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchDosageForms()
}

function deleteDosageFormConfirmation(dosageForm: any) {
    state.selectedDosageForm = dosageForm
    state.modal.isDeleteDosageFormOpen = true
}

async function deleteDosageForm() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await dosageFormService.deleteDosageForm(state.selectedDosageForm.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchDosageForms()
            successAlert(`${t('alert.success')}!`, `${t('dosageForms.alert.dosageFormSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
