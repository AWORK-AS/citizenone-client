<template>
    <div>
        <Modal size="md" :title="$t('reminder.assignees')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isLoading">
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAssignEmployeeReminderOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('reminder.assignAnEmployee') }}
                        </FormButton>
                    </div>
                    <div v-if="state.assignees.length > 0" class="mt-12 space-y-2">
                        <div v-for="assignee in state.assignees" :key="assignee.id"
                            class="bg-white shadow-md rounded-md border-l-8 mt-2 text-sm space-y-2 pr-5 pt-5 pb-5 pl-6 mr-1"
                            :class="{
                                'border-green-600': assignee.status === 'completed',
                                'border-yellow-500': assignee.status === 'pending',
                                'border-red-600': assignee.status === 'failed'
                            }">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-x-2">
                                    <p class="text-sm font-medium">
                                        {{ assignee.user.firstname }} {{ assignee.user.lastname }}
                                    </p>
                                </div>
                                <div class="flex items-center gap-x-4">
                                    <p class="text-sm font-semibold">
                                        {{ assignee.status.charAt(0).toUpperCase() + assignee.status.slice(1) }}
                                    </p>
                                    <div class="h-5 w-px bg-gray-300"></div>
                                    <FormButton class="rounded-md" buttonSize="sm"
                                        @click="confirmEmployeeDeletion(assignee)">
                                        <Icon name="ph:trash" class="h-4 w-4" aria-hidden="true" />
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="state.assignees.length === 0"
                        class="mt-24 mb-24 p-4 bg-gray-100 text-gray-500 text-center rounded-md">
                        No assignees yet.
                    </div>

                </LoadingSpinner>
                <ModulesUserRemindersModalAssignReminder :isModalOpen="state.modal.isAssignEmployeeReminderOpen"
                    @close="closeAssignModal" :reminder_uuid="props.reminder_uuid" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteStatusOpen"
                    :message="`${$t('reminder.confirmation.removeEmployeeConfirmation')}?`"
                    @close="state.modal.isDeleteStatusOpen = false" @confirm="removeAssignee()" />
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import { reminderUserService } from '@/components/api/user/ReminderUserService'
import { employeeService } from '@/components/api/user/EmployeeService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useDepartmentStore } from '@/store/department'

const departmentStore = useDepartmentStore()
const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    error: {} as Error,
    isPageLoading: false,
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    reminder_uuid: {
        type: String,
        required: false,
        default: null
    }
})

let currentTablePage = 1

const state = reactive({
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    reminder_uuid: '',
    assignees: [] as any[],
    employee_uuid: [],
    selectedEmployee: {} as any,
    isLoading: false,
    options: {
        employees: []
    },
    modal: {
        isAssignEmployeeReminderOpen: false,
        isDeleteStatusOpen: false
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

function closeAssignModal() {
    state.modal.isAssignEmployeeReminderOpen = false
    fetchAssignees()
}

watch(() => props.isModalOpen, (isOpen: any) => {
    if (isOpen) {
        state.reminder_uuid = props.reminder_uuid
        fetchAssignees()
        fetchEmployees()
    }
})

function confirmEmployeeDeletion(status: any) {
    state.selectedEmployee = status
    state.modal.isDeleteStatusOpen = true
}

async function fetchAssignees() {
    try {
        state.isLoading = true
        let params = {
            reminder_uuid: props.reminder_uuid
        }
        const response = await reminderUserService.getRemindersUsers(params)

        if (response?.data) {
            state.assignees = response.data
        } else {
            state.assignees = []
        }
    } catch (error: any) {
        state.assignees = []
    } finally {
        state.isLoading = false
    }
    state.isLoading = false
}

async function fetchEmployees() {
    state.error = {}
    state.isTableLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName,
            page: currentTablePage,
            sortField: state.sortData.sortField,
            sortOrder: state.sortData.sortOrder,
            ...state.dataFilter
        }
        const response = await employeeService.getEmployees(params)
        if (response) {
            state.options.employees = response
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.firstname + " " + item.lastname,
                })
            )
            state.options.employees = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isTableLoading = false
}

async function removeAssignee() {
    try {
        state.isLoading = true
        const response = await reminderUserService.deleteReminderUser(state.selectedEmployee.uuid)

        if (response && response.message) {
            fetchAssignees()
            successAlert(`${t('alert.success')}!`, `${t('reminder.form.alert.employeeSuccessfullyRemoved')}.`)
        }

    } catch (error: any) {
        state.assignees = []
    } finally {
        state.isLoading = false
    }
}

async function saveReminderUser(employee_uuid: string[], reminder_uuid: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        let params = {
            employee_uuid: employee_uuid,
            reminder_uuid: reminder_uuid,
        }
        const response = await reminderUserService.saveReminderUser(params)
        if (response?.data) {
            fetchAssignees()
            successAlert(`${t('alert.success')}!`, `${t('reminder.form.alert.employeeSuccessfullyAssigned')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

</script>