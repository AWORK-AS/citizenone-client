<template>
    <div>
        <Modal size="xl" :title="$t('employees.citizens.assignedCitizens')" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <div>
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAssignCitizenOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('employees.citizens.assignCitizens') }}
                        </FormButton>
                    </div>
                    <div class="space-y-5">
                        <Alert type="danger" :text="state?.error?.message"
                            v-if="state.error?.message && state.error.message.length > 0" />
                        <div class="table-responsive">
                            <Table :columnHeaders="state.columnHeaders" :data="state.citizens"
                                :isLoading="state.isTableLoading" :sortData="state.sortData" @sort="sort">
                                <template #body v-if="!(state.isTableLoading || (state.citizens?.data?.length === 0))">
                                    <tr v-for="(citizen, index) in state.citizens?.data" :key="index">
                                        <td width="40%">
                                            <span>{{ citizen?.firstname }}</span>
                                        </td>
                                        <td width="40%">
                                            <span>{{ citizen.lastname }}</span>
                                        </td>
                                        <td width="20%">
                                            <div class="flex items-end gap-2">
                                                <FormButton type="button" buttonStyle="action" class="rounded-md"
                                                    @click="confirmDeleteCitizen(citizen)">
                                                    <Icon name="ph:trash" class="size-4" />
                                                    {{ $t('employees.citizens.table.actions.delete') }}
                                                </FormButton>
                                            </div>
                                        </td>
                                    </tr>
                                </template>
                            </Table>
                        </div>
                        <Pagination :data="state.citizens" @previous="previous" @next="next" />
                    </div>
                </div>
                <ModulesUserEmployeeCitizenModalNew :isModalOpen="state.modal.isAssignCitizenOpen"
                    @close="closeAssignModal" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteCitizenOpen"
                    :message="$t('employees.citizens.table.confirmation.deleteCitizenConfirmation') + '?'"
                    @close="state.modal.isDeleteCitizenOpen = false" @confirm="deleteCitizen" />
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { citizenService } from '@/components/api/user/CitizenService'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const router = useRouter()
const { successAlert } = useAlert()
const { t } = useI18n()
const employeeUuid = router?.currentRoute?.value?.params?.employee_uuid
let currentTablePage = 1

const state = reactive({
    columnHeaders: [
        { name: 'employees.citizens.table.firstname' },
        { name: 'employees.citizens.table.lastname' },
        { name: '' },
    ],
    citizens: [] as any,
    error: {} as Error,
    modal: {
        isAssignCitizenOpen: false,
        isDeleteCitizenOpen: false,
    },
    isTableLoading: false,
    selectedCitizen: [] as any,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
})

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAssignedCitizens()
    }
})

function closeModal() {
    emit('close')
}

function closeAssignModal() {
    state.modal.isAssignCitizenOpen = false
    fetchAssignedCitizens()
}

async function fetchAssignedCitizens() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            employee_uuid: employeeUuid,
        }
        const response = await citizenService.getAllAssignedCitizens(params)
        if (response) {
            state.citizens = response
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

function previous() {
    currentTablePage--
    fetchAssignedCitizens()
}

function next() {
    currentTablePage++
    fetchAssignedCitizens()
}

function sort(sortingData: any) {
    currentTablePage = 1
    state.sortData = {
        sortField: sortingData.column,
        sortOrder: sortingData.sort,
    }
    fetchAssignedCitizens()
}

function confirmDeleteCitizen(citizen: any) {
    state.selectedCitizen = citizen
    state.modal.isDeleteCitizenOpen = true
}

async function deleteCitizen() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            user_uuid: employeeUuid,
            citizen_uuid: state.selectedCitizen?.uuid,
        }
        const response = await citizenService.removeAssignedCitizen(params)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('employees.citizens.table.confirmation.deleteCitizenConfirmation')}.`)
            fetchAssignedCitizens()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>