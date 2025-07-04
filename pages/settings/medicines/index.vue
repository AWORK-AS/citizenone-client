<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('medicines.medicines') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('medicines.medicines') }}</template>

            <ModulesUserSettingsTab />

            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8">
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg" @click="navigateTo('/settings/medicines/new')">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('medicines.addNewMedicine') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.medicines"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.medicines?.data?.length === 0))">
                                <tr v-for="(medicine, index) in state.medicines?.data" :key="index">
                                    <td width="15%">
                                        <img :src="medicine?.image_url" class="h-24" v-if="medicine?.image_url" />
                                    </td>
                                    <td width="30%">
                                        <span>{{ medicine?.en_name }}</span>
                                    </td>
                                    <td width="30%">
                                        <span>{{ medicine?.dk_name }}</span>
                                    </td>
                                    <td width="25%">
                                        <div class="flex items-end justify-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="navigateTo(`/settings/medicines/${medicine.uuid}/edit`)">
                                                <Icon name="ph:pencil" class="size-4" />
                                                {{ $t('medicines.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deleteMedicineConfirmation(medicine)">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('medicines.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.medicines" @previous="previous" @next="next" />
                </div>
            </div>
            <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicineOpen"
                :message="$t('medicines.table.confirmation.deleteMedicineConfirmation') + '?'"
                @close="state.modal.isDeleteMedicineOpen = false" @confirm="deleteMedicine" />
        </NuxtLayout>
    </div>
</template>


<script setup lang="ts">
import { medicineService } from '@/components/api/user/MedicineService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const breadcrumbLinks = [
    {
        name: 'medicines.medicines',
        translate: true,
        href: '/settings/medicines',
    },
]

const state = reactive({
    columnHeaders: [
        { name: 'medicines.table.image' },
        { name: 'medicines.table.nameEnglish', sorter: true, key: 'en_name' },
        { name: 'medicines.table.nameDanish', sorter: true, key: 'dk_name' },
        { name: '' }
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isDeleteMedicineOpen: false,
    },
    pagination: {
        current_page: 1,
        last_page: 1,
        total: 0,
    },
    medicines: [] as any,
    selectedMedicine: {} as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

onMounted(() => {
    fetchMedicines()
})

async function fetchMedicines() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await medicineService.getMedicines(params)
        if (response) {
            state.medicines = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchMedicines()
}

function next() {
    currentTablePage++
    fetchMedicines()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchMedicines()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] === '' ? [] : value
    fetchMedicines()
}

function deleteMedicineConfirmation(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isDeleteMedicineOpen = true
}

async function deleteMedicine() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await medicineService.deleteMedicine(state.selectedMedicine.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            fetchMedicines()
            successAlert(`${t('alert.success')}!`, `${t('medicines.alert.medicineSuccessfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>
