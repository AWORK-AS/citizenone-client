<template>
    <div>
        <ol class="relative border-l border-gray-200 ml-3 space-y-6" v-if="props.timeline.length">
            <li v-for="(item, index) in props.timeline" :key="index" class="ml-6">
                <span
                    :class="['absolute -left-3 flex size-6 items-center justify-center rounded-full ring-4 ring-white',
                        item.source === 'event' ? 'bg-primary/15 text-primary' : 'bg-gray-100 text-gray-500']">
                    <Icon :name="item.source === 'event' ? 'ph:flag' : 'ph:clock-counter-clockwise'"
                        class="size-3.5" />
                </span>
                <div class="rounded-md bg-white p-4 ring-1 ring-gray-200">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <p class="text-sm font-semibold text-gray-900">{{ item.title }}</p>
                                <Badge v-if="item.event_type" type="primary" class="w-fit">
                                    <p class="text-xxs">{{ item.event_type.name }}</p>
                                </Badge>
                            </div>
                            <ul v-if="item.source === 'activity' && item.changes && item.changes.length"
                                class="mt-1 space-y-0.5">
                                <li v-for="change in item.changes" :key="change.field" class="text-xs text-gray-500">
                                    <span class="font-medium">{{ change.label }}:</span>
                                    {{ change.old }} → {{ change.new }}
                                </li>
                            </ul>
                            <p v-if="item.description" class="mt-1 text-sm text-gray-600 break-words">
                                {{ item.description }}
                            </p>
                            <p class="mt-1 text-xs text-gray-400">
                                {{ formatDateToReadable(item.date) }}
                                <span v-if="item.user"> · {{ item.user }}</span>
                            </p>
                        </div>
                        <button v-if="item.can_delete" @click="emit('delete', item.uuid)"
                            class="shrink-0 text-gray-300 hover:text-red-600" :title="$t('delete')">
                            <Icon name="ph:trash" class="size-4" />
                        </button>
                    </div>
                </div>
            </li>
        </ol>

        <p v-else class="text-center py-10 text-gray-500">
            {{ $t('theresNoDataAvailableToDisplay') }}.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const { formatDateToReadable } = useDatetimeFormatter()

const props = defineProps({
    timeline: {
        type: Array as () => any[],
        required: true,
    },
})

const emit = defineEmits(['delete'])
</script>
