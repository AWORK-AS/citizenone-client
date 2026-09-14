<template>
    <Modal size="sm" :title="$t('filter')" :show="props.isModalOpen" @close="closeModal">
        <template #modal-body>
            <div class="space-y-4">
                <div class="space-y-1">
                    <FormLabel for="filter_employee_group" :label="$t('employees.employeeGroups.header')" />
                    <FormSelect id="filter_employee_group" :options="state.options.employeeGroups"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.employee_group" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_role" :label="$t('employees.form.role')" />
                    <FormSelect id="filter_role" :options="state.options.roles"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.role" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_employee_language" :label="$t('citizens.filters.spokenLanguage')" />
                    <FormSelect id="filter_employee_language" :options="state.options.spokenLanguages"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.spoken_language" />
                </div>

                <div class="space-y-1">
                    <FormLabel for="filter_is_active" :label="$t('employees.filters.state')" />
                    <FormSelect id="filter_is_active" :options="activeOptions"
                        :placeholder="$t('citizens.filters.any')" v-model="state.filter.is_active" />
                </div>

                <div class="flex items-center justify-between gap-2 pt-2">
                    <button type="button" class="text-sm font-medium text-gray-600 hover:underline" @click="reset">
                        {{ $t('table.clearFilters') }}
                    </button>
                    <div class="flex items-center gap-2">
                        <button type="button"
                            class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                            @click="closeModal">
                            {{ $t('cancel') }}
                        </button>
                        <FormButton type="button" buttonStyle="primary" @click="apply">
                            {{ $t('filter') }}
                        </FormButton>
                    </div>
                </div>
            </div>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { employeeGroupService } from '@/components/api/user/EmployeeGroupService'
import { roleService } from '@/components/api/user/RoleService'
import { spokenLanguageService } from '@/components/api/user/SpokenLanguageService'
import { useI18n } from 'vue-i18n'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
    filter: {
        type: Object,
        default: () => ({}),
    },
})

const emit = defineEmits(['close', 'setFilter'])
const { t } = useI18n()

const EMPTY = {
    employee_group: null as string | null,
    is_active: null as string | null,
    role: null as string | null,
    spoken_language: null as string | null,
}

const state = reactive({
    filter: { ...EMPTY },
    options: {
        employeeGroups: [] as any[],
        roles: [] as any[],
        spokenLanguages: [] as any[],
    },
})

const activeOptions = computed(() => [
    { value: 'true', label: t('employees.filters.active') },
    { value: 'false', label: t('employees.filters.inactive') },
])

watch(() => props.isModalOpen, (isOpen: boolean) => {
    if (!isOpen) return

    state.filter = { ...EMPTY, ...props.filter }
    fetchOptions()
})

async function fetchOptions() {
    if (state.options.employeeGroups.length === 0) {
        try {
            const response = await employeeGroupService.getEmployeeGroups({ per_page: 200 })
            state.options.employeeGroups = (response?.data ?? []).map((group: any) => ({
                value: group.uuid,
                label: group.department?.name ? `${group.name} (${group.department.name})` : group.name,
            }))
        } catch (error: any) {
            // A missing option list should not stop the rest of the panel from working.
        }
    }

    if (state.options.roles.length === 0) {
        try {
            const response = await roleService.getRoles({})
            state.options.roles = (response?.data ?? []).map((role: any) => ({
                value: role.name,
                label: role.name,
            }))
        } catch (error: any) {
            // Same.
        }
    }

    if (state.options.spokenLanguages.length === 0) {
        try {
            const response = await spokenLanguageService.getSpokenLanguages()
            state.options.spokenLanguages = (response?.data ?? []).map((language: any) => ({
                value: language.uuid,
                label: language.name,
            }))
        } catch (error: any) {
            // Same.
        }
    }
}

function closeModal() {
    emit('close')
}

function apply() {
    emit('setFilter', { ...state.filter })
    closeModal()
}

function reset() {
    state.filter = { ...EMPTY }
    emit('setFilter', { ...EMPTY })
    closeModal()
}
</script>
