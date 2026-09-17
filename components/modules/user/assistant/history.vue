<template>
    <div class="flex-1 min-h-0 overflow-y-auto px-4 py-3">
        <div class="relative mb-2">
            <Icon name="ph:magnifying-glass"
                class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            <input v-model="state.searchQuery" type="text" :placeholder="$t('assistants.history.searchPlaceholder')"
                class="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-2 py-1.5 outline-none focus:border-primary/40 transition-colors" />
        </div>

        <p v-if="filteredConversations.length === 0" class="text-sm text-gray-400 text-center py-8">
            {{ $t('assistants.history.noConversations') }}
        </p>

        <div v-for="conversation in filteredConversations" :key="conversation.uuid"
            class="group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
            :class="conversation.uuid === state.activeConversationUuid ? 'bg-primary/10' : 'hover:bg-gray-50'"
            @click="conversation.uuid !== state.editingUuid && selectConversation(conversation)">
            <Icon name="ph:chat-circle-text" class="h-4 w-4 text-gray-400 shrink-0" aria-hidden="true" />
            <input v-if="conversation.uuid === state.editingUuid" ref="editInputRef" v-model="state.editingTitle"
                @click.stop @keydown.enter="saveTitle(conversation)" @keydown.esc="cancelEditing"
                @blur="saveTitle(conversation)"
                class="flex-1 min-w-0 text-sm bg-white border border-primary/40 rounded px-1.5 py-0.5 outline-none" />
            <span v-else class="flex-1 min-w-0 text-sm truncate"
                :class="conversation.uuid === state.activeConversationUuid ? 'text-primary font-medium' : 'text-gray-700'">
                {{ conversation.title || $t('assistants.history.untitled') }}
            </span>
            <span v-if="conversation.uuid !== state.editingUuid" class="shrink-0 flex items-center gap-1.5">
                <span class="text-xs text-gray-400 group-hover:hidden">
                    {{ formatCompactRelativeTime(conversation.updated_at) }}
                </span>
                <span class="hidden group-hover:flex items-center gap-1.5">
                    <button type="button" class="text-gray-300 hover:text-primary"
                        @click.stop="startEditing(conversation)">
                        <Icon name="ph:pencil-simple" class="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button type="button" class="text-gray-300 hover:text-red-500"
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
