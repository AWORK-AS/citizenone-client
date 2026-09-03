<template>
    <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
                <h3 class="text-sm font-semibold text-gray-900">{{ tt('citizens.coordinators.title') }}</h3>
                <p class="mt-1 text-xs text-gray-500">{{ tt('citizens.coordinators.hint') }}</p>
            </div>
            <FormButton v-if="!state.isEditing && canEdit" type="button" buttonStyle="action"
                @click="startEditing">
                <Icon name="ph:pencil-simple" class="size-4" aria-hidden="true" />
                {{ $t('edit') }}
            </FormButton>
        </div>

        <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" class="mt-3" />

        <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="space-y-1" v-for="role in ROLES" :key="role.key">
                <FormLabel :for="`coordinator_${role.key}`" :label="$t(role.label)" />

                <FormSelect v-if="state.isEditing" :id="`coordinator_${role.key}`" :options="state.employeeOptions"
                    :placeholder="$t('citizens.coordinators.selectEmployee')"
                    v-model="state.form[role.key]" />

                <p v-else class="text-sm font-medium text-gray-900">
                    {{ coordinatorName(role.key) || $t('citizens.coordinators.notSet') }}
                </p>
            </div>
        </div>

        <div class="mt-4 flex items-center justify-end gap-2" v-if="state.isEditing">
            <button type="button" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                @click="cancelEditing">
                {{ $t('cancel') }}
            </button>
            <FormButton type="button" buttonStyle="primary" :disabled="state.isSaving" @click="save">
                {{ $t('save') }}
            </FormButton>
        </div>
    </div>
</template>

<script setup lang="ts">
import { citizenContactService } from '@/components/api/user/CitizenContactService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useTerminology } from '@/composables/useTerminology'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const props = defineProps({
    citizenUuid: {
        type: String,
        required: true,
    },
})

const emit = defineEmits(['saved'])
const { t } = useI18n()
const { tt } = useTerminology()
const { successAlert } = useAlert()
const { isAtLeast, can } = usePermissions()

const ROLES = [
    { key: 'primary', label: 'citizens.coordinators.primary' },
    { key: 'secondary', label: 'citizens.coordinators.secondary' },
] as const

const canEdit = computed(() => isAtLeast('Admin') || can('update_citizen_contact'))

const state = reactive({
    coordinators: { primary: null as any, secondary: null as any },
    employeeOptions: [] as any[],
    error: {} as Error,
    form: { primary: null as string | null, secondary: null as string | null },
    isEditing: false,
    isSaving: false,
})

onMounted(() => {
    fetchCoordinators()
})

function coordinatorName(role: string) {
    const contact = (state.coordinators as any)[role]
    if (!contact) return ''

    return `${contact.firstname ?? ''} ${contact.lastname ?? ''}`.trim()
}

async function fetchCoordinators() {
    state.error = {}
    try {
        const response = await citizenContactService.getCoordinators(props.citizenUuid)
        state.coordinators = {
            primary: response?.data?.primary ?? null,
            secondary: response?.data?.secondary ?? null,
        }
    } catch (error: any) {
        state.error = error
    }
}

/**
 * The employee list is only needed once someone edits, so it is fetched then
 * rather than on every visit to the tab.
 */
async function startEditing() {
    state.form = {
        primary: state.coordinators.primary?.employee?.uuid ?? null,
        secondary: state.coordinators.secondary?.employee?.uuid ?? null,
    }
    state.isEditing = true

    if (state.employeeOptions.length > 0) return

    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        state.employeeOptions = (response?.data ?? []).map((employee: any) => ({
            value: employee.uuid,
            label: `${employee.firstname ?? ''} ${employee.lastname ?? ''}`.trim(),
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
        const response = await citizenContactService.updateCoordinators(props.citizenUuid, {
            primary_user_uuid: state.form.primary,
            secondary_user_uuid: state.form.secondary,
        })
        state.coordinators = {
            primary: response?.data?.primary ?? null,
            secondary: response?.data?.secondary ?? null,
        }
        state.isEditing = false
        successAlert(`${t('alert.success')}!`, `${t('citizens.coordinators.saved')}.`)
        emit('saved')
    } catch (error: any) {
        state.error = error
    }
    state.isSaving = false
}
</script>
