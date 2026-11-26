<template>
    <!-- Roadmap #375: the chat's pinned messages, one at a time, under the header.
         Same look as a pinned journal card (border-l-primary + filled pin). -->
    <div v-if="pins.length > 0"
        class="flex items-center gap-2 border-b border-gray-100 border-l-4 border-l-primary bg-white px-3 md:px-4 py-2">
        <Icon name="ph:push-pin-fill" class="h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />

        <!-- Clicking the text shows the next pin when there are several. -->
        <button type="button" class="min-w-0 flex-1 text-left"
            :class="pins.length > 1 ? 'cursor-pointer' : 'cursor-default'"
            :title="pins.length > 1 ? $t('messages.nextPinnedMessage') : undefined"
            :aria-label="pins.length > 1 ? $t('messages.nextPinnedMessage') : $t('messages.pinnedMessage')"
            @click="showNext">
            <p class="flex items-center gap-1.5 text-xs font-medium text-primary">
                {{ $t('messages.pinnedMessage') }}
                <span v-if="pins.length > 1" class="font-normal text-gray-400">
                    {{ $t('messages.pinnedOfCount', { current: index + 1, total: pins.length }) }}
                </span>
            </p>
            <p class="flex items-center gap-1 text-sm text-gray-700 min-w-0">
                <span v-if="current?.sender?.name" class="flex-shrink-0 font-medium">{{ current.sender.name }}:</span>
                <Icon v-if="current?.has_attachments" name="ph:paperclip" class="h-3.5 w-3.5 flex-shrink-0 text-gray-400"
                    aria-hidden="true" />
                <span class="truncate">{{ previewText }}</span>
            </p>
        </button>

        <button type="button" @click="emit('go-to', current.uuid)"
            class="flex-shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/5 transition-colors">
            {{ $t('messages.goToMessage') }}
        </button>

        <Tooltip v-if="!readonly" :text="$t('messages.unpinMessage')" position="left">
            <button type="button" :aria-label="$t('messages.unpinMessage')" @click="emit('unpin', current)"
                class="w-7 h-7 flex-shrink-0 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Icon name="ph:x" class="h-4 w-4 text-gray-400" aria-hidden="true" />
            </button>
        </Tooltip>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { clampPinIndex, nextPinIndex, pinnedPreviewText } from '@/composables/pinnedMessages'

const props = defineProps({
    // data.pinned_messages from the open chat; anything that isn't a list shows nothing.
    pinnedMessages: { type: null, default: () => [] },
    // The portals only see pins; staff get the unpin button.
    readonly: { type: Boolean, default: false },
})

const emit = defineEmits<{
    (event: 'go-to', uuid: string): void
    (event: 'unpin', pin: any): void
}>()

const { t } = useI18n()

const pins = computed<any[]>(() => Array.isArray(props.pinnedMessages)
    ? props.pinnedMessages.filter((pin: any) => pin?.uuid)
    : [])

const index = ref(0)

// A new pin arrives first in the list, so show it; an unpin keeps the position valid.
watch(() => pins.value.map((pin: any) => pin.uuid).join(','), (now, before) => {
    const newest = pins.value[0]?.uuid
    index.value = newest && !String(before ?? '').split(',').includes(newest)
        ? 0
        : clampPinIndex(index.value, pins.value.length)
})

const current = computed(() => pins.value[clampPinIndex(index.value, pins.value.length)])

const previewText = computed(() => {
    const text = pinnedPreviewText(current.value)
    if (text) return text
    return current.value?.has_attachments ? t('messages.pinnedAttachment') : t('messages.pinnedNoText')
})

function showNext() {
    index.value = nextPinIndex(index.value, pins.value.length)
}
</script>
