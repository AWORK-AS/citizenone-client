<template>
    <Modal size="lg" :title="$t('meetings.tasks.title')" :show="show" @close="emit('close')">
        <template #modal-body>
            <LoadingSpinner :isActive="state.loading">
                <div class="space-y-4">
                    <Alert type="danger" :text="state.error?.message" v-if="state.error?.message" />

                    <p v-if="!state.loading && !state.items.length && !state.error?.message" class="text-sm text-gray-600">
                        {{ $t('meetings.tasks.none') }}
                    </p>

                    <template v-if="state.items.length">
                        <p class="text-xs text-[#1b6d8a] flex items-center gap-1.5">
                            <Icon name="ph:sparkle" class="h-3.5 w-3.5" /> {{ $t('meetings.tasks.intro') }}
                        </p>

                        <ul class="space-y-3">
                            <li v-for="(item, index) in state.items" :key="index"
                                class="rounded-xl border p-3 space-y-2" :class="item.selected ? 'border-[#2dbab2]/60 bg-[#f0faf9]/50' : 'border-gray-200 opacity-60'">
                                <div class="flex items-start gap-3">
                                    <input type="checkbox" v-model="item.selected" class="mt-2.5 h-4 w-4 rounded border-gray-300"
                                        :aria-label="$t('meetings.tasks.include')" :disabled="item.created" />
                                    <div class="flex-1 space-y-2">
                                        <input v-model="item.title" maxlength="200" :disabled="item.created"
                                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium" />
                                        <textarea v-if="item.description || !item.created" v-model="item.description" rows="2" :disabled="item.created"
                                            :placeholder="$t('meetings.tasks.description')"
                                            class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div>
                                                <label class="text-xs text-gray-500" :for="`assignee-${index}`">
                                                    {{ $t('meetings.tasks.assignee') }}<span v-if="item.owner"> ({{ $t('meetings.tasks.codySays', { owner: item.owner }) }})</span>
                                                </label>
                                                <select :id="`assignee-${index}`" v-model="item.assignee_uuid" :disabled="item.created"
                                                    class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                                                    <option value="">{{ $t('meetings.tasks.nobody') }}</option>
                                                    <option v-for="person in state.staff" :key="person.uuid" :value="person.uuid">{{ person.name }}</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label class="text-xs text-gray-500" :for="`due-${index}`">{{ $t('meetings.tasks.due') }}</label>
                                                <input :id="`due-${index}`" type="date" v-model="item.due_date" :disabled="item.created"
                                                    class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                                            </div>
                                        </div>
                                        <p v-if="item.created" class="text-xs text-[#1b6d8a] flex items-center gap-1">
                                            <Icon name="ph:check-circle" class="h-4 w-4" /> {{ $t('meetings.tasks.created') }}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        </ul>

                        <div v-if="state.boards.length" class="space-y-1.5">
                            <FormLabel for="task-board" :label="$t('meetings.tasks.board')" />
                            <select id="task-board" v-model="state.boardUuid" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
                                <option v-for="board in state.boards" :key="board.uuid" :value="board.uuid">{{ board.name }}</option>
                            </select>
                            <p class="text-xs text-gray-500">{{ $t('meetings.tasks.boardHint') }}</p>
                        </div>
                        <p v-else class="text-xs text-gray-500">{{ $t('meetings.tasks.noBoards') }}</p>
                    </template>

                    <div class="flex flex-wrap justify-end gap-2 pt-2 border-t border-gray-100">
                        <FormButton v-if="state.items.length" type="button" buttonStyle="cancel" @click="copy">
                            {{ state.copied ? $t('meetings.tasks.copied') : $t('meetings.tasks.copy') }}
                        </FormButton>
                        <FormButton v-if="state.boards.length && state.items.length" type="button" buttonStyle="primary"
                            :disabled="state.creating || !toCreate.length" @click="create">
                            {{ $t('meetings.tasks.create', toCreate.length) }}
                        </FormButton>
                    </div>
                </div>
            </LoadingSpinner>
        </template>
    </Modal>
</template>

<script setup lang="ts">
import { meetingService } from '@/components/api/user/MeetingService'
import { taskService } from '@/components/api/user/TaskService'
import { useCodyAdoption } from '@/composables/useCodyAdoption'

/**
 * Cody's suggested tasks from the agreements in a meeting. The person picks,
 * edits and assigns them, and they are created on a task board through the
 * board's own API, so its rules apply. Without task boards (or the tasks
 * app) the agreements can still be copied.
 */
const props = defineProps<{
    show: boolean
    meetingUuid: string
    source: { recording_uuid?: string, summary?: string }
}>()
const emit = defineEmits(['close', 'created'])

type Item = { title: string, description: string, owner: string, due_date: string, assignee_uuid: string, selected: boolean, created: boolean }

const state = reactive({
    loading: false,
    creating: false,
    copied: false,
    items: [] as Item[],
    staff: [] as { uuid: string, name: string }[],
    boards: [] as { uuid: string, name: string }[],
    boardUuid: '',
    error: {} as any,
})

const toCreate = computed(() => state.items.filter((item) => item.selected && !item.created && item.title.trim()))
const codyAdoption = useCodyAdoption()

watch(() => props.show, (open) => { if (open) load() })

async function load() {
    state.loading = true
    state.error = {}
    state.items = []
    state.copied = false
    try {
        const [suggested, boards] = await Promise.all([
            meetingService.actionItems(props.meetingUuid, props.source),
            // A company without the tasks app is refused here; the agreements can still be copied.
            taskService.getBoards().catch(() => null),
        ])
        state.staff = suggested?.data?.staff ?? []
        const firstStaff = state.staff[0]?.uuid ?? ''
        state.items = (suggested?.data?.items ?? []).map((item: any) => ({
            title: item.title ?? '',
            description: item.description ?? '',
            owner: item.owner ?? '',
            due_date: item.due_date ?? '',
            assignee_uuid: firstStaff,
            selected: true,
            created: false,
        }))
        state.boards = boards?.data ?? []
        if (!state.boards.some((board) => board.uuid === state.boardUuid)) state.boardUuid = state.boards[0]?.uuid ?? ''
    } catch (error: any) {
        if (['meeting_summary_cody_required', 'meeting_summary_cody_seat_required'].includes(error?.code)) {
            emit('close')
            codyAdoption.promptOpen.value = true
        } else {
            state.error = error
        }
    }
    state.loading = false
}

async function create() {
    if (!state.boardUuid) return
    state.creating = true
    state.error = {}
    for (const item of toCreate.value) {
        try {
            await taskService.saveTask(state.boardUuid, {
                title: item.title.trim(),
                description: item.description.trim() || null,
                assignee_uuid: item.assignee_uuid || null,
                due_date: item.due_date || null,
            })
            item.created = true
        } catch (error: any) {
            state.error = error
            break
        }
    }
    state.creating = false
    if (state.items.some((item) => item.created)) emit('created')
}

async function copy() {
    const lines = state.items
        .filter((item) => item.selected)
        .map((item) => `- ${item.title}${item.due_date ? ` (${item.due_date})` : ''}${item.description ? `\n  ${item.description}` : ''}`)
    await navigator.clipboard.writeText(lines.join('\n'))
    state.copied = true
}
</script>
