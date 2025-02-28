<template>
    <div>
        <Modal size="md" :title="$t('reminder.assignees')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isLoading">
                    <form @submit.prevent="saveReminderUser(state.employee_uuid, props.reminder_uuid)"
                        id="formGroupMember">
                        <div class="flex items-end space-x-2 pb-5">
                            <div class="flex-1">
                                <p class="text-sm text-gray-600">
                                    {{ $t('reminder.assignees') }}
                                </p>
                                <FormSelectMultiple id="pages" :options="state.options.employees"
                                    v-model="state.employee_uuid" class="w-full" />
                            </div>
                        </div>
                        <FormButton type="submit" class="w-full rounded-md" buttonStyle="primary">
                            {{ $t('reminder.assign') }}
                        </FormButton>
                    </form>
                </LoadingSpinner>
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
    error: {} as Error,
    isTableLoading: false,
    sortData: {
        sortField: 'id',
        sortOrder: 'descend',
    },
    reminder_uuid: '',
    assignees: [] as any[],
    employee_uuid: [],
    isLoading: false,
    options: {
        employees: []
    },
})

const emit = defineEmits(['close'])

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, (isOpen: any) => {
    if (isOpen) {
        state.reminder_uuid = "?reminder_uuid=" + props.reminder_uuid
        fetchEmployees()
    }
})

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
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('reminder.form.alert.employeeSuccessfullyAssigned')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

</script>