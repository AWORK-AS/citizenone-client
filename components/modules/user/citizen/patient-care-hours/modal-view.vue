<template>
    <div>
        <Modal size="3xl" :title="$t('citizens.patientCareHours.patientCareHours')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div class="flex justify-end items-center mb-5">
                    <FormButton buttonStyle="action" class="rounded-lg"
                        @click="state.modal.isAddPatientCareHoursOpen = true">
                        <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                        {{ $t('citizens.patientCareHours.newPatientCareHours') }}
                    </FormButton>
                </div>
                <div class="space-y-5">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <TableSearch @search="handleSearch" />
                    <div class="table-responsive">
                        <Table :columnHeaders="state.columnHeaders" :data="state.patientCareHours"
                            :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                            <template #body
                                v-if="!(state.isTableLoading || (state.patientCareHours?.data?.length === 0))">
                                <tr v-for="(pch, index) in state.patientCareHours?.data" :key="index">
                                    <td width="15%">
                                        {{ formatDateTimeToReadable(pch?.date_time_start) }}
                                    </td>
                                    <td width="15%">
                                        {{ formatDateTimeToReadable(pch?.date_time_end) }}
                                    </td>
                                    <td width="20%">
                                        {{ pch?.note }}
                                    </td>
                                    <td width="10%">
                                        {{ pch?.total_hours }}
                                    </td>
                                    <td width="20%">
                                        {{ pch?.user?.firstname + ' ' + pch?.user?.lastname }}
                                    </td>
                                    <td width="15%">
                                        <div class="flex items-end gap-2">
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="editPatientCareHours(pch)" v-if="pch?.is_editable">
                                                <Icon name="ph:pencil-simple" class="size-4" />
                                                {{ $t('citizens.patientCareHours.table.actions.edit') }}
                                            </FormButton>
                                            <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                @click="deletePatientCareHoursConfirmation(pch)"
                                                v-if="pch?.is_deletable">
                                                <Icon name="ph:trash" class="size-4" />
                                                {{ $t('citizens.patientCareHours.table.actions.delete') }}
                                            </FormButton>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </Table>
                    </div>
                    <Pagination :data="state.patientCareHours" @previous="previous" @next="next" />
                </div>
                <ModulesUserCitizenPatientCareHoursModalNew :isModalOpen="state.modal.isAddPatientCareHoursOpen"
                    @close="state.modal.isAddPatientCareHoursOpen = false"
                    @refreshPatientCareHours="refreshPatientCareHours()" />
                <ModulesUserCitizenPatientCareHoursModalEdit :isModalOpen="state.modal.isEditPatientCareHoursOpen"
                    :selectedPatientCareHours="state.selectedPatientCareHours"
                    @close="state.modal.isEditPatientCareHoursOpen = false"
                    @refreshPatientCareHours="refreshPatientCareHours()" />
                <DialogConfirmation :isModalOpen="state.modal.isDeletePatientCareHoursOpen"
                    :message="$t('citizens.patientCareHours.table.confirmation.deletePatientCareHoursConfirmation') + '?'"
                    @close="state.modal.isDeletePatientCareHoursOpen = false" @confirm="deletePatientCareHours" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { patientCareHoursService } from '@/components/api/user/PatientCareHoursService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const router = useRouter()
const citizenUuid = router?.currentRoute?.value?.params?.uuid
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { successAlert } = useAlert()
const emit = defineEmits(['close', 'refreshCitizenDetails'])
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'citizens.patientCareHours.table.datetimeEnd', sorter: true, key: 'date_time_start' },
        { name: 'citizens.patientCareHours.table.datetimeStart', sorter: true, key: 'date_time_end' },
        { name: 'citizens.patientCareHours.table.note' },
        { name: 'citizens.patientCareHours.table.totalHours' },
        { name: 'citizens.patientCareHours.table.createdBy' },
        { name: '' },
    ],
    dataFilter: {
        search: ''
    },
    error: {} as Error,
    isTableLoading: false,
    modal: {
        isAddPatientCareHoursOpen: false,
        isDeletePatientCareHoursOpen: false,
        isEditPatientCareHoursOpen: false,
    },
    patientCareHours: [] as any,
    selectedPatientCareHours: {},
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

function closeModal() {
    emit('close')
}

function refreshPatientCareHours() {
    fetchPatientCareHours()
    emit('refreshCitizenDetails')
}

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchPatientCareHours()
    }
})

async function fetchPatientCareHours() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            citizen_uuid: citizenUuid,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter,
        }
        const response = await patientCareHoursService.getPatientCareHours(params)
        if (response) {
            state.patientCareHours = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchPatientCareHours()
}

function next() {
    currentTablePage++
    fetchPatientCareHours()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchPatientCareHours()
}

function handleSearch(value: any) {
    currentTablePage = 1
    state.dataFilter.search = value?.[0] == '' ? [] : value
    fetchPatientCareHours()
}

function editPatientCareHours(pch: any) {
    state.selectedPatientCareHours = pch
    state.modal.isEditPatientCareHoursOpen = true
}

function deletePatientCareHoursConfirmation(pch: any) {
    state.selectedPatientCareHours = pch
    state.modal.isDeletePatientCareHoursOpen = true
}

async function deletePatientCareHours() {
    state.error = {}
    state.isPageLoading = true
    try {
        const patientCareHoursUuid = state.selectedPatientCareHours.uuid
        const response = await patientCareHoursService.deletePatientCareHours(patientCareHoursUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('citizens.patientCareHours.table.alert.patientCareHoursSuccessfullyDeleted')}.`)
            refreshPatientCareHours()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>