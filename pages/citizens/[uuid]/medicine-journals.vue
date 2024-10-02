<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.medicineCard') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.medicineCard') }}</template>

            <div class="space-y-5">
                <NuxtLink class="flex items-center gap-x-2 mb-3 max-w-fit hover:cursor-pointer" to="/citizens">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </NuxtLink>

                <ModulesCitizenDetailsHeader />
                <ModulesCitizenJournalTabs />

                <div class="flex justify-end items-center">
                    <FormButton buttonStyle="action" class="rounded-md" @click="state.modal.isAddMedicineOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.medicineJournals.newMedicine') }}
                    </FormButton>
                </div>

                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch :columnFilter="state.columnFilter" :dataFilter="state.dataFilter"
                        @handleFilter="handleFilter" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.medicines"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body v-if="!(state.isTableLoading || (state.medicines?.data?.length === 0))">
                                <tr v-for="(medicine, index) in state.medicines?.data" :key="index">
                                    <td width="20%">
                                        <span>{{ medicine?.medicine }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.strength }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.dosage?.name }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.daily_dose }}</span>
                                    </td>
                                    <td width="10%">
                                        <span>{{ medicine?.quantity }}</span>
                                    </td>
                                    <td width="20%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="viewMedicineHistory(medicine)">
                                                <Icon name="ph:eye" class="size-4" />
                                                {{ $t('citizens.medicineJournals.table.actions.view') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editMedicine(medicine)" v-if="medicine?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.medicineJournals.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                @click="confirmMedicineDeletion(medicine)">
                                                <Icon name="ph:trash-duotone" class="size-4" />
                                                {{ $t('citizens.medicineJournals.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.medicines" @previous="previous" @next="next" />
                </div>
                <ModulesCitizenMedicineHistoryModalHistory :isModalOpen="state.modal.isViewMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="state.modal.isViewMedicineOpen = false" />
                <ModulesCitizenMedicineModalNew :isModalOpen="state.modal.isAddMedicineOpen"
                    @close="state.modal.isAddMedicineOpen = false" @refreshMedicines="fetchCitizenMedicines" />
                <ModulesCitizenMedicineModalEdit :isModalOpen="state.modal.isEditMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="closeEditMedicineModal"
                    @refreshMedicines="fetchCitizenMedicines" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicineOpen"
                    :message="$t('citizens.medicineJournals.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteMedicineOpen = false" @confirm="deleteMedicine" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { medicineJournalService } from '@/components/api/MedicineJournalService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert } = useAlert()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'medicine' },
    ],
    columnHeaders: [
        { name: 'citizens.medicineJournals.table.medicine', sorter: true, key: 'medicine' },
        { name: 'citizens.medicineJournals.table.strength' },
        { name: 'citizens.medicineJournals.table.dosageForm' },
        { name: 'citizens.medicineJournals.table.dailyDose', sorter: true, key: 'daily_dose' },
        { name: 'citizens.medicineJournals.table.quantity', sorter: true, key: 'quantity' },
        { name: '' },
    ],
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    medicines: [] as any,
    modal: {
        isAddMedicineOpen: false,
        isDeleteMedicineOpen: false,
        isEditMedicineOpen: false,
        isViewMedicineOpen: false,
    },
    selectedMedicine: [] as any,
    sortData: {
        sortField: '',
        sortOrder: '',
    },
})

onMounted(() => {
    fetchCitizenMedicines()
})

async function fetchCitizenMedicines() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await medicineJournalService.getMedicines(params)
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
    fetchCitizenMedicines()
}

function next() {
    currentTablePage++
    fetchCitizenMedicines()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCitizenMedicines()
}

function handleFilter(value: any) {
    currentTablePage = 1
    state.dataFilter = value
    fetchCitizenMedicines()
}

function viewMedicineHistory(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isViewMedicineOpen = true
}

function editMedicine(medicine: any) {
    state.selectedMedicine = medicine
    state.modal.isEditMedicineOpen = true
}

function closeEditMedicineModal() {
    state.modal.isEditMedicineOpen = false
    state.selectedMedicine = []
}

function confirmMedicineDeletion(journal: any) {
    state.selectedMedicine = journal
    state.modal.isDeleteMedicineOpen = true
}

async function deleteMedicine() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await medicineJournalService.deleteMedicine(state.selectedMedicine.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.selectedMedicine?.data?.length === 1) {
                currentTablePage = 1
            }
            fetchCitizenMedicines()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>