<template>
    <Modal size="md" :show="show" :title="modalTitle" @close="handleClose">
        <template #modal-body>
            <div v-if="!pendingDeleteColumn" class="space-y-6 pb-6">
                <div class="space-y-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <FormLabel for="manage-board-name" :label="$t('taskBoards.board.name')" />
                            <span v-if="!props.board?.is_active"
                                class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                {{ $t('taskBoards.board.inactiveSuffix') }}
                            </span>
                        </div>
                        <FormTextField id="manage-board-name" name="manage-board-name" v-model="boardDraft.name"
                            :placeholder="$t('taskBoards.board.namePlaceholder')" :maxLength="80" />
                    </div>
                    <div>
                        <FormLabel for="manage-board-description" :label="$t('taskBoards.board.description')" />
                        <FormTextArea id="manage-board-description" name="manage-board-description"
                            v-model="boardDraft.description"
                            :placeholder="$t('taskBoards.board.descriptionPlaceholder')" :rows="2" />
                    </div>
                    <div class="flex justify-end">
                        <FormButton type="button" buttonStyle="primary" :disabled="!boardDraft.name.trim()"
                            @click="saveBoardDetails">
                            {{ $t('save') }}
                        </FormButton>
                    </div>
                </div>

                <div class="border-t border-gray-100 pt-5">
                    <p class="mb-3 text-sm font-semibold text-slate-700">{{ $t('taskBoards.board.columns') }}</p>

                    <div v-for="(column, index) in localColumns" :key="column.uuid"
                        class="flex flex-wrap items-center gap-2 border-b border-gray-50 py-2 last:border-b-0">
                        <template v-if="editingColumnUuid === column.uuid">
                            <div class="w-40">
                                <FormTextField :id="`col-name-${column.uuid}`" :name="`col-name-${column.uuid}`"
                                    v-model="columnEdit.name" :maxLength="60" />
                            </div>
                            <div class="w-32">
                                <FormColorPicker :id="`col-color-${column.uuid}`" v-model="columnEdit.color" />
                            </div>
                            <div class="flex w-fit cursor-pointer items-center gap-1.5 text-xs text-slate-600"
                                @click="columnEdit.is_done_column = !columnEdit.is_done_column">
                                <FormCheckbox :value="columnEdit.is_done_column" />
                                {{ $t('taskBoards.manage.doneColumn') }}
                            </div>
                            <div class="ml-auto flex items-center gap-2">
                                <FormButton type="button" buttonStyle="cancel" @click="editingColumnUuid = ''">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!columnEdit.name.trim()"
                                    @click="saveColumnEdit(column)">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </template>
                        <template v-else>
                            <span class="size-3 rounded-[4px]" :style="{ background: column.color }"></span>
                            <span class="text-sm font-medium text-slate-800">{{ column.name }}</span>
                            <Icon v-if="column.is_done_column" name="ph:check-circle" class="size-3.5 text-[#177a53]" />
                            <div class="ml-auto flex items-center gap-1">
                                <Tooltip :text="$t('inquiryPipelineStages.actions.moveUp')">
                                    <FormButton type="button" buttonStyle="action" :disabled="index === 0"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveUp')"
                                        @click="moveColumn(index, -1)">
                                        <Icon name="ph:arrow-up" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <Tooltip :text="$t('inquiryPipelineStages.actions.moveDown')">
                                    <FormButton type="button" buttonStyle="action"
                                        :disabled="index === localColumns.length - 1"
                                        :aria-label="$t('inquiryPipelineStages.actions.moveDown')"
                                        @click="moveColumn(index, 1)">
                                        <Icon name="ph:arrow-down" class="size-4" />
                                    </FormButton>
                                </Tooltip>
                                <FormButton type="button" buttonStyle="action" @click="startEditColumn(column)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </FormButton>
                                <FormButton type="button" buttonStyle="danger" @click="startDeleteColumn(column)">
                                    <Icon name="ph:trash" class="size-4" />
                                </FormButton>
                            </div>
                        </template>
                    </div>

                    <p v-if="!localColumns.length" class="py-4 text-center text-xs text-slate-400">
                        {{ $t('taskBoards.manage.noColumns') }}
                    </p>

                    <div class="mt-4 flex flex-wrap items-end gap-3 border-t border-gray-100 pt-4">
                        <div class="w-40">
                            <FormLabel for="new-col-name" :label="$t('taskBoards.manage.columnName')" />
                            <FormTextField id="new-col-name" name="new-col-name" v-model="newColumn.name"
                                :placeholder="$t('taskBoards.manage.columnNamePlaceholder')" :maxLength="60" />
                        </div>
                        <div class="w-32">
                            <FormLabel for="new-col-color" :label="$t('taskBoards.manage.columnColor')" />
                            <FormColorPicker id="new-col-color" v-model="newColumn.color" />
                        </div>
                        <div class="flex w-fit cursor-pointer items-center gap-1.5 pb-2 text-xs text-slate-600"
                            @click="newColumn.is_done_column = !newColumn.is_done_column">
                            <FormCheckbox :value="newColumn.is_done_column" />
                            {{ $t('taskBoards.manage.doneColumn') }}
                        </div>
                        <FormButton type="button" buttonStyle="action" :disabled="!newColumn.name.trim()"
                            @click="addColumn">
                            <Icon name="ph:plus" class="size-4" />
                            {{ $t('taskBoards.manage.addColumn') }}
                        </FormButton>
                    </div>
                </div>

                <div class="flex items-center justify-between border-t border-gray-100 pt-5">
                    <div class="flex items-center gap-2">
                        <FormButton type="button" buttonStyle="danger" @click="isDeleteBoardOpen = true">
                            {{ $t('taskBoards.manage.deleteBoard') }}
                        </FormButton>
                        <FormButton type="button" buttonStyle="cancel" @click="toggleBoardActive">
                            {{ $t(props.board?.is_active ? 'taskBoards.manage.deactivateBoard' : 'taskBoards.manage.reactivateBoard') }}
                        </FormButton>
                    </div>
                    <FormButton type="button" buttonStyle="cancel" @click="handleClose">
                        {{ $t('close') }}
                    </FormButton>
                </div>
            </div>

            <!-- Deleting a column moves its tasks rather than losing them, same
                 rule as the trash icon on the board itself. -->
            <div v-else class="space-y-4 pb-6">
                <p class="text-sm text-slate-600">
                    {{ $t('taskBoards.manage.moveTasksHint', { name: pendingDeleteColumn.name }) }}
                </p>
                <div v-if="otherColumnOptions.length > 1">
                    <FormLabel for="move-target" :label="$t('taskBoards.manage.moveTasksTarget')" />
                    <FormSelect id="move-target" name="move-target" v-model="moveTargetUuid"
                        :options="otherColumnOptions" />
                </div>
                <p v-else class="text-xs text-slate-400">{{ $t('taskBoards.manage.noOtherColumns') }}</p>
                <div class="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                    <FormButton type="button" buttonStyle="cancel" @click="pendingDeleteColumn = null">
                        {{ $t('cancel') }}
                    </FormButton>
                    <FormButton type="button" buttonStyle="danger" @click="confirmDeleteColumn">
                        {{ $t('delete') }}
                    </FormButton>
                </div>
            </div>
        </template>
    </Modal>

    <DialogConfirmation :isModalOpen="isDeleteBoardOpen" :message="$t('taskBoards.confirmation.deleteBoard') + '?'"
        @close="isDeleteBoardOpen = false" @confirm="confirmDeleteBoard" />
