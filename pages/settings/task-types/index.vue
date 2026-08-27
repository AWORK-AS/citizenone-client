<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('taskTypes.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('taskTypes.title') }}</template>

            <ModulesUserSettingsTab />
            <ModulesUserSettingsCatalogSubTab id="sub-tab-catalog" class="mt-5" />

            <div class="mt-8 space-y-5">
                <Alert type="danger" :text="state.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <p class="max-w-2xl text-sm text-gray-500">{{ $t('taskTypes.description') }}</p>

                <div class="rounded-lg border border-gray-200 bg-white">
                    <div v-if="isManager" class="flex flex-wrap items-end gap-3 border-b border-gray-100 px-4 py-3">
                        <div class="w-64">
                            <FormLabel for="new-name" :label="$t('taskTypes.form.name')" />
                            <FormTextField id="new-name" name="new-name" v-model="state.draft.name"
                                :placeholder="$t('taskTypes.form.namePlaceholder')" :maxLength="60" />
                        </div>
                        <div class="w-40">
                            <FormLabel for="new-color" :label="$t('taskTypes.form.color')" />
                            <FormColorPicker id="new-color" v-model="state.draft.color" />
                        </div>
                        <FormButton type="button" buttonStyle="action" :disabled="!state.draft.name.trim()" @click="add">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('taskTypes.add') }}
                        </FormButton>
                    </div>

                    <p v-if="!state.types.length" class="px-4 py-5 text-sm text-gray-400">
                        {{ $t('taskTypes.empty') }}
                    </p>

                    <div v-for="(type, index) in state.types" :key="type.uuid"
                        class="flex flex-wrap items-center gap-3 border-b border-gray-50 px-4 py-2.5 last:border-b-0">
                        <div class="min-w-0 flex-1">
                            <template v-if="state.editing === type.uuid">
                                <div class="flex flex-wrap items-center gap-3">
                                    <div class="w-56">
                                        <FormTextField :id="`name-${type.uuid}`" :name="`name-${type.uuid}`"
                                            v-model="state.edit.name" :placeholder="type.name" :maxLength="60" />
                                    </div>
                                    <div class="w-40">
                                        <FormColorPicker :id="`color-${type.uuid}`" v-model="state.edit.color" />
                                    </div>
                                </div>
                            </template>
                            <div v-else class="flex items-center gap-2">
                                <span class="size-3 rounded-[4px]" :style="{ background: type.color }"></span>
                                <p class="text-sm font-medium text-gray-900"
                                    :class="!type.is_active && 'text-gray-400 line-through'">
                                    {{ type.name }}
                                </p>
                            </div>
                        </div>

                        <div v-if="isManager" class="flex items-center gap-2">
                            <template v-if="state.editing === type.uuid">
                                <FormButton type="button" buttonStyle="cancel" @click="state.editing = ''">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!state.edit.name.trim()"
                                    @click="save(type)">
                                    {{ $t('save') }}
                                </FormButton>
                            </template>
                            <template v-else>
                                <Tooltip :text="$t('inquiryPipelineStages.actions.moveUp')">
                                    <FormButton type="button" buttonStyle="action" :disabled="index === 0"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveUp')"
                                        @click="move(index, -1)">
                                        <Icon name="ph:arrow-up" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('inquiryPipelineStages.actions.moveDown')">
                                    <FormButton type="button" buttonStyle="action"
                                        :disabled="index === state.types.length - 1"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveDown')"
                                        @click="move(index, 1)">
                                        <Icon name="ph:arrow-down" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip
                                    :text="type.is_active ? $t('consultantSkills.deactivate') : $t('consultantSkills.activate')">
                                    <FormButton type="button" buttonStyle="action"
                                        :aria-label="type.is_active ? $t('consultantSkills.deactivate') : $t('consultantSkills.activate')"
                                        @click="toggleActive(type)">
                                        <Icon :name="type.is_active ? 'ph:eye' : 'ph:eye-slash'" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <FormButton type="button" buttonStyle="action" @click="startEdit(type)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </FormButton>
                                <FormButton type="button" buttonStyle="danger" @click="confirmDelete(type)">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </template>
                        </div>
                    </div>
                </div>
            </div>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen" :message="$t('taskTypes.confirmation.delete') + '?'"
                @close="state.isDeleteOpen = false" @confirm="remove" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'require-application', requiredApplication: 'tasks_workflow_enabled' })

import { taskService } from '@/components/api/user/TaskService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast } = usePermissions()

const isManager = computed(() => isAtLeast('Manager'))

const breadcrumbLinks = [{ name: 'taskTypes.title', translate: true, href: '/settings/task-types' }]

const DEFAULT_COLOR = '#94a3b8'

const state = reactive({
    error: {} as Error,
    types: [] as any[],
    draft: { name: '', color: DEFAULT_COLOR },
    edit: { name: '', color: DEFAULT_COLOR },
    editing: '',
    isDeleteOpen: false,
    selected: null as any,
})

onMounted(() => {
    fetchTypes()
})

async function fetchTypes() {
    state.error = {}
    try {
        const response = await taskService.getTypes()
        state.types = response?.data ?? []
    } catch (error: any) {
        state.error = error
    }
}

async function add() {
    try {
        await taskService.saveType({
            name: state.draft.name.trim(),
            color: state.draft.color || null,
        })
        state.draft = { name: '', color: DEFAULT_COLOR }
        await fetchTypes()
    } catch (error: any) {
        // A duplicate name comes back as a field error, not a message.
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('taskTypes.alert.saveFailed'))
    }
}

function startEdit(type: any) {
    state.editing = type.uuid
    state.edit = { name: type.name, color: type.color ?? DEFAULT_COLOR }
}

async function save(type: any) {
    try {
        await taskService.updateType(type.uuid, {
            name: state.edit.name.trim(),
            color: state.edit.color || null,
        })
        state.editing = ''
        await fetchTypes()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('taskTypes.alert.saveFailed'))
    }
}

async function toggleActive(type: any) {
    try {
        await taskService.updateType(type.uuid, { is_active: !type.is_active })
        await fetchTypes()
    } catch (error: any) {
        state.error = error
    }
}

function confirmDelete(type: any) {
    state.selected = type
    state.isDeleteOpen = true
}

async function remove() {
    state.isDeleteOpen = false
    try {
        await taskService.deleteType(state.selected.uuid)
        await fetchTypes()
        successAlert(`${t('alert.success')}!`, `${t('taskTypes.alert.deleted')}.`)
    } catch (error: any) {
        // A type already on tasks is refused, and the refusal says to deactivate
        // it instead so the history stays readable.
        errorAlert(t('alert.warning'), error?.message ?? t('taskTypes.alert.deleteFailed'))
    }
}

async function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= state.types.length) return

    const reordered = [...state.types]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    state.types = reordered

    try {
        const response = await taskService.reorderTypes(reordered.map((item: any) => item.uuid))
        state.types = response?.data ?? reordered
    } catch (error: any) {
        state.error = error
        fetchTypes()
    }
}
</script>
