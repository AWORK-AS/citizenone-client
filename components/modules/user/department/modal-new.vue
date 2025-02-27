<template>
    <div>
        <Modal size="xs" :title="$t('departments.newDepartment')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserDepartmentModalForm formType="create" :selectedDepartment="state.formDepartment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @closeModal="closeModal" @submitForm="saveDepartment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/DepartmentService'
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
const emit = defineEmits(['close', 'refreshDepartments'])

const state = reactive({
    error: {} as Error,
    formDepartment: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshDepartments() {
    emit('refreshDepartments')
}

async function saveDepartment(departmentDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: departmentDetails.name,
        }
        const response = await departmentService.saveDepartment(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('departments.form.alert.newDepartmentSuccessfullySaved')}.`)
            refreshDepartments()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
        if (error?.message === 'You have no available user license to create a new department.') {
            navigateTo(`/subscription?error=${error?.message}`)
        } else if (error?.message === 'Du har ingen tilgængelige brugerlicenser til at oprette en ny afdeling.') {
            navigateTo(`/subscription?error=${error?.message}`)
        }
    }
    state.isPageLoading = false
}
</script>