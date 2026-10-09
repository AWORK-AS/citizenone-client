<template>
    <!-- Marks a date on which shifts are offered that the employee can take,
         so they can see at a glance where coverage is needed. -->
    <Tooltip v-if="props.count > 0" :text="$t('dutySchedules.scheduleSlots.offeredShiftsOnDay', { count: props.count })"
        position="left" class="!absolute top-1 right-1">
        <span data-testid="offered-shifts-icon" role="img"
            :aria-label="$t('dutySchedules.scheduleSlots.offeredShiftsOnDay', { count: props.count })"
            class="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-sm">
            <Icon name="ph:hand-grabbing" class="w-3 h-3" aria-hidden="true" />
        </span>
    </Tooltip>
</template>

<script setup lang="ts">
const props = defineProps({
    count: {
        type: Number,
        default: 0,
    },
})
</script>
