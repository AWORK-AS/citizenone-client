<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('taskBoards.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('taskBoards.title') }}</template>

            <Alert type="danger" :text="state.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" class="mb-4" />

            <div class="mb-5 flex flex-wrap items-center gap-3">
                <div v-if="state.boards.length > 1" class="w-64">
                    <FormSelect id="board" name="board" v-model="state.selectedBoardUuid" :options="boardOptions" />
                </div>
                <p v-else-if="selectedBoard" class="text-sm font-semibold text-slate-700">
                    {{ selectedBoard.name }}
                </p>

                <div class="ml-auto flex items-center gap-2">
                    <FormButton v-if="selectedBoard" type="button" buttonStyle="action" @click="openNewTask()">
                        <Icon name="ph:plus" class="size-4" />
                        {{ $t('taskBoards.newTask') }}
                    </FormButton>
                    <FormButton v-if="isManager" type="button" buttonStyle="action" @click="state.isBoardModalOpen = true">
                        <Icon name="ph:columns" class="size-4" />
                        {{ $t('taskBoards.newBoard') }}
                    </FormButton>
                </div>
            </div>

            <p v-if="selectedBoard?.description" class="mb-4 max-w-2xl text-sm text-gray-500">
                {{ selectedBoard.description }}
            </p>

            <!-- No boards yet: say what a board is for rather than showing an
                 empty frame, and only offer to make one to whoever may. -->
            <div v-if="!state.isLoading && !state.boards.length"
                class="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
                <p class="text-sm font-semibold text-slate-700">{{ $t('taskBoards.empty.title') }}</p>
                <p class="mx-auto mt-2 max-w-lg text-sm text-gray-500">{{ $t('taskBoards.empty.description') }}</p>
                <FormButton v-if="isManager" type="button" buttonStyle="primary" class="mt-4"
                    @click="state.isBoardModalOpen = true">
                    {{ $t('taskBoards.empty.action') }}
                </FormButton>
            </div>

            <div v-else-if="selectedBoard" class="items-start gap-3.5 p-2"
                :class="boardScrolls ? 'flex overflow-x-auto pr-4' : 'grid'"
                :style="boardScrolls ? undefined : { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }">
                <div v-for="column in columns" :key="column.uuid"
                    class="min-h-[200px] rounded-[13px] bg-surface-50 p-2.5 transition-colors" :class="[
                        boardScrolls ? 'w-[272px] shrink-0' : '',
                        dragOverKey === column.uuid ? 'ring-2 ring-secondary/50 bg-[#f0faf9]' : '',
                    ]" @dragover.prevent="dragOverKey = column.uuid" @dragleave="dragOverKey = null"
                    @drop="onDrop(column)">
                    <div class="flex items-center gap-2 px-1.5 pb-2.5 pt-1">
                        <span class="size-[9px] rounded-[3px]" :style="{ background: column.color }"></span>
                        <span class="truncate text-[12.5px] font-bold text-slate-700">{{ column.name }}</span>
                        <Icon v-if="column.is_done_column" name="ph:check-circle" class="size-3.5 text-[#177a53]" />
                        <span class="ml-auto rounded-full bg-white px-2 py-px text-[11px] font-semibold text-slate-400">
                            {{ tasksInColumn(column.uuid).length }}
                        </span>
                    </div>

                    <div class="space-y-2">
                        <div v-for="task in tasksInColumn(column.uuid)" :key="task.uuid" draggable="true"
                            @dragstart="dragged = task" @dragend="dragOverKey = null"
                            class="group cursor-grab rounded-[11px] border border-surface-100 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
                            <div class="flex items-start gap-2">
                                <p class="min-w-0 flex-1 text-[13px] font-semibold text-slate-800"
                                    :class="task.completed_at && 'text-slate-400 line-through'">
                                    {{ task.title }}
                                </p>
                                <button type="button" class="text-slate-300 hover:text-slate-500"
                                    :aria-label="$t('taskBoards.actions.edit')" @click="openEditTask(task)">
                                    <Icon name="ph:pencil-simple" class="size-4" />
                                </button>
                            </div>

                            <p v-if="task.description" class="mt-1.5 line-clamp-2 text-[12px] text-slate-500">
                                {{ task.description }}
                            </p>

                            <div class="mt-2 flex flex-wrap items-center gap-1.5">
                                <span v-if="task.type"
                                    class="rounded-full px-2 py-px text-[11px] font-semibold text-white"
                                    :style="{ background: task.type.color }">
                                    {{ task.type.name }}
                                </span>
                                <!-- Late is the one thing worth shouting about on
                                     a card, so it is a colour and not a date. -->
                                <span v-if="task.is_overdue"
                                    class="rounded-full bg-[#fdeaea] px-2 py-px text-[11px] font-bold text-[#a4262c]">
                                    {{ $t('taskBoards.overdue') }}
                                </span>
                                <span v-else-if="task.due_date"
                                    class="rounded-full bg-surface-100 px-2 py-px text-[11px] font-semibold text-slate-500">
                                    {{ formatDateToReadable(task.due_date) }}
                                </span>
                            </div>

                            <div class="mt-3 flex items-center justify-between border-t border-surface-100 pt-2.5">
                                <span v-if="task.assignee" class="flex items-center gap-2">
                                    <span
                                        class="grid size-[22px] place-items-center rounded-[7px] bg-gradient-to-br from-[#8fd6ea] to-[#3aa7c4] text-[10px] font-bold text-white">
                                        {{ assigneeInitials(task.assignee) }}
                                    </span>
                                    <span class="text-[11px] text-slate-400">
                                        {{ task.assignee.firstname }}
                                    </span>
                                </span>
                                <span v-else class="text-[11px] text-slate-300">{{ $t('taskBoards.unassigned') }}</span>
                                <Icon name="ph:dots-six-vertical"
                                    class="size-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                        </div>

                        <p v-if="!tasksInColumn(column.uuid).length"
                            class="px-1.5 py-6 text-center text-xs text-slate-300">-</p>
                    </div>
                </div>
            </div>

            <!-- New / edit task -->
            <Modal size="lg" :show="state.isTaskModalOpen"
                :title="state.editingTask ? $t('taskBoards.form.editTitle') : $t('taskBoards.form.newTitle')"
                @close="state.isTaskModalOpen = false">
                <template #modal-body>
                    <div class="space-y-4 pb-6">
                        <div>
                            <FormLabel for="task-title" :label="$t('taskBoards.form.title')" />
                            <FormTextField id="task-title" name="task-title" v-model="state.draft.title"
                                :placeholder="$t('taskBoards.form.titlePlaceholder')" :maxLength="200" />
                        </div>
                        <div>
                            <FormLabel for="task-description" :label="$t('taskBoards.form.description')" />
                            <FormTextArea id="task-description" name="task-description"
                                v-model="state.draft.description"
                                :placeholder="$t('taskBoards.form.descriptionPlaceholder')" :rows="3" />
                        </div>
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div>
                                <FormLabel for="task-type" :label="$t('taskBoards.form.type')" />
                                <FormSelect id="task-type" name="task-type" v-model="state.draft.task_type_uuid"
                                    :options="typeOptions" />
                            </div>
                            <div>
                                <FormLabel for="task-assignee" :label="$t('taskBoards.form.assignee')" />
                                <FormSelect id="task-assignee" name="task-assignee"
                                    v-model="state.draft.assignee_uuid" :options="employeeOptions" />
                            </div>
                            <div>
                                <FormLabel for="task-due" :label="$t('taskBoards.form.dueDate')" />
                                <FormDateField id="task-due" name="task-due" v-model="state.draft.due_date" />
                            </div>
                            <div v-if="!state.editingTask">
                                <FormLabel for="task-column" :label="$t('taskBoards.form.column')" />
                                <FormSelect id="task-column" name="task-column" v-model="state.draft.column_uuid"
                                    :options="columnOptions" />
                            </div>
                        </div>

                        <div class="flex items-center justify-between border-t border-gray-100 pt-4">
                            <FormButton v-if="state.editingTask" type="button" buttonStyle="danger"
                                @click="confirmDeleteTask">
                                {{ $t('delete') }}
                            </FormButton>
                            <span v-else></span>
                            <div class="flex items-center gap-2">
                                <FormButton type="button" buttonStyle="cancel" @click="state.isTaskModalOpen = false">
                                    {{ $t('cancel') }}
                                </FormButton>
                                <FormButton type="button" buttonStyle="primary" :disabled="!state.draft.title.trim()"
                                    @click="saveTask">
                                    {{ $t('save') }}
                                </FormButton>
                            </div>
                        </div>
                    </div>
                </template>
            </Modal>

            <!-- New board -->
            <Modal size="sm" :show="state.isBoardModalOpen" :title="$t('taskBoards.board.newTitle')"
                @close="state.isBoardModalOpen = false">
                <template #modal-body>
                    <div class="space-y-4 pb-6">
                        <div>
                            <FormLabel for="board-name" :label="$t('taskBoards.board.name')" />
                            <FormTextField id="board-name" name="board-name" v-model="state.boardDraft.name"
                                :placeholder="$t('taskBoards.board.namePlaceholder')" :maxLength="80" />
                        </div>
                        <div>
                            <FormLabel for="board-description" :label="$t('taskBoards.board.description')" />
                            <FormTextArea id="board-description" name="board-description"
                                v-model="state.boardDraft.description"
                                :placeholder="$t('taskBoards.board.descriptionPlaceholder')" :rows="2" />
                        </div>
                        <div>
                            <FormLabel for="board-columns" :label="$t('taskBoards.board.columns')" />
                            <!-- The last column is the finished one, which is what
                                 lets the board report completion by itself. -->
                            <p class="mb-2 text-xs text-gray-500">{{ $t('taskBoards.board.columnsHint') }}</p>
                            <FormTextField id="board-columns" name="board-columns" v-model="state.boardDraft.columns"
                                :placeholder="$t('taskBoards.board.columnsPlaceholder')" :maxLength="300" />
                        </div>

                        <div class="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
                            <FormButton type="button" buttonStyle="cancel" @click="state.isBoardModalOpen = false">
                                {{ $t('cancel') }}
                            </FormButton>
                            <FormButton type="button" buttonStyle="primary" :disabled="!state.boardDraft.name.trim()"
                                @click="saveBoard">
                                {{ $t('save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

            <DialogConfirmation :isModalOpen="state.isDeleteOpen" :message="$t('taskBoards.confirmation.deleteTask') + '?'"
                @close="state.isDeleteOpen = false" @confirm="deleteTask" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { taskService } from '@/components/api/user/TaskService'
import { userService } from '@/components/api/user/UserService'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { successAlert, errorAlert } = useAlert()
const { t } = useI18n()
const { isAtLeast } = usePermissions()

const breadcrumbLinks = [{ name: 'taskBoards.title', translate: true, href: '/tasks' }]

// Shaping a board is a manager's call, so the buttons that do it are hidden for
// everyone else - the endpoints refuse them anyway.
const isManager = computed(() => isAtLeast('Manager'))

const state = reactive({
    error: {} as Error,
    isLoading: true,
    boards: [] as any[],
    selectedBoardUuid: '',
    tasks: [] as any[],
    types: [] as any[],
    employees: [] as any[],
    isTaskModalOpen: false,
    isBoardModalOpen: false,
    isDeleteOpen: false,
    editingTask: null as any,
    draft: {
        title: '',
        description: '',
        task_type_uuid: '',
        assignee_uuid: '',
        due_date: '',
        column_uuid: '',
    },
    boardDraft: { name: '', description: '', columns: '' },
})

// Same rule as the inquiry board: the columns share the width, and past six
// there is not enough room to read a card so the row scrolls instead.
const MAX_FITTED_COLUMNS = 6

const selectedBoard = computed(() => state.boards.find((board: any) => board.uuid === state.selectedBoardUuid) ?? null)
const columns = computed(() => selectedBoard.value?.columns ?? [])
const boardScrolls = computed(() => columns.value.length > MAX_FITTED_COLUMNS)

const boardOptions = computed(() => state.boards.map((board: any) => ({ value: board.uuid, label: board.name })))
const columnOptions = computed(() => columns.value.map((column: any) => ({ value: column.uuid, label: column.name })))
const typeOptions = computed(() => [
    { value: '', label: t('taskBoards.form.noType') },
    ...state.types.filter((type: any) => type.is_active).map((type: any) => ({ value: type.uuid, label: type.name })),
])
const employeeOptions = computed(() => [
    { value: '', label: t('taskBoards.form.nobody') },
    ...state.employees.map((employee: any) => ({
        value: employee.uuid,
        label: `${employee.firstname} ${employee.lastname}`,
    })),
])

onMounted(async () => {
    await fetchBoards()
    fetchTypes()
    fetchEmployees()
})

watch(() => state.selectedBoardUuid, () => fetchTasks())

async function fetchBoards() {
    state.error = {}
    try {
        const response = await taskService.getBoards()
        state.boards = (response?.data ?? []).filter((board: any) => board.is_active)
        if (!state.selectedBoardUuid || !state.boards.some((b: any) => b.uuid === state.selectedBoardUuid)) {
            state.selectedBoardUuid = state.boards[0]?.uuid ?? ''
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.isLoading = false
    }
}

async function fetchTasks() {
    if (!state.selectedBoardUuid) {
        state.tasks = []
        return
    }
    try {
        const response = await taskService.getTasks(state.selectedBoardUuid)
        state.tasks = response?.data ?? []
    } catch (error: any) {
        state.error = error
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

async function fetchEmployees() {
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        state.employees = response?.data ?? []
    } catch (_) {
        state.employees = []
    }
}

function tasksInColumn(columnUuid: string) {
    return state.tasks.filter((task: any) => task.column?.uuid === columnUuid)
}

function assigneeInitials(assignee: any) {
    const first = (assignee?.firstname ?? '').trim()
    const last = (assignee?.lastname ?? '').trim()
    return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase() || '?'
}

function openNewTask(columnUuid = '') {
    state.editingTask = null
    state.draft = {
        title: '',
        description: '',
        task_type_uuid: '',
        assignee_uuid: '',
        due_date: '',
        column_uuid: columnUuid || columns.value[0]?.uuid || '',
    }
    state.isTaskModalOpen = true
}

function openEditTask(task: any) {
    state.editingTask = task
    state.draft = {
        title: task.title ?? '',
        description: task.description ?? '',
        task_type_uuid: task.type?.uuid ?? '',
        assignee_uuid: task.assignee?.uuid ?? '',
        due_date: task.due_date ?? '',
        column_uuid: task.column?.uuid ?? '',
    }
    state.isTaskModalOpen = true
}

async function saveTask() {
    const payload: any = {
        title: state.draft.title.trim(),
        description: state.draft.description.trim() || null,
        task_type_uuid: state.draft.task_type_uuid || null,
        assignee_uuid: state.draft.assignee_uuid || null,
        due_date: state.draft.due_date || null,
    }

    try {
        if (state.editingTask) {
            await taskService.updateTask(state.editingTask.uuid, payload)
        } else {
            await taskService.saveTask(state.selectedBoardUuid, {
                ...payload,
                column_uuid: state.draft.column_uuid || null,
            })
        }
        state.isTaskModalOpen = false
        await fetchTasks()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskBoards.alert.saveFailed'))
    }
}

function confirmDeleteTask() {
    state.isTaskModalOpen = false
    state.isDeleteOpen = true
}

async function deleteTask() {
    state.isDeleteOpen = false
    try {
        await taskService.deleteTask(state.editingTask.uuid)
        state.editingTask = null
        await fetchTasks()
        successAlert(`${t('alert.success')}!`, `${t('taskBoards.alert.deleted')}.`)
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskBoards.alert.deleteFailed'))
    }
}

async function saveBoard() {
    const columnNames = state.boardDraft.columns
        .split(',')
        .map((name: string) => name.trim())
        .filter((name: string) => name.length > 0)

    try {
        await taskService.saveBoard({
            name: state.boardDraft.name.trim(),
            description: state.boardDraft.description.trim() || null,
            // The last one is the finished column, so a board can report what is
            // done without every task being ticked separately.
            columns: (columnNames.length ? columnNames : defaultColumnNames()).map((name, index, all) => ({
                name,
                is_done_column: index === all.length - 1,
            })),
        })
        state.isBoardModalOpen = false
        state.boardDraft = { name: '', description: '', columns: '' }
        await fetchBoards()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.errors?.name?.[0] ?? error?.message ?? t('taskBoards.alert.saveFailed'))
    }
}

function defaultColumnNames() {
    return [t('taskBoards.board.defaults.todo'), t('taskBoards.board.defaults.doing'), t('taskBoards.board.defaults.done')]
}

// Drag and drop between the board's columns.
const dragged = ref<any>(null)
const dragOverKey = ref<string | null>(null)

async function onDrop(column: any) {
    dragOverKey.value = null
    const task = dragged.value
    dragged.value = null

    if (!task || task.column?.uuid === column.uuid) return

    try {
        await taskService.moveTask(task.uuid, column.uuid)
        await fetchTasks()
    } catch (error: any) {
        errorAlert(t('alert.warning'), error?.message ?? t('taskBoards.alert.moveFailed'))
        fetchTasks()
    }
}
</script>