</template>

<script setup lang="ts">
import { taskService } from '@/components/api/user/TaskService'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const props = defineProps<{ show: boolean; board: any | null }>()
const emit = defineEmits<{ close: []; changed: [] }>()

const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()

const DEFAULT_COLOR = '#94a3b8'

const boardDraft = reactive({ name: '', description: '' })
const localColumns = ref<any[]>([])
const editingColumnUuid = ref('')
const columnEdit = reactive({ name: '', color: DEFAULT_COLOR, is_done_column: false })
const newColumn = reactive({ name: '', color: DEFAULT_COLOR, is_done_column: false })
const pendingDeleteColumn = ref<any>(null)
const moveTargetUuid = ref('')
const isDeleteBoardOpen = ref(false)

// The board prop is refreshed by the parent after every save, so this keeps
// the form and column list in sync with server truth rather than drifting
// from whatever was locally edited.
watch(() => props.board, (board) => {
    boardDraft.name = board?.name ?? ''
    boardDraft.description = board?.description ?? ''
    localColumns.value = board?.columns ? [...board.columns] : []
    editingColumnUuid.value = ''
    pendingDeleteColumn.value = null
}, { immediate: true })

const modalTitle = computed(() =>
    pendingDeleteColumn.value ? t('taskBoards.manage.deleteColumnTitle') : t('taskBoards.manage.title'),
)

