<template>
    <div>
        <!-- A panel rather than a dialog: the page behind stays live, so the
        journal you are asking about is still readable while you ask. -->
        <transition enter-active-class="transform transition ease-in-out duration-300"
            enter-from-class="translate-x-full" enter-to-class="translate-x-0"
            leave-active-class="transform transition ease-in-out duration-200" leave-from-class="translate-x-0"
            leave-to-class="translate-x-full">
            <aside v-if="assistantStore.isOpen" :aria-label="$t('assistants.askAI')"
                class="fixed inset-y-0 right-0 z-[56] flex w-full max-w-[26rem] flex-col border-l border-surface-200 bg-white shadow-2xl">
                <header class="flex h-16 shrink-0 items-center gap-1 border-b border-surface-200 px-4">
                    <!-- The header carries the identity and the state: who this is,
                    what it can see, and whether it is working. "Spørg AI" was an
                    action, not a name, and it answered neither question. -->
                    <ModulesUserNavbarCodyMark :size="28" :state="markState" class="shrink-0" />
                    <p class="min-w-0 flex-1 text-sm font-semibold leading-tight text-gray-900">
                        {{ $t('assistants.identity.name') }}
                        <span class="block truncate text-[11.5px] font-normal text-gray-400">
                            {{ $t('assistants.identity.scope') }}
                        </span>
                    </p>
                    <Tooltip :text="$t('assistants.history.newChat')">
                        <button :aria-label="$t('assistants.history.newChat')" type="button" @click="startNewChat"
                            class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <Icon name="ph:plus" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </button>
                    </Tooltip>
                    <Tooltip
                        :text="state.view === 'chat' ? $t('assistants.history.viewHistory') : $t('assistants.history.backToChat')">
                        <button
                            :aria-label="state.view === 'chat' ? $t('assistants.history.viewHistory') : $t('assistants.history.backToChat')"
                            type="button" @click="toggleView"
                            class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <Icon :name="state.view === 'chat' ? 'ph:clock-counter-clockwise' : 'ph:arrow-left'"
                                class="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </button>
                    </Tooltip>
                    <button :aria-label="$t('close')" type="button" @click="closePanel"
                        class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                        <Icon name="ph:x" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                    </button>
                </header>

                <Alert type="danger" :text="state?.error?.message" class="mx-4 mt-3"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- The daily ceiling is the one limit a person can act on: capacity
                     follows seats, so more seats mean more of it. Someone without the
                     licence permission is told who to ask rather than shown a button
                     that would refuse them on arrival. -->
                <div v-if="state.error?.isDaily" class="mx-4 -mt-1 mb-1 flex items-center">
                    <button v-if="state.error?.canBuy" type="button" @click="goToApps"
                        class="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
                        {{ $t('assistants.limitBuyMore') }}
                    </button>
                    <span v-else class="text-sm text-gray-600">
                        {{ $t('assistants.limitAskAdmin') }}
                    </span>
                </div>

                <ModulesUserAssistantHistory v-if="state.view === 'history'" />

                <div v-else class="flex flex-1 min-h-0 flex-col bg-transparent">
                    <ModulesUserAssistantThread />
                    <ModulesUserAssistantComposer />
                </div>
            </aside>
        </transition>

        <DialogConfirmation :isModalOpen="state.isConfirmDeleteOpen"
            :message="$t('assistants.history.deleteConfirmation')" @close="state.isConfirmDeleteOpen = false"
            @confirm="deleteConversation" />
    </div>
</template>

<script setup lang="ts">
import { useAssistantStore } from '@/store/assistant'
import { createCodyChat, CODY_CHAT } from '@/composables/useCodyChat'

/**
 * Cody's panel: the frame, and the wiring between the product and the chat.
 *
 * This file used to be all of it - conversation, history, @mentions, uploads,
 * the redaction preview, the stream reader and the markdown styling, 1,235
 * lines of it. Cody is about to appear next to the thing you are reading rather
 * than only in this corner, and every one of those surfaces would have had to
 * reach in here to do it.
 *
 * What is left is what only the panel can own: the frame, the error banners,
 * and the three ways the rest of the product talks to it - opening it, handing
 * it a question from a page, and following the user as they navigate. The chat
 * is created here and provided to the tree, so the thread, the composer and the
 * history list act on the same state without prop-drilling through the frame.
 */
const assistantStore = useAssistantStore()
const route = useRoute()

const chat = createCodyChat()
provide(CODY_CHAT, chat)

const {
    state,
    initialisePanel,
    applyRouteContext,
    requestComposerFocus,
    toggleView,
    startNewChat,
    deleteConversation,
    sendMessage,
} = chat

function closePanel() {
    assistantStore.close()
}

const markState = computed(() => {
    if (state.isGeneratingResponse || state.isStreaming) return 'working'
    if (state.error?.message) return 'blocked'
    return 'idle'
})

// Esc closes the panel. It is deliberately not a dialog - the page behind stays
// live - so headlessui's keyboard handling does not come with it.
function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !assistantStore.isOpen) return
    // Let the mention picker and the redaction preview take Escape first.
    if (state.mention.isOpen || state.preview.isOpen) return
    assistantStore.close()
}

// The panel is 26rem wide and sits in the bottom-right corner - the same corner
// the support chat bubble lives in, which is how the bubble ended up on top of
// the prompt field while someone was typing (Birketoften 31/8). Move the bubble
// clear for as long as the panel is open.
const CHAT_BUBBLE_OFFSET_PX = 432

function syncChatBubbleOffset(isOpen: boolean) {
    useObiyenChat().setSideOffset(isOpen ? CHAT_BUBBLE_OFFSET_PX : 0)
}

// Capacity follows the seats a company holds, so the App Store is where more of
// it is bought. Closing the panel first means the user lands on the page rather
// than behind the overlay.
function goToApps() {
    closePanel()
    navigateTo('/apps')
}

onMounted(() => {
    document.addEventListener('keydown', onKeydown)
    // Reopening after a reload restores the panel, so its data has to load too.
    if (assistantStore.isOpen) initialisePanel()
    syncChatBubbleOffset(assistantStore.isOpen)
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    syncChatBubbleOffset(false)
})

watch(() => assistantStore.isOpen, (isOpen: boolean) => {
    syncChatBubbleOffset(isOpen)
    if (!isOpen) return
    initialisePanel()
    // The composer mounts with the panel, so the cursor lands in the field once
    // it is there to receive it.
    requestComposerFocus()
})

/**
 * A question handed over from elsewhere on the page.
 *
 * Asked rather than typed into the box: the caller already knows what it wants
 * to know, and leaving it sitting in the textarea for the user to press send on
 * would just be a slower way of typing it.
 *
 * Cleared before the request rather than after, so a failure does not leave the
 * question queued to fire again the next time the panel opens.
 */
watch(() => assistantStore.pendingQuestion, async (question: string | null) => {
    if (!question || state.isGeneratingResponse) return

    assistantStore.questionHandled()

    // The panel may not have loaded yet when the question arrives with the open.
    await nextTick()

    state.newMessage = question
    await applyRouteContext()
    await sendMessage()
}, { immediate: true })

// Follows the user around the app: ask about the citizen whose page is open
// without tagging them by hand first.
watch(() => route.fullPath, () => {
    if (assistantStore.isOpen) applyRouteContext()
})
</script>
