<template>
    <Tooltip :text="props.active ? $t('dutySchedules.sort.firstShiftActive') : $t('dutySchedules.sort.sortByFirstShift')"
        position="right" class="!absolute top-1 left-7">
        <button type="button" :aria-label="$t('dutySchedules.sort.sortByFirstShift')" :aria-pressed="props.active"
            :class="[
                'w-5 h-5 rounded-md flex items-center justify-center transition-colors',
                props.active ? 'bg-primary text-white' : 'text-slate-400 hover:text-primary hover:bg-white',
            ]"
            @click.stop="emit('toggle')">
            <Icon name="ph:sort-ascending" class="h-3 w-3" aria-hidden="true" />
        </button>
    </Tooltip>
</template>

<script setup lang="ts">
// The per-day sort icon in a duty schedule day header: orders employees by who
// starts first that day. Clicking the active icon turns the sort off again.
const props = defineProps({
    active: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits(['toggle'])
</script>