const otherColumnOptions = computed(() => [
    { value: '', label: t('taskBoards.manage.leaveUnassigned') },
    ...localColumns.value
        .filter((column: any) => column.uuid !== pendingDeleteColumn.value?.uuid)
        .map((column: any) => ({ value: column.uuid, label: column.name })),
])

function handleClose() {
    emit('close')
}

async function saveBoardDetails() {
    if (!props.board) return

    try {
        await taskService.updateBoard(props.board.uuid, {
            name: boardDraft.name.trim(),
            description: boardDraft.description.trim() || null,
        })
        successAlert(`${t('alert.success')}!`, `${t('taskBoards.alert.boardUpdated')}.`)
        emit('changed')
    } catch (error: any) {
        errorAlert(
            t('alert.warning'),
            error?.errors?.name?.[0] ?? error?.message ?? t('taskBoards.alert.boardUpdateFailed'),
        )
    }
}

async function toggleBoardActive() {
    if (!props.board) return

    const wasActive = props.board.is_active
    try {
        await taskService.updateBoard(props.board.uuid, { is_active: !wasActive })
        successAlert(
            `${t('alert.success')}!`,
            `${t(wasActive ? 'taskBoards.alert.boardDeactivated' : 'taskBoards.alert.boardReactivated')}.`,
        )
        emit('changed')
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskBoards.alert.boardStatusUpdateFailed'))
    }
}

function startEditColumn(column: any) {
    editingColumnUuid.value = column.uuid
    columnEdit.name = column.name
    columnEdit.color = column.color ?? DEFAULT_COLOR
    columnEdit.is_done_column = !!column.is_done_column
}

async function saveColumnEdit(column: any) {
    try {
        await taskService.updateColumn(column.uuid, {
            name: columnEdit.name.trim(),
            color: columnEdit.color || null,
            is_done_column: columnEdit.is_done_column,
        })
        editingColumnUuid.value = ''
        successAlert(`${t('alert.success')}!`, `${t('taskBoards.alert.columnUpdated')}.`)
        emit('changed')
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskBoards.alert.columnUpdateFailed'))
    }
}

async function addColumn() {
    if (!props.board) return

    try {
        await taskService.saveColumn(props.board.uuid, {
            name: newColumn.name.trim(),
            color: newColumn.color || null,
            is_done_column: newColumn.is_done_column,
        })
        newColumn.name = ''
        newColumn.color = DEFAULT_COLOR
        newColumn.is_done_column = false
        emit('changed')
    } catch (error: any) {
        errorAlert(
            t('alert.warning'),
            error?.errors?.name?.[0] ?? error?.message ?? t('taskBoards.alert.columnSaveFailed'),
        )
    }
}

async function moveColumn(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= localColumns.value.length || !props.board) return

    const reordered = [...localColumns.value]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(target, 0, moved)
    localColumns.value = reordered

    try {
        await taskService.reorderColumns(props.board.uuid, reordered.map((column: any) => column.uuid))
        emit('changed')
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskBoards.alert.reorderFailed'))
        emit('changed')
    }
}

function startDeleteColumn(column: any) {
    pendingDeleteColumn.value = column
    moveTargetUuid.value = ''
}

async function confirmDeleteColumn() {
    if (!pendingDeleteColumn.value) return

    try {
        await taskService.deleteColumn(pendingDeleteColumn.value.uuid, {
            move_to_column_uuid: moveTargetUuid.value || null,
        })
        pendingDeleteColumn.value = null
        successAlert(`${t('alert.success')}!`, `${t('taskBoards.alert.columnDeleted')}.`)
        emit('changed')
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskBoards.alert.columnDeleteFailed'))
    }
}

async function confirmDeleteBoard() {
    isDeleteBoardOpen.value = false
    if (!props.board) return

    try {
        await taskService.deleteBoard(props.board.uuid)
        successAlert(`${t('alert.success')}!`, `${t('taskBoards.alert.boardDeleted')}.`)
        emit('changed')
        emit('close')
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskBoards.alert.boardDeleteFailed'))
    }
}
</script>
