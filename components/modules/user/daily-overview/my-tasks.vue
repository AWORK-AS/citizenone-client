<template>
    <!-- Hidden entirely when nothing is assigned: an empty card every morning is
         noise for everyone who does not work from a board. -->
    <div v-if="state.tasks.length" class="rounded-lg border border-gray-200 bg-white p-4">
        <div class="mb-3 flex items-center justify-between">
            <p class="text-sm font-semibold text-gray-900">{{ $t('taskBoards.mine.title') }}</p>
            <NuxtLink to="/tasks" class="text-[12px] font-semibold text-secondary hover:underline">
                {{ $t('taskBoards.mine.all') }}
            </NuxtLink>
        </div>

        <div v-for="task in state.tasks" :key="task.uuid"
            class="border-t border-surface-100 py-2.5 first:border-t-0 first:pt-0">
            <div class="flex flex-wrap items-center gap-2">
                <p class="text-[13px] font-semibold text-slate-800">{{ task.title }}</p>
                <span v-if="task.type" class="rounded-full px-2 py-px text-[11px] font-semibold text-white"
                    :style="{ background: task.type.color }">
                    {{ task.type.name }}
                </span>
                <!-- Late is the whole reason to look at this card first. -->
                <span v-if="task.is_overdue"
                    class="rounded-full bg-[#fdeaea] px-2 py-px text-[11px] font-bold text-[#a4262c]">
                    {{ $t('taskBoards.overdue') }}
                </span>
                <span v-else-if="task.due_date" class="text-[11px] text-slate-400">
                    {{ formatDateToReadable(task.due_date) }}
                </span>
            </div>
            <p class="mt-0.5 text-[11px] text-slate-400">
                {{ task.board?.name }}<template v-if="task.column"> · {{ task.column.name }}</template>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { taskService } from '@/components/api/user/TaskService'
import { useUserStore } from '@/store/user'

const { formatDateToReadable } = useDatetimeFormatter()
const userStore = useUserStore() as any
const state = reactive({
    tasks: [] as any[],
})

onMounted(() => {
    fetchTasks()
})

async function fetchTasks() {
    // A company without the tasks app is refused here every time, which is not
    // worth a request - let alone the 400 it leaves in the console - on the
    // daily overview of every single company that has not bought it.
    if (!userStore.getUser?.company?.tasks_workflow_enabled) return

    try {
        const response = await taskService.getMyTasks()
        state.tasks = response?.data ?? []
    } catch (_) {
        state.tasks = []
    }
}
</script>
