<template>
    <!-- A goal's type and VUM theme where goals are listed; nothing when unset. -->
    <div v-if="props.goal?.goal_type || props.goal?.focus_area" class="flex flex-wrap items-center gap-1.5">
        <Tooltip v-if="props.goal?.goal_type" :text="$t('goalTypes.single')">
            <span class="inline-flex max-w-full items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xxs text-gray-700 ring-1 ring-gray-200">
                <Icon name="ph:tag" class="size-3 shrink-0" aria-hidden="true" />
                <span class="truncate">{{ props.goal.goal_type.name }}</span>
            </span>
        </Tooltip>
        <Tooltip v-if="props.goal?.focus_area" :text="$t('goalTypes.vumTheme')">
            <span class="inline-flex max-w-full items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xxs text-gray-700 ring-1 ring-gray-200">
                <span class="font-medium shrink-0">VUM</span>
                <span class="truncate">
                    <template v-if="props.goal.focus_area.category_name">{{ props.goal.focus_area.category_name }}: </template>{{ props.goal.focus_area.name }}
                </span>
            </span>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    goal: {
        type: Object,
        required: false,
        default: null,
    },
})
</script>
