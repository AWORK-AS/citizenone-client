<template>
    <div>
        <Modal size="md" :title="$t('reminders.assignees')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="flex justify-end items-center mb-5">
                        <FormButton buttonStyle="action" class="rounded-lg"
                            @click="state.modal.isAssignEmployeeReminderOpen = true">
                            <Icon name="ph:plus" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('reminders.assignAnEmployee') }}
                        </FormButton>
                    </div>
                    <div v-if="state.assignees.length > 0" class="mt-10 mb-4 space-y-2">
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
                    <div v-if="state.assignees.length === 0" class="py-24 text-center">
                        {{ $t('reminders.noAssigneeYet') }}
                    </div>
                </LoadingSpinner>

                <ModulesUserRemindersModalAssignReminder :isModalOpen="state.modal.isAssignEmployeeReminderOpen"
                    :selectedReminder="props.selectedReminder" @close="closeAssignModal" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteStatusOpen"
                    :message="`${$t('reminders.confirmation.removeEmployeeConfirmation')}?`"
                    @close="state.modal.isDeleteStatusOpen = false" @confirm="removeAssignee()" />
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import { reminderUserService } from '@/components/api/user/ReminderUserService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedReminder: {
        type: Object,
        required: true,
    }
})


const state = reactive({
    error: {} as Error,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    assignees: [] as any[],
    selectedEmployee: {} as any,
    isPageLoading: false,
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

watch(() => props.isModalOpen, (isModalOpen: any) => {
    if (isModalOpen) {
        fetchAssignees()
        fetchAllEmployees()
    }
})

function confirmEmployeeDeletion(status: any) {
    state.selectedEmployee = status
    state.modal.isDeleteStatusOpen = true
}

async function fetchAssignees() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            reminder_uuid: props.selectedReminder?.uuid
        }
        const response = await reminderUserService.getRemindersUsers(params)
        if (response) {
            state.assignees = response.data
        }
    } catch (error: any) {
        state.error = error
        state.assignees = []
    }
    state.isPageLoading = false
}

async function fetchAllEmployees() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsers()
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
    state.isPageLoading = false
}

async function removeAssignee() {
    state.error = {}
    state.isPageLoading = true
    try {
        const employeeUuid = state.selectedEmployee.uuid
        const response = await reminderUserService.deleteReminderUser(employeeUuid)
        if (response) {
            successAlert(`${t('alert.success')}!`, `${t('reminders.form.alert.employeeSuccessfullyRemoved')}.`)
            fetchAssignees()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>