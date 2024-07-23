<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('citizens.tabs.medicineJournals') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('citizens.tabs.medicineJournals') }}</template>

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
                        {{ $t('citizens.medicineJournals.giveMedicine') }}
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
                                    <td width="25%">
                                        <span>{{ medicine?.name }}</span>
                                    </td>
                                    <td width="20%">
                                        <span>{{ formatDateToReadable(medicine?.date_given) }}</span>
                                    </td>
                                    <td width="25%">
                                        <span>{{ medicine?.description }}</span>
                                    </td>
                                    <td width="30%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editMedicine(medicine)">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.medicineJournals.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
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
                <ModulesCitizenMedicineModalNew :isModalOpen="state.modal.isAddMedicineOpen"
                    @close="state.modal.isAddMedicineOpen = false" @refreshMedicines="fetchCitizenMedicines" />
                <ModulesCitizenMedicineModalEdit :isModalOpen="state.modal.isEditMedicineOpen"
                    :selectedMedicine="state.selectedMedicine" @close="closeEditMedicineModal"
                    @refreshMedicines="fetchCitizenMedicines" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicineOpen"
                    :message="$t('citizens.medicineJournals.confirmation.deleteConfirmation') + '?'"
                    @close="state.modal.isDeleteMedicineOpen = false" @confirm="deleteMedicne" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { medicineJournalService } from '@/components/api/MedicineJournalService';
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
let currentTablePage = 1

const state = reactive({
    columnFilter: [
        { column: 'name' },
    ],
    columnHeaders: [
        { name: 'citizens.medicineJournals.table.name', sorter: true, key: 'name' },
        { name: 'citizens.medicineJournals.table.dateGiven', sorter: true, key: 'date_given' },
        { name: 'citizens.medicineJournals.table.reason' },
        { name: '' },
    ],
    dataFilter: [],
    error: {} as Error,
    isTableLoading: false,
    medicines: [],
    modal: {
        isAddMedicineOpen: false,
        isDeleteMedicineOpen: false,
        isEditMedicineOpen: false,
    },
    selectedMedicine: [],
    sortData: {
        sortField: 'date_given',
        sortOrder: 'descend',
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

async function deleteMedicne() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await medicineJournalService.deleteMedicine(state.selectedMedicine.uuid)
        if (response?.message === 'Success.') {
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

function formatDateToReadable(datetime: string) {
    return moment(datetime).format('DD MMM, YYYY')
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>