<template>
    <div>
        <Modal size="4xl" :title="modalTitle()" :show="props.isModalOpen" @close="closeModal">
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
                                        <td width="20%">
                                            <span class="truncate">
                                                {{
                                                    formatDateToReadable(medicineHistory?.date)
                                                }}
                                            </span>
                                        </td>
                                        <td width="5%">
                                            <p>
                                                {{ formatNumber(language.locale.value, medicineHistory?.quantity) }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <span v-if="medicineHistory?.type === 'delivered'">
                                                {{ $t('citizens.medicineJournals.history.table.type.delivered') }}
                                            </span>
                                            <span v-if="medicineHistory?.type === 'deviated'">
                                                {{ $t('citizens.medicineJournals.history.table.type.deviated') }}
                                            </span>
                                            <span v-if="medicineHistory?.type === 'given'">
                                                {{ customPagesStore.getCustomPagesName?.giveMedicine }}
                                            </span>
                                        </td>
                                        <td width="15%" v-if="props.selectedMedicine?.is_pn_medicine">
                                            <span class="truncate">
                                                {{ medicineHistory?.evaluator?.firstname }}
                                                {{ medicineHistory?.evaluator?.lastname }}
                                            </span>
                                        </td>
                                        <td width="15%">
                                            <span class="truncate">
                                                {{ medicineHistory?.user?.firstname }}
                                                {{ medicineHistory?.user?.lastname }}
                                            </span>
                                        </td>
                                        <td width="15%">
                                            <p>
                                                {{ medicineHistory?.comment }}
                                            </p>
                                        </td>
                                        <td width="10%">
                                            <span class="truncate">
                                                {{ formatDateTimeToReadable(medicineHistory?.created_at) }}
                                            </span>
                                        </td>
                                        <td width="10%">
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
                    <ModulesUserCitizenMedicineHistoryModalNew :isModalOpen="state.modal.isAddMedicineHistoryOpen"
                        :selectedMedicine="props.selectedMedicine" @close="state.modal.isAddMedicineHistoryOpen = false"
                        @refreshMedicineHistories="fetchCitizenMedicineHistories" />
                    <ModulesUserCitizenMedicineHistoryModalEdit :isModalOpen="state.modal.isEditMedicineHistoryOpen"
                        :selectedMedicine="props.selectedMedicine"
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
import { useNumberFormatter } from '@/composables/numberFormatter'
import { medicineHistoryService } from '@/components/api/user/MedicineHistoryService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useCustomPagesStore } from '@/store/custom-pages'
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

const { formatDateToReadable, formatDateTimeToReadable } = useDatetimeFormatter()
const { successAlert } = useAlert()
const { t } = useI18n()
const { formatNumber } = useNumberFormatter()
const language = useI18n()
const customPagesStore = useCustomPagesStore() as any
let currentTablePage = 1
const emit = defineEmits(['close'])

const state = reactive({
    columnHeaders: [] as any,
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
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchCitizenMedicineHistories()
        if (props.selectedMedicine?.is_pn_medicine) {
            state.columnHeaders = [
                { name: 'citizens.medicineJournals.history.table.date', sorter: true, key: 'date' },
                { name: 'citizens.medicineJournals.history.table.dose', sorter: true, key: 'quantity' },
                { name: 'citizens.medicineJournals.history.table.type.type', sorter: true, key: 'type' },
                { name: 'citizens.medicineJournals.history.table.evaluator' },
                { name: 'citizens.medicineJournals.history.table.user' },
                { name: 'citizens.medicineJournals.history.table.comment' },
                { name: 'citizens.medicineJournals.history.table.dateCreated' },
                { name: '' },
            ]
        } else {
            state.columnHeaders = [
                { name: 'citizens.medicineJournals.history.table.date', sorter: true, key: 'date' },
                { name: 'citizens.medicineJournals.history.table.dose', sorter: true, key: 'quantity' },
                { name: 'citizens.medicineJournals.history.table.type.type', sorter: true, key: 'type' },
                { name: 'citizens.medicineJournals.history.table.user' },
                { name: 'citizens.medicineJournals.history.table.comment' },
                { name: 'citizens.medicineJournals.history.table.dateCreated' },
                { name: '' },
            ]
        }
    }
})

function closeModal() {
    emit('close')
}

function modalTitle() {
    return `${t('citizens.medicineJournals.history.medicineHistory')} (${language.locale.value === 'en' ? props.selectedMedicine?.medicine?.en_name : props.selectedMedicine?.medicine?.dk_name})`
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