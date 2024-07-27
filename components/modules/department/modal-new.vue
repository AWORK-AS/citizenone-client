<template>
    <div>
        <Modal size="xs" :title="$t('departments.newDepartment')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesDepartmentForm formType="create" :selectedDepartment="state.formDepartment"
                        :error="state.error" @isPageLoading="(value: boolean) => state.isPageLoading = value"
                        @submitForm="saveDepartment" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/DepartmentService'
import { useI18n } from "vue-i18n"
import { notify } from "@kyvg/vue3-notification"
import type { Error } from '@/types'

const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close', 'refreshDepartment'])

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

function refreshDepartment() {
    emit('refreshDepartment')
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
            refreshDepartment()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
        if (error.message === 'You have no available user license to create a new department.') {
            navigateTo(`/subscription?error=${error?.message}`)
        }
    }
    state.isPageLoading = false
}

function successAlert(title: string, message: string) {
    notify({
        title: title,
        text: message,
        type: 'success',
    })
}
</script>