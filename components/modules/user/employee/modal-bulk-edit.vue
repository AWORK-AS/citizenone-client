<template>
    <Modal size="md" :title="$t('employees.bulkEdit.title', { count: props.employees.length })" :show="props.isModalOpen"
        @close="closeModal">
        <template #modal-body>
            <div class="space-y-5">
                <p class="text-sm text-gray-600">{{ $t('employees.bulkEdit.intro') }}</p>

                <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                <div v-if="state.result" class="space-y-3">
                    <Alert type="success" :text="$t('employees.bulkEdit.result', {
                        updated: state.result.updated,
                        requested: state.result.requested,
                    })" />
                    <div v-if="state.result.skipped_employees?.length > 0" class="space-y-1">
                        <p class="text-sm font-medium text-gray-700">{{ $t('employees.bulkEdit.skippedHeader') }}</p>
                        <ul class="text-sm text-gray-600 list-disc pl-5">
                            <li v-for="row in state.result.skipped_employees" :key="row.uuid">
                                {{ row.name }}: {{ reasonLabel(row.reason) }}
                            </li>
                        </ul>
                    </div>
                    <div class="flex justify-end">
                        <FormButton type="button" buttonStyle="primary" @click="closeModal">
                            {{ $t('close') }}
                        </FormButton>
                    </div>
                </div>

                <template v-else>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" v-if="isAtLeast('Admin')">
                        <div class="space-y-1">
                            <FormLabel for="bulk_role" :label="$t('employees.bulkEdit.role')" />
                            <FormSelect id="bulk_role" :options="state.options.roles"
                                :placeholder="$t('employees.bulkEdit.noChange')" v-model="state.form.role" />
                        </div>
                        <div class="space-y-1" v-if="state.form.role">
                            <FormLabel for="bulk_role_mode" :label="$t('employees.bulkEdit.how')" />
                            <FormSelect id="bulk_role_mode" :options="roleModeOptions" :canClear="false"
                                :canDeselect="false" v-model="state.form.role_mode" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="bulk_departments" :label="$t('employees.bulkEdit.departments')" />
                            <FormSelectMultiple id="bulk_departments" :options="state.options.departments"
                                :placeholder="$t('employees.bulkEdit.noChange')" v-model="state.form.department_uuids" />
                        </div>
                        <div class="space-y-1" v-if="state.form.department_uuids.length > 0">
                            <FormLabel for="bulk_department_mode" :label="$t('employees.bulkEdit.how')" />
                            <FormSelect id="bulk_department_mode" :options="departmentModeOptions" :canClear="false"
                                :canDeselect="false" v-model="state.form.department_mode" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="space-y-1">
                            <FormLabel for="bulk_groups" :label="$t('employees.bulkEdit.employeeGroups')" />
                            <FormSelectMultiple id="bulk_groups" :options="state.options.employeeGroups"
                                :placeholder="$t('employees.bulkEdit.noChange')" v-model="state.form.employee_group_uuids" />
                        </div>
                        <div class="space-y-1" v-if="state.form.employee_group_uuids.length > 0">
                            <FormLabel for="bulk_group_mode" :label="$t('employees.bulkEdit.how')" />
                            <FormSelect id="bulk_group_mode" :options="groupModeOptions" :canClear="false"
                                :canDeselect="false" v-model="state.form.employee_group_mode" />
                        </div>
                    </div>

                    <div class="space-y-1" v-if="isAtLeast('Admin')">
                        <FormLabel for="bulk_status" :label="$t('employees.bulkEdit.status')" />
                        <FormSelect id="bulk_status" :options="statusOptions"
                            :placeholder="$t('employees.bulkEdit.noChange')" v-model="state.form.status" />
                        <p class="text-xs text-gray-500" v-if="state.form.status">
                            {{ statusHint }}
                        </p>
                    </div>

                    <Alert type="danger" v-if="state.isConfirmArchiveOpen"
                        :text="$t('employees.bulkEdit.confirmArchive', { count: props.employees.length })" />

                    <div class="flex items-center justify-end gap-2 pt-2">
                        <button type="button"
                            class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                            @click="closeModal">
                            {{ $t('cancel') }}
                        </button>
                        <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving || !hasChange"
                            @click="apply">
                            {{ state.isConfirmArchiveOpen ? $t('employees.bulkEdit.confirmArchiveButton') : $t('employees.bulkEdit.apply') }}
                        </FormButton>
                    </div>
                </template>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { departmentService } from '@/components/api/user/DepartmentService'
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { employeeService } from '@/components/api/user/EmployeeService'
import { roleService } from '@/components/api/user/RoleService'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'
import type { PropType } from 'vue'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    employees: {
        type: Array as PropType<any[]>,
        default: () => [],
    },
})

const emit = defineEmits(['close', 'updated'])
const { t } = useI18n()
const { isAtLeast } = usePermissions()

const emptyForm = () => ({
    role: null as string | null,
    role_mode: 'replace',
    department_uuids: [] as string[],
    department_mode: 'replace',
    employee_group_uuids: [] as string[],
    employee_group_mode: 'add',
    status: null as string | null,
})

const state = reactive({
    form: emptyForm(),
    options: {
        roles: [] as any[],
        departments: [] as any[],
        employeeGroups: [] as any[],
    },
    error: {} as Error,
    isSaving: false,
    isConfirmArchiveOpen: false,
    result: null as any,
})

const roleModeOptions = computed(() => [
    { value: 'replace', label: t('employees.bulkEdit.roleReplace') },
    { value: 'add', label: t('employees.bulkEdit.roleAdd') },
])

const departmentModeOptions = computed(() => [
    { value: 'replace', label: t('employees.bulkEdit.replaceCurrent') },
    { value: 'add', label: t('employees.bulkEdit.addToCurrent') },
])

const groupModeOptions = computed(() => [
    { value: 'add', label: t('employees.bulkEdit.addToCurrent') },
    { value: 'replace', label: t('employees.bulkEdit.replaceCurrent') },
])

const statusOptions = computed(() => [
    { value: 'active', label: t('employees.bulkEdit.statusActive') },
    { value: 'passive', label: t('employees.bulkEdit.statusPassive') },
    { value: 'archived', label: t('employees.bulkEdit.statusArchived') },
])

const statusHint = computed(() => {
    const hints: Record<string, string> = {
        active: t('employees.bulkEdit.statusActiveHint'),
        passive: t('employees.bulkEdit.statusPassiveHint'),
        archived: t('employees.bulkEdit.statusArchivedHint'),
    }

    return state.form.status ? hints[state.form.status] : ''
})

const hasChange = computed(() => Boolean(state.form.role)
    || Boolean(state.form.status)
    || state.form.department_uuids.length > 0
    || state.form.employee_group_uuids.length > 0)

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return

    state.form = emptyForm()
    state.error = {}
    state.result = null
    state.isConfirmArchiveOpen = false
    fetchOptions()
})

watch(() => state.form.status, () => {
    state.isConfirmArchiveOpen = false
})

async function fetchOptions() {
    if (isAtLeast('Admin') && state.options.roles.length === 0) {
        try {
            const response = await roleService.getAllRoles()
            state.options.roles = (response?.data ?? []).map((role: any) => ({
                value: role.name,
                label: role.name,
            }))
        } catch (error: any) {
            // A missing option list should not stop the rest of the panel from working.
        }
    }

    if (state.options.departments.length === 0) {
        try {
            const response = await departmentService.getAllDepartments({})
            state.options.departments = (response?.data ?? []).map((department: any) => ({
                value: department.uuid,
                label: department.name,
            }))
        } catch (error: any) {
            // Same.
        }
    }

    if (state.options.employeeGroups.length === 0) {
        try {
            const response = await employeeGroupService.getEmployeeGroups({ per_page: 200 })
            state.options.employeeGroups = (response?.data ?? []).map((group: any) => ({
                value: group.uuid,
                label: group.department?.name ? `${group.name} (${group.department.name})` : group.name,
            }))
        } catch (error: any) {
            // Same.
        }
    }
}

function reasonLabel(reason: string) {
    const known = ['self', 'insufficient_level', 'archived', 'no_license_available']

    return known.includes(reason) ? t(`employees.bulkEdit.reasons.${reason}`) : reason
}

function apply() {
    if (!hasChange.value) return

    // Archiving takes the employees off the overview, so it asks once more
    // right here rather than in a second dialog on top of this one.
    if (state.form.status === 'archived' && !state.isConfirmArchiveOpen) {
        state.isConfirmArchiveOpen = true

        return
    }

    save()
}

/** Only what was filled in is sent, so everything else stays as it was. */
async function save() {
    state.error = {}
    state.isSaving = true

    const payload: Record<string, any> = {
        employee_uuids: props.employees.map((employee: any) => employee.uuid),
    }

    if (state.form.role) {
        payload.role = state.form.role
        payload.role_mode = state.form.role_mode
    }
    if (state.form.department_uuids.length > 0) {
        payload.department_uuids = state.form.department_uuids
        payload.department_mode = state.form.department_mode
    }
    if (state.form.employee_group_uuids.length > 0) {
        payload.employee_group_uuids = state.form.employee_group_uuids
        payload.employee_group_mode = state.form.employee_group_mode
    }
    if (state.form.status) {
        payload.status = state.form.status
    }

    try {
        const response = await employeeService.bulkUpdateEmployees(payload)
        state.result = response?.data ?? null
        emit('updated')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}

function closeModal() {
    emit('close')
}
</script>
