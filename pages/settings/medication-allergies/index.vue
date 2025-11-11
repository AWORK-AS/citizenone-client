<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('medicationAllergies.medicationAllergies') }} - {{ runtimeConfig?.public?.appName }}
                </Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('medicationAllergies.medicationAllergies') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="navigateTo('/settings/medication-allergies/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('medicationAllergies.newMedicationAllergy') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.medicationAllergies"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.medicationAllergies?.data?.length === 0))">
                                <tr v-for="(medicationAllergy, index) in state.medicationAllergies?.data" :key="index">
                                    <td width="50%">
                                        <span>{{ medicationAllergy?.name }}</span>
                                    </td>
                                    <td width="50%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/medication-allergies/${medicationAllergy.uuid}/edit`)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('medicationAllergies.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="deleteMedicationAllergyConfirmation(medicationAllergy)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('medicationAllergies.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.medicationAllergies" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicationAllergyOpen"
                :message="$t('medicationAllergies.table.confirmation.deleteMedicationAllergyConfirmation') + '?'"
                @close="state.modal.isDeleteMedicationAllergyOpen = false" @confirm="deleteMedicationAllergy" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { medicationAllergyService } from '@/components/api/user/MedicationAllergyService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'
const breadcrumbLinks = [
    {
        name: 'medicationAllergies.medicationAllergies',
        translate: true,
        href: '/settings/medication-allergies',
    },
]

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'medicationAllergies.table.name', sorter: true, key: 'name' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    medicationAllergies: [] as any,
    error: {} as Error,
    modal: {
        isDeleteMedicationAllergyOpen: false,
    },
    isTableLoading: false,
    selectedMedicationAllergy: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchMedicationAllergies()
})

async function fetchMedicationAllergies() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await medicationAllergyService.getMedicationAllergies(params)
        if (response) {
            state.medicationAllergies = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchMedicationAllergies()
}

function next() {
    currentTablePage++
    fetchMedicationAllergies()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchMedicationAllergies()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchMedicationAllergies()
}

function deleteMedicationAllergyConfirmation(medicationAllergy: any) {
    state.selectedMedicationAllergy = medicationAllergy
    state.modal.isDeleteMedicationAllergyOpen = true
}

async function deleteMedicationAllergy() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await medicationAllergyService.deleteMedicationAllergy(state.selectedMedicationAllergy.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchMedicationAllergies()
            successAlert(`${t('alert.success')}!`, `${t('medicationAllergies.table.alert.medicationAllergySuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>