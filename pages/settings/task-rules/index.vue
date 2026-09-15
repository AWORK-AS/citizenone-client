<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('taskRules.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('taskRules.title') }}</template>

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">{{ $t('taskRules.description') }}</p>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <p class="text-sm font-semibold text-slate-700">{{ $t('taskRules.listTitle') }}</p>
                        <FormButton v-if="isManager" type="button" buttonStyle="action" @click="openNew">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('taskRules.add') }}
                        </FormButton>
                    </div>

                    <p v-if="!state.rules.length" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('taskRules.empty') }}
                    </p>

                    <div v-for="rule in state.rules" :key="rule.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-3 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <p class="text-sm font-medium text-gray-900"
                                :class="!rule.is_active && 'text-gray-400 line-through'">
                                {{ rule.name }}
                            </p>
                            <!-- One line that reads as the rule itself, so nobody
                                 has to open it to see what it does. -->
                            <p class="mt-0.5 text-xs text-gray-500">{{ ruleSummary(rule) }}</p>
                        </div>

                        <div v-if="isManager" class="flex items-center gap-2">
                            <Tooltip
                                :text="rule.is_active ? $t('consultantSkills.deactivate') : $t('consultantSkills.activate')">
                                <FormButton type="button" buttonStyle="action"
                                    :aria-label="rule.is_active ? $t('consultantSkills.deactivate') : $t('consultantSkills.activate')"
                                    @click="toggleActive(rule)">
                                    <Icon :name="rule.is_active ? 'ph:eye' : 'ph:eye-slash'" class="size-4" />
                                </FormButton>
                            </Tooltip>
                            <FormButton type="button" buttonStyle="action" @click="openEdit(rule)">
                                <Icon name="ph:pencil-simple" class="size-4" />
                            </FormButton>
                            <FormButton type="button" buttonStyle="danger" @click="confirmDelete(rule)">
                                <Icon name="ph:trash" class="size-4" />
                            </FormButton>
                        </div>
                    </div>
                </div>
            </div>

            <Modal size="sm" :show="state.isModalOpen"
                :title="state.editing ? $t('taskRules.form.editTitle') : $t('taskRules.form.newTitle')"
                @close="state.isModalOpen = false">
                <template #modal-body>
                    <div class="space-y-4 pb-6">
                        <div>
                            <FormLabel for="rule-name" :label="$t('taskRules.form.name')" />
                            <FormTextField id="rule-name" name="rule-name" v-model="state.draft.name"
                                :placeholder="$t('taskRules.form.namePlaceholder')" :maxLength="80" />
                        </div>
                        <div>
                            <FormLabel for="rule-event" :label="$t('taskRules.form.event')" />
                            <FormSelect id="rule-event" name="rule-event" v-model="state.draft.event"
                                :options="eventOptions" />
                        </div>

                        <p class="text-xs text-gray-500">{{ $t('taskRules.form.conditionsHint') }}</p>

                        <div class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <FormLabel for="rule-board" :label="$t('taskRules.form.board')" />
                                <FormSelect id="rule-board" name="rule-board" v-model="state.draft.board_uuid"
                                    :options="boardOptions" />
                            </div>
                            <div>
                                <FormLabel for="rule-column" :label="$t('taskRules.form.column')" />
                                <FormSelect id="rule-column" name="rule-column" v-model="state.draft.column_uuid"
                                    :options="columnOptions" />
                            </div>
                            <div>
                                <FormLabel for="rule-type" :label="$t('taskRules.form.type')" />
                                <FormSelect id="rule-type" name="rule-type" v-model="state.draft.task_type_uuid"
                                    :options="typeOptions" />
                            </div>
                            <div>
                                <FormLabel for="rule-role" :label="$t('taskRules.form.role')" />
                                <FormSelect id="rule-role" name="rule-role" v-model="state.draft.notify_role_id"
                                    :options="roleOptions" />
                            </div>
                        </div>

                        <div class="flex w-fit cursor-pointer items-center gap-2"
                            @click="state.draft.notify_assignee = !state.draft.notify_assignee">
                            <FormCheckbox :value="state.draft.notify_assignee" />
                            <span class="text-sm">{{ $t('taskRules.form.notifyAssignee') }}</span>
                        </div>

                        <div class="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                            <FormButton type="button" buttonStyle="cancel" @click="state.isModalOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="!canSave" @click="save">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen" :message="$t('taskRules.confirmation.delete') + '?'"
                @close="state.isDeleteOpen = false" @confirm="remove" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-application', requiredApplication: 'tasks_workflow_enabled' })

import { taskService } from '@/components/api/user/TaskService'
import { roleService } from '@/components/api/user/RoleService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast } = usePermissions()

const isManager = computed(() => isAtLeast('Manager'))

const breadcrumbLinks = [{ name: 'taskRules.title', translate: true, href: '/settings/task-rules' }]

const EVENTS = ['created', 'entered_column', 'completed', 'overdue']

const state = reactive({
    error: {} as Error,
    rules: [] as any[],
    boards: [] as any[],
    types: [] as any[],
    roles: [] as any[],
    isModalOpen: false,
    isDeleteOpen: false,
    editing: null as any,
    selected: null as any,
    draft: {
        name: '',
        event: 'created',
        board_uuid: '',
        column_uuid: '',
        task_type_uuid: '',
        notify_role_id: '',
        notify_assignee: false,
    },
})

const eventOptions = computed(() => EVENTS.map((event) => ({ value: event, label: t(`taskRules.events.${event}`) })))
const anyOption = computed(() => ({ value: '', label: t('taskRules.form.any') }))

const boardOptions = computed(() => [
    anyOption.value,
    ...state.boards.map((board: any) => ({ value: board.uuid, label: board.name })),
])

// Only the chosen board's columns: a column from another board would never match
// and the refusal would look like a bug.
const columnOptions = computed(() => {
    const board = state.boards.find((item: any) => item.uuid === state.draft.board_uuid)
    return [
        anyOption.value,
        ...(board?.columns ?? []).map((column: any) => ({ value: column.uuid, label: column.name })),
    ]
})

const typeOptions = computed(() => [
    anyOption.value,
    ...state.types.map((type: any) => ({ value: type.uuid, label: type.name })),
])

const roleOptions = computed(() => [
    { value: '', label: t('taskRules.form.noRole') },
    ...state.roles.map((role: any) => ({ value: role.id, label: role.name })),
])

// A rule that tells nobody does nothing, so saving one is not offered.
const canSave = computed(() =>
    state.draft.name.trim().length > 0 && (!!state.draft.notify_role_id || state.draft.notify_assignee),
)

watch(() => state.draft.board_uuid, () => {
    const board = state.boards.find((item: any) => item.uuid === state.draft.board_uuid)
    const stillOnBoard = (board?.columns ?? []).some((column: any) => column.uuid === state.draft.column_uuid)
    if (!stillOnBoard) state.draft.column_uuid = ''
})

onMounted(() => {
    fetchRules()
    fetchBoards()
    fetchTypes()
    fetchRoles()
})

async function fetchRules() {
    state.error = {}
    try {
        const response = await taskService.getRules()
        state.rules = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function fetchBoards() {
    try {
        const response = await taskService.getBoards()
        state.boards = response?.data ?? []
    } catch (_) {
        state.boards = []
    }
}

async function fetchTypes() {
    try {
        const response = await taskService.getTypes()
        state.types = response?.data ?? []
    } catch (_) {
        state.types = []
    }
}

async function fetchRoles() {
    try {
        const response = await roleService.getAllRoles()
        state.roles = response?.data ?? []
    } catch (_) {
        state.roles = []
    }
}

function ruleSummary(rule: any) {
    const parts = [t(`taskRules.events.${rule.event}`)]

    if (rule.board?.uuid) parts.push(rule.board.name)
    if (rule.column?.uuid) parts.push(rule.column.name)
    if (rule.type?.uuid) parts.push(rule.type.name)

    const told = [
        rule.role?.name,
        rule.notify_assignee ? t('taskRules.form.notifyAssignee') : null,
    ].filter(Boolean)

    return `${parts.join(' · ')} → ${told.join(', ') || t('taskRules.form.noRole')}`
}

function openNew() {
    state.editing = null
    state.draft = {
        name: '',
        event: 'created',
        board_uuid: '',
        column_uuid: '',
        task_type_uuid: '',
        notify_role_id: '',
        notify_assignee: false,
    }
    state.isModalOpen = true
}

function openEdit(rule: any) {
    state.editing = rule
    state.draft = {
        name: rule.name ?? '',
        event: rule.event ?? 'created',
        board_uuid: rule.board?.uuid ?? '',
        column_uuid: rule.column?.uuid ?? '',
        task_type_uuid: rule.type?.uuid ?? '',
        notify_role_id: rule.role?.id ?? '',
        notify_assignee: !!rule.notify_assignee,
    }
    state.isModalOpen = true
}

async function save() {
    const payload = {
        name: state.draft.name.trim(),
        event: state.draft.event,
        board_uuid: state.draft.board_uuid || null,
        column_uuid: state.draft.column_uuid || null,
        task_type_uuid: state.draft.task_type_uuid || null,
        notify_role_id: state.draft.notify_role_id || null,
        notify_assignee: state.draft.notify_assignee,
    }

    try {
        if (state.editing) {
            await taskService.updateRule(state.editing.uuid, payload)
        } else {
            await taskService.saveRule(payload)
        }
        state.isModalOpen = false
        await fetchRules()
    } catch (error: any) {
        errorAlert(
            t('alert.warning'),
            error?.errors?.notify_role_id?.[0] ?? error?.message ?? t('taskRules.alert.saveFailed'),
        )
    }
}

async function toggleActive(rule: any) {
    try {
        await taskService.updateRule(rule.uuid, { is_active: !rule.is_active })
        await fetchRules()
    } catch (error: any) {
        state.error = error
    }
}

function confirmDelete(rule: any) {
    state.selected = rule
    state.isDeleteOpen = true
}

async function remove() {
    state.isDeleteOpen = false
    try {
        await taskService.deleteRule(state.selected.uuid)
        await fetchRules()
        successAlert(`${t('alert.success')}!`, `${t('taskRules.alert.deleted')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskRules.alert.deleteFailed'))
    }
}
</script>
