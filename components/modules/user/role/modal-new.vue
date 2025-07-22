<template>
    <div>
        <Modal size="xs" :title="$t('roles.newRole')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <ModulesUserRoleModalForm formType="create" :selectedRole="state.formRole" :error="state.error"
                        @isPageLoading="(value: boolean) => state.isPageLoading = value" @closeModal="closeModal"
                        @submitForm="saveRole" />
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { roleService } from '@/components/api/user/RoleService'
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
const emit = defineEmits(['close', 'refreshRoles'])

const state = reactive({
    error: {} as Error,
    formRole: {
        name: '',
    },
    isPageLoading: false,
})

function closeModal() {
    emit('close')
}

function refreshRoles() {
    emit('refreshRoles')
}

async function saveRole(roleDetails: any) {
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            name: roleDetails.name,
        }
        const response = await roleService.saveRole(params)
        if (response.data) {
            successAlert(`${t('alert.success')}!`, `${t('roles.form.alert.newRoleSuccessfullySaved')}.`)
            refreshRoles()
            closeModal()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>