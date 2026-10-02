<template>
    <div>
        <NuxtLink :to="props.to" class="flex items-center gap-x-2 rounded px-1 py-0.5 text-sm text-slate-700 hover:bg-surface-50 hover:text-primary">
            <Icon name="ph:flag" class="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <span class="min-w-0 flex-1 truncate">{{ props.goal.name }}</span>
            <span v-if="props.goal.completion_date" :class="['badge shrink-0', itemBadge(props.goal)]">
                {{ itemDate(props.goal) }}
            </span>
        </NuxtLink>
        <ul v-if="props.goal.subgoals?.length" class="ml-4 mt-0.5 space-y-0.5">
            <li v-for="subgoal in props.goal.subgoals" :key="subgoal.uuid">
                <NuxtLink :to="props.to" class="flex items-center gap-x-2 rounded px-1 py-0.5 text-xs text-slate-600 hover:bg-surface-50 hover:text-primary">
                    <Icon :name="subgoal.is_completed ? 'ph:check-circle' : 'ph:circle'"
                        :class="['h-3.5 w-3.5 shrink-0', subgoal.is_completed ? 'text-emerald-500' : 'text-slate-300']" aria-hidden="true" />
                    <span class="min-w-0 flex-1 truncate">{{ subgoal.name }}</span>
                    <span v-if="subgoal.completion_date" :class="['badge shrink-0', itemBadge(subgoal)]">
                        {{ itemDate(subgoal) }}
                    </span>
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { useDueDate } from '@/composables/useDailyOverviewDueDate'

const props = defineProps({
    goal: {
        type: Object,
        required: true,
    },
    to: {
        type: [String, Object],
        required: true,
    },
})

const { itemBadge, itemDate } = useDueDate()
</script>
