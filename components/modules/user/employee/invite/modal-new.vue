<template>
    <div>
        <Modal size="xs" :title="$t('employees.inviteEmployee')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserEmployeeInviteModalForm formType="create" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="inviteEmployee" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { employeeService } from '@/components/api/user/EmployeeService'
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
})
const emit = defineEmits(['close', 'refreshEmployees'])

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshEmployees() {
    emit('refreshEmployees')
}

async function inviteEmployee(employeeDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            email: employeeDetails.email,
        }
        const response = await employeeService.inviteEmployee(params)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('employees.form.alert.employeeSuccessfullyInvited')}.`)
            refreshEmployees()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>