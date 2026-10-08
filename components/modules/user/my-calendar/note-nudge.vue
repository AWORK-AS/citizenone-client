<template>
    <!-- A citizen booking that ended without its journal note: say so, and
         offer to write it from here. Same rule as the reminder notification. -->
    <template v-if="needed">
        <span v-if="props.compact" role="button" :aria-label="$t('events.noteNudge.help')"
            :title="$t('events.noteNudge.help')"
            class="inline-flex flex-none cursor-pointer items-center rounded-full bg-amber-100 p-0.5 text-amber-700 hover:bg-amber-200"
            @click.stop="emit('create', props.event)">
            <Icon name="ph:note-pencil" class="h-3 w-3" aria-hidden="true" />
        </span>
        <Tooltip v-else :text="$t('events.noteNudge.help')" position="top">
            <button type="button"
                class="inline-flex items-center gap-x-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                @click.stop="emit('create', props.event)">
                <Icon name="ph:note-pencil" class="h-3.5 w-3.5" aria-hidden="true" />
                {{ $t('events.noteNudge.label') }}
            </button>
        </Tooltip>
    </template>
</template>

<script setup lang="ts">
import { needsJournalNote } from '@/composables/calendarJournalNudge'

const props = defineProps({
    event: {
        type: Object,
        default: null,
    },
    // Icon only, for the dense month cells and the time grid.
    compact: {
        type: Boolean,
        default: false,
    },
})
const emit = defineEmits(['create'])

const needed = computed(() => needsJournalNote(props.event))
</script>
