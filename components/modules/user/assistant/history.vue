<template>
    <div class="flex-1 min-h-0 overflow-y-auto px-4 py-3">
        <div class="relative mb-2">
            <Icon name="ph:magnifying-glass"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <input v-model="state.searchQuery" type="text" :placeholder="$t('assistants.history.searchPlaceholder')"
                class="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-2 py-1.5 outline-none focus:border-ai transition-colors" />
        </div>

        <p v-if="filteredConversations.length === 0" class="text-sm text-gray-400 text-center py-8">
            {{ $t('assistants.history.noConversations') }}
        </p>

        <div v-for="conversation in filteredConversations" :key="conversation.uuid"
            class="group flex items-center gap-2 rounded-lg px-3 py-1.5 cursor-pointer transition-colors focus-within:bg-gray-50"
            :class="conversation.uuid === state.activeConversationUuid ? 'bg-ai-bg' : 'hover:bg-gray-50'"
            @click="conversation.uuid !== state.editingUuid && selectConversation(conversation)">
            <Icon name="ph:chat-circle-text" class="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
            <input v-if="conversation.uuid === state.editingUuid" ref="editInputRef" v-model="state.editingTitle"
                @click.stop @keydown.enter="saveTitle(conversation)" @keydown.esc="cancelEditing"
                @blur="saveTitle(conversation)"
                class="flex-1 min-w-0 text-sm bg-white border border-ai-border rounded px-1.5 py-0.5 outline-none" />
            <!-- A button, so the list can be worked from the keyboard too. -->
            <button v-else type="button" class="flex-1 min-w-0 text-left text-sm truncate focus:outline-none"
                :class="conversation.uuid === state.activeConversationUuid ? 'text-ai-ink font-medium' : 'text-gray-700'"
                @click.stop="selectConversation(conversation)">
                {{ conversation.title || $t('assistants.history.untitled') }}
            </button>
            <!-- Rename and delete used to exist only under a hovering mouse, so on
            a tablet - where most care staff are - a conversation could be neither
            renamed nor deleted. They now show on hover, on keyboard focus, and
            always on a device that cannot hover. -->
            <span v-if="conversation.uuid !== state.editingUuid" class="shrink-0 flex items-center gap-1">
                <span class="text-xs text-gray-500 tabular-nums">
                    {{ formatCompactRelativeTime(conversation.updated_at) }}
                </span>
                <span class="flex items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                    <button type="button" :aria-label="$t('assistants.renameConversation')"
                        :title="$t('assistants.renameConversation')"
                        class="flex size-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-ai-ink"
                        @click.stop="startEditing(conversation)">
                        <Icon name="ph:pencil-simple" class="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button type="button" :aria-label="$t('assistants.deleteConversation')"
                        :title="$t('assistants.deleteConversation')"
                        class="flex size-7 items-center justify-center rounded text-gray-500 hover:bg-red-50 hover:text-red-600"
                        @click.stop="confirmDeleteConversation(conversation)">
                        <Icon name="ph:trash" class="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </span>
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useCompactRelativeTime } from '@/composables/compactRelativeTime'
import { useCodyChat } from '@/composables/useCodyChat'

/**
 * Past conversations: search, rename, reopen, delete.
 *
 * The rename field lives here rather than in the chat, because focusing it is a
 * DOM concern belonging to whoever renders it. The chat only records which
 * conversation is being renamed; this watches for that and puts the cursor in
 * the right box.
 */
const { formatCompactRelativeTime } = useCompactRelativeTime()

const {
    state,
    filteredConversations,
    selectConversation,
    startEditing,
    cancelEditing,
    saveTitle,
    confirmDeleteConversation,
} = useCodyChat()

// A ref on an element inside v-for collects into an array, which is why
// focusing it looked like it worked and did nothing. Only one rename field is
// ever rendered, so the first entry is the one.
const editInputRef = ref<HTMLInputElement | HTMLInputElement[] | null>(null)

watch(() => state.editingUuid, (uuid) => {
    if (!uuid) return

    nextTick(() => {
        const field = Array.isArray(editInputRef.value) ? editInputRef.value[0] : editInputRef.value
        field?.focus()
    })
})
</script>
