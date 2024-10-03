<template>
    <div>
        <Modal size="lg" :title="$t('citizens.medicineJournals.history.medicineHistory')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAddMedicineHistoryOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('citizens.medicineJournals.history.giveMedicine') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.medicineHistories"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body
                                    v-if="!(state.isTableLoading || (state.medicineHistories?.data?.length === 0))">
                                    <tr v-for="(medicineHistory, index) in state.medicineHistories?.data" :key="index">
                                        <td width="50%">
                                            <span>{{ formatDateToReadable(medicineHistory?.date) }}</span>
                                        </td>
                                        <td width="20%">
                                            <span>{{ medicineHistory?.quantity }}</span>
                                        </td>
                                        <td width="30%">
                                            <div class="flex items-end gap-2">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="editMedicineHistory(medicineHistory)">
                                                    <Icon name="ph:pencil-simple" class="size-4" />
                                                    {{ $t('citizens.medicineJournals.table.actions.edit') }}
                                                </FormButton>
                                                <FormButton type="button" buttonStyle="danger" class="rounded-md"
                                                    @click="confirmMedicineDeletion(medicineHistory)">
                                                    <Icon name="ph:trash-duotone" class="size-4" />
                                                    {{ $t('citizens.medicineJournals.table.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.medicineHistories" @previous="previous" @next="next" />
                    </div>
                    <ModulesCitizenMedicineHistoryModalNew :isModalOpen="state.modal.isAddMedicineHistoryOpen"
                        :selectedMedicine="props.selectedMedicine" @close="state.modal.isAddMedicineHistoryOpen = false"
                        @refreshMedicineHistories="fetchCitizenMedicineHistories" />
                    <ModulesCitizenMedicineHistoryModalEdit :isModalOpen="state.modal.isEditMedicineHistoryOpen"
                        :selectedMedicineHistory="state.selectedMedicineHistory" @close="closeEditMedicineHistoryModal"
                        @refreshMedicineHistories="fetchCitizenMedicineHistories" />
                    <DialogConfirmation :isModalOpen="state.modal.isDeleteMedicineHistoryOpen"
                        :message="$t('citizens.medicineJournals.history.confirmation.deleteConfirmation') + '?'"
                        @close="state.modal.isDeleteMedicineHistoryOpen = false" @confirm="deleteMedicineHistory" />
                </div>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { medicineHistoryService } from '@/components/api/MedicineHistoryService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedMedicine: {
        type: Object,
        required: true,
    }
})

const { formatDateToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
let currentTablePage = 1
const emit = defineEmits(['close'])

const state = reactive({
    columnHeaders: [
        { name: 'citizens.medicineJournals.history.table.date', sorter: true, key: 'date' },
        { name: 'citizens.medicineJournals.table.quantity', sorter: true, key: 'quantity' },
        { name: '' },
    ],
    error: {} as Error,
    isTableLoading: false,
    medicineHistories: [] as any,
    modal: {
        isAddMedicineHistoryOpen: false,
        isDeleteMedicineHistoryOpen: false,
        isEditMedicineHistoryOpen: false,
        isViewMedicineHistoryOpen: false,
    },
    selectedMedicineHistory: [] as any,
    sortData: {
        sortField: '',
        sortOrder: '',
    },
})

watch(() => props.selectedMedicine, (selectedMedicine: any) => {
    if (selectedMedicine) {
        state.error = {}
        fetchCitizenMedicineHistories()
    }
})

function closeModal() {
    emit('close')
}

async function fetchCitizenMedicineHistories() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            medicine_uuid: props.selectedMedicine?.uuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder
        }
        const response = await medicineHistoryService.getMedicineHistories(params)
        if (response) {
            state.medicineHistories = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchCitizenMedicineHistories()
}

function next() {
    currentTablePage++
    fetchCitizenMedicineHistories()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchCitizenMedicineHistories()
}

function editMedicineHistory(medicineHistory: any) {
    state.selectedMedicineHistory = medicineHistory
    state.modal.isEditMedicineHistoryOpen = true
}

function closeEditMedicineHistoryModal() {
    state.modal.isEditMedicineHistoryOpen = false
    state.selectedMedicineHistory = []
}

function confirmMedicineDeletion(journal: any) {
    state.selectedMedicineHistory = journal
    state.modal.isDeleteMedicineHistoryOpen = true
}

async function deleteMedicineHistory() {
    state.error = {}
    state.isTableLoading = true
    try {
        const response = await medicineHistoryService.deleteMedicineHistory(state.selectedMedicineHistory.uuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            if (state.selectedMedicineHistory?.data?.length === 1) {
                currentTablePage = 1
            }
            fetchCitizenMedicineHistories()
            successAlert(`${t('alert.success')}!`, `${t('citizens.medicineJournals.history.alert.successfullyDeleted')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}
</script>