<template>
    <div>
        <Modal size="md" :title="$t('timeAccounts.templateAgreementsModal.assignUnassignTitle')"
            :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <Alert type="danger" :text="state?.error?.message"
                        v-if="state.error?.message && state.error.message.length > 0" />

                    <div class="space-y-4">
                        <!-- Current assignments -->
                        <div class="rounded-md bg-gray-50 border border-gray-200 p-3 space-y-2">
                            <p class="text-sm font-medium text-gray-700">{{ $t('timeAccounts.modal.currentlyAssigned')
                                }}</p>
                            <div v-if="state.currentAssignments.users.length > 0" class="space-y-1">
                                <p class="text-xs text-gray-500">{{ $t('timeAccounts.modal.users') }}</p>
                                <div class="flex flex-wrap gap-1">
                                    <span v-for="user in state.currentAssignments.users" :key="user.uuid"
                                        class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {{ user.firstname }} {{ user.lastname }}
                                    </span>
                                </div>
                            </div>
                            <div v-if="state.currentAssignments.departments.length > 0" class="space-y-1">
                                <p class="text-xs text-gray-500">{{ $t('timeAccounts.modal.departments') }}</p>
                                <div class="flex flex-wrap gap-1">
                                    <span v-for="dept in state.currentAssignments.departments" :key="dept.uuid"
                                        class="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                                        {{ dept.name }}
                                    </span>
                                </div>
                            </div>
                            <p v-if="state.currentAssignments.users.length === 0 && state.currentAssignments.departments.length === 0"
                                class="text-xs text-gray-400">{{ $t('timeAccounts.modal.noneAssigned') }}</p>
                        </div>

                        <!-- Users -->
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">{{ $t('timeAccounts.modal.users') }}</p>
                            <FormSelectMultiple id="template_user_uuids" :options="state.options.users"
                                v-model="state.formData.user_uuids" />
                        </div>

                        <!-- Departments -->
                        <div class="space-y-1">
                            <p class="text-sm text-gray-600">{{ $t('timeAccounts.modal.departments') }}</p>
                            <FormSelectMultiple id="template_department_uuids" :options="state.options.departments"
                                v-model="state.formData.department_uuids" />
                        </div>

                        <!-- Guard error when nothing is selected -->
                        <p v-if="state.showSelectionError" class="text-sm text-red-500">
                            {{ $t('timeAccounts.modal.selectAtLeastOne') }}
                        </p>

                        <!-- Action buttons -->
                        <div class="flex gap-2 mt-6">
                            <FormButton type="button" class="w-full rounded-md" buttonStyle="action"
                                @click="handleAssign">
                                {{ $t('timeAccounts.modal.assign') }}
                            </FormButton>
                            <FormButton type="button" class="w-full rounded-md" buttonStyle="danger"
                                @click="handleUnassign">
                                {{ $t('timeAccounts.modal.unassign') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { timeAccountTemplateAgreementService } from '@/components/api/user/TimeAccountTemplateAgreementService'
import { userService } from '@/components/api/user/UserService'
import { departmentService } from '@/components/api/user/DepartmentService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const { successAlert } = useAlert()
const { t } = useI18n()

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    selectedTemplateAgreement: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['close'])

const state = reactive({
    error: {} as Error,
    formData: {
        user_uuids: [] as any[],
        department_uuids: [] as any[],
    },
    isPageLoading: false,
    showSelectionError: false,
    options: {
        users: [] as any[],
        departments: [] as any[],
    },
    currentAssignments: {
        users: [] as any[],
        departments: [] as any[],
    },
})

function closeModal() {
    emit('close')
}

watch(() => props.isModalOpen, async (newValue: boolean) => {
    if (newValue) {
        state.formData.user_uuids = []
        state.formData.department_uuids = []
        state.showSelectionError = false
        state.error = {}
        state.isPageLoading = true
        await Promise.all([fetchUsers(), fetchDepartments(), fetchCurrentAssignments()])
        state.isPageLoading = false
    }
})

async function fetchUsers() {
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        if (response) {
            state.options.users = response.data.map((item: any) => ({
                value: item.uuid,
                label: item.firstname + ' ' + (item.lastname ?? ''),
            }))
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchCurrentAssignments() {
    try {
        const response = await timeAccountTemplateAgreementService.getTemplateAgreement(props.selectedTemplateAgreement?.uuid)
        if (response?.data) {
            state.currentAssignments.users = response.data.template_target_users ?? []
            state.currentAssignments.departments = response.data.template_target_departments ?? []
        }
    } catch (error: any) {
        state.error = error
    }
}

async function fetchDepartments() {
    try {
        const response = await departmentService.getAllDepartments({})
        if (response) {
            state.options.departments = response.data
                .filter((item: any) => item.uuid !== 'all-departments')
                .map((item: any) => ({
                    value: item.uuid,
                    label: item.name,
                }))
        }
    } catch (error: any) {
        state.error = error
    }
}


function hasSelection(): boolean {
    return state.formData.user_uuids.length > 0 || state.formData.department_uuids.length > 0
}

async function handleAssign() {
    if (!hasSelection()) {
        state.showSelectionError = true
        return
    }
    state.showSelectionError = false
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            user_uuids: state.formData.user_uuids,
            department_uuids: state.formData.department_uuids,
        }
        const response = await timeAccountTemplateAgreementService.assignTemplateAgreement(props.selectedTemplateAgreement?.uuid, params)
        if (response?.data) {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('timeAccounts.templateAgreementsModal.alert.assignSuccess')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

async function handleUnassign() {
    if (!hasSelection()) {
        state.showSelectionError = true
        return
    }
    state.showSelectionError = false
    state.error = {}
    state.isPageLoading = true
    try {
        const params = {
            user_uuids: state.formData.user_uuids,
            department_uuids: state.formData.department_uuids,
        }
        const response = await timeAccountTemplateAgreementService.unassignTemplateAgreement(props.selectedTemplateAgreement?.uuid, params)
        if (response?.data) {
            closeModal()
            successAlert(`${t('alert.success')}!`, `${t('timeAccounts.templateAgreementsModal.alert.unassignSuccess')}.`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}
</script>

<style>
#template_department_uuids .multiselect-dropdown,
#template_user_uuids .multiselect-dropdown {
    max-height: 4.8rem !important;
}
</style>
