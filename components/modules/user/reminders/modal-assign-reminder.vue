<template>
    <div>
        <Modal size="md" :title="$t('reminders.assignAnEmployee')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />
                    <form @submit.prevent="saveReminderUser()" id="formAssignees">
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">
                                {{ $t('reminders.assignees') }}
                            </p>
                            <FormSelectMultiple id="employees" :options="state.options.employees"
                                v-model="state.formAssignees.assignees" />
                            <FormError :error="v$?.formAssignees?.assignees?.$errors[0]?.$message.toString()" />
                            <FormError :error="props?.error?.errors?.employee_uuid?.[0]" />
                        </div>
                        <div class="mt-6">
                            <FormButton type="submit" class="w-full" buttonStyle="primary">
                                {{ $t('reminders.assign') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>

</template>

<script setup lang="ts">
import { watch, reactive } from 'vue'
import { reminderUserService } from '@/components/api/user/ReminderUserService'
import { userService } from '@/components/api/user/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'
import { useDepartmentStore } from '@/store/department'

const departmentStore = useDepartmentStore()
const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    error: {
        type: Object,
        required: false,
    },
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
    formAssignees: {
        assignees: [],
    },
    isPageLoading: false,
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
        // state.reminderUuid = "?reminderUuid=" + props.reminderUuid
        fetchAllEmployees()
    }
})

const rules = computed(() => {
    return {
        formAssignees: {
            assignees: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        },
    }
})

const v$ = useVuelidate(rules, state)

async function fetchAllEmployees() {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            department: departmentStore.getSelectedDepartmentName
        }
        const response = await userService.getAllUsers(params)
        if (response) {
            state.options.employees = response
            let options: any = []
            response.data.forEach(
                (item: any) => options.push({
                    value: item.uuid,
                    label: item.firstname + " " + (item.lastname ? item.lastname : ''),
                })
            )
            state.options.employees = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}


async function saveReminderUser() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.error = {}
        state.isPageLoading = true
        try {
            const reminderUuid = props?.selectedReminder?.uuid
            const params = {
                reminder_uuid: reminderUuid,
                employee_uuid: state.formAssignees.assignees,
            }
            const response = await reminderUserService.saveReminderUser(params)
            if (response?.data) {
                closeModal()
                successAlert(`${t('alert.success')}!`, `${t('reminders.form.alert.employeeSuccessfullyAssigned')}.`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>

<style>
#formAssignees .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>