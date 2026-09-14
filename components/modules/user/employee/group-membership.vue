<template>
    <div>
        <div class="flex flex-wrap items-start justify-between gap-3">
            <p class="text-sm text-gray-600">{{ $t('employees.employeeGroups.hint') }}</p>
            <FormButton v-if="!state.isEditing && canEdit" type="button" buttonStyle="action" @click="startEditing">
                <Icon name="ph:pencil-simple" class="size-4" aria-hidden="true" />
                {{ $t('edit') }}
            </FormButton>
        </div>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" class="mt-3" />

        <div class="mt-3" v-if="!state.isEditing">
            <div class="flex flex-wrap gap-2" v-if="state.groups.length > 0">
                <Badge type="primary" v-for="group in state.groups" :key="group.uuid">
                    <p class="text-xxs px-2">{{ group.name }}</p>
                </Badge>
            </div>
            <p class="text-sm text-gray-500" v-else>{{ $t('employees.employeeGroups.none') }}</p>
        </div>

        <div class="mt-3 space-y-3" v-else>
            <FormSelectMultiple id="employee_groups" :options="state.groupOptions"
                :placeholder="$t('employees.employeeGroups.selectGroups')" v-model="state.selected" />
            <div class="flex items-center justify-end gap-2">
                <button type="button" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                    @click="cancelEditing">
                    {{ $t('cancel') }}
                </button>
                <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving" @click="save">
                    {{ $t('save') }}
                </FormButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    employeeUuid: {
        type: String,
        required: true,
    },
})

const { t } = useI18n()
const { successAlert } = useAlert()
const { isAtLeast } = usePermissions()

const canEdit = computed(() => isAtLeast('Admin'))

const state = reactive({
    error: {} as Error,
    groupOptions: [] as any[],
    groups: [] as any[],
    isEditing: false,
    isSaving: false,
    selected: [] as string[],
})

onMounted(() => {
    fetchGroups()
})

async function fetchGroups() {
    state.error = {}
    try {
        const response = await employeeGroupService.getGroupsForEmployee(props.employeeUuid)
        state.groups = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

/**
 * The full group list is only needed once someone edits, so it is fetched then.
 */
async function startEditing() {
    state.selected = state.groups.map((group: any) => group.uuid)
    state.isEditing = true

    if (state.groupOptions.length > 0) return

    try {
        const response = await employeeGroupService.getEmployeeGroups({ per_page: 200 })
        state.groupOptions = (response?.data ?? []).map((group: any) => ({
            value: group.uuid,
            label: group.department?.name ? `${group.name} (${group.department.name})` : group.name,
        }))
    } catch (error: any) {
        state.error = error
    }
}

function cancelEditing() {
    state.isEditing = false
    state.error = {}
}

async function save() {
    state.error = {}
    state.isSaving = true
    try {
        const response = await employeeGroupService.setGroupsForEmployee(props.employeeUuid, {
            group_uuids: state.selected,
        })
        state.groups = response?.data ?? []
        state.isEditing = false
        successAlert(`${t('alert.success')}!`, `${t('employees.employeeGroups.saved')}.`)
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
