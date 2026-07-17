<template>
    <div>
        <Modal size="xl" :title="$t('assistants.askAI')" titleIcon="ph:lightbulb" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="flex items-center justify-end gap-1 -mt-2 mb-1">
                    <Tooltip :text="$t('assistants.history.newChat')">
                        <button type="button" @click="startNewChat"
                            class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <Icon name="ph:plus" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </button>
                    </Tooltip>
                    <Tooltip :text="state.view === 'chat' ? $t('assistants.history.viewHistory') : $t('assistants.history.backToChat')">
                        <button type="button" @click="toggleView"
                            class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
                            <Icon :name="state.view === 'chat' ? 'ph:clock-counter-clockwise' : 'ph:arrow-left'"
                                class="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </button>
                    </Tooltip>
                </div>

                <!-- History list -->
                <div v-if="state.view === 'history'" class="h-[68vh] overflow-y-auto -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 px-4 sm:px-6 py-2">
                    <div class="relative mb-2">
                        <Icon name="ph:magnifying-glass"
                            class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
                            aria-hidden="true" />
                        <input v-model="state.searchQuery" type="text"
                            :placeholder="$t('assistants.history.searchPlaceholder')"
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
                        <input v-if="conversation.uuid === state.editingUuid" ref="editInputRef"
                            v-model="state.editingTitle" @click.stop
                            @keydown.enter="saveTitle(conversation)" @keydown.esc="cancelEditing"
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

                <div v-else class="flex flex-col h-[68vh] bg-transparent -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
                    <!-- Chat container -->
                    <div class="flex-1 overflow-y-auto scroll-smooth">
                        <div class="px-4 sm:px-6 py-6 space-y-6">
                            <div v-for="(message, index) in state.messages" :key="index">
                                <!-- User message -->
                                <div v-if="message.type === 'user'" class="w-full bg-primary rounded-md px-4 py-3">
                                    <div v-if="message.files && message.files.length > 0"
                                        class="flex flex-wrap gap-1.5 justify-end mb-2">
                                        <div v-for="(file, fIdx) in message.files" :key="fIdx"
                                            class="flex items-center gap-1.5 text-xs bg-white/20 text-white px-2.5 py-1.5 rounded-md">
                                            <Icon name="ph:file" class="h-3.5 w-3.5 shrink-0" />
                                            <span class="max-w-[150px] truncate">{{ file.name }}</span>
                                        </div>
                                    </div>
                                    <div class="text-sm text-white leading-relaxed text-right whitespace-pre-wrap">{{
                                        message?.text }}</div>
                                </div>
                                <!-- AI message -->
                                <div v-else
                                    class="w-full bg-gray-50 border border-gray-100 rounded-md px-0 py-2 flex items-start gap-3">
                                    <div
                                        class="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-0.5 ml-2 shadow-sm px-2">
                                        <Icon name="ph:lightbulb" class="h-4 w-4 text-white" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs font-medium text-gray-400 mb-1">{{ $t('assistants.askAI') }}
                                        </div>
                                        <div class="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap"
                                            v-safe-html="formatMessage(message?.text)" />
                                    </div>
                                </div>
                            </div>
                            <div v-if="state.isGeneratingResponse"
                                class="w-full bg-gray-50 border border-gray-100 rounded-xl px-1 py-3 flex items-start gap-3">
                                <div
                                    class="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm ml-2">
                                    <Icon name="ph:lightbulb" class="h-4 w-4 text-white" />
                                </div>
                                <div class="flex items-center gap-0.5 py-2">
                                    <span class="dot1">.</span>
                                    <span class="dot2">.</span>
                                    <span class="dot3">.</span>
                                    <span class="dot4">.</span>
                                    <span class="dot5">.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Input area -->
                    <div class="border-t border-gray-100 bg-white px-4 sm:px-6 py-5">
                        <div>
                            <!-- Audit P2.1/P2.2/P2.4: transparency notices - search scope and the
                            "always review AI output" reminder. Kept as plain small text rather
                            than a colored Alert banner so they don't visually compete with the
                            chat itself on every open. -->
                            <div class="flex flex-col gap-1 mb-2 text-xs text-gray-400">
                                <div class="flex items-start gap-1.5">
                                    <Icon name="ph:info" class="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>{{ $t('assistants.searchScopeHint') }}</span>
                                </div>
                                <div class="flex items-start gap-1.5">
                                    <Icon name="ph:warning-circle" class="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>{{ $t('assistants.reviewNotice') }}</span>
                                </div>
                            </div>
                            <div v-if="state.files.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                                <div v-for="(file, index) in state.files" :key="index"
                                    class="flex items-center gap-1.5 bg-gray-100 text-xs text-gray-600 pl-2.5 pr-1.5 py-1.5 rounded-md">
                                    <Icon name="ph:file" class="h-3.5 w-3.5 text-gray-400" />
                                    <span class="max-w-[150px] truncate">{{ file.name }}</span>
                                    <button type="button" @click="removeFile(index)"
                                        class="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors">
                                        <Icon name="ph:x" class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            <div v-if="state.mentionedEntities.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                                <div v-for="entity in state.mentionedEntities" :key="entity.uuid"
                                    class="flex items-center gap-1.5 bg-primary/10 text-xs text-primary pl-2.5 pr-1.5 py-1.5 rounded-md">
                                    <Icon :name="entity.type === 'employee' ? 'ph:identification-badge' : 'ph:at'"
                                        class="h-3.5 w-3.5" />
                                    <span class="max-w-[150px] truncate">{{ entity.label }}</span>
                                    <button type="button" @click="removeMentionedEntity(entity.uuid)"
                                        class="text-primary/50 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors">
                                        <Icon name="ph:x" class="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                            <div
                                class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md
                                focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all px-3 py-1.5">
                                <input ref="fileInput" type="file" multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png" class="hidden"
                                    @change="onFilesSelected" />
                                <button type="button" @click="($refs.fileInput as HTMLInputElement).click()"
                                    class="shrink-0 px-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                    <Icon name="ph:paperclip" class="h-5 w-5" />
                                </button>
                                <button type="button" @click="insertMentionTrigger" :title="$t('assistants.mentionSomeone')"
                                    class="shrink-0 px-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                    <Icon name="ph:at" class="h-5 w-5" />
                                </button>
                                <button type="button" @click="togglePreview" :title="$t('assistants.previewBeforeSending')"
                                    :disabled="!state.newMessage.trim()"
                                    class="shrink-0 px-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                                    <Icon name="ph:eye" class="h-5 w-5" />
                                </button>
                                <div class="relative flex-1">
                                    <textarea ref="promptTextarea" v-model="state.newMessage"
                                        :placeholder="$t('assistants.askAnything')" rows="1"
                                        class="w-full bg-transparent border-none shadow-none ring-0 focus:ring-0 focus:outline-none resize-none py-2 px-0 text-sm text-gray-900 placeholder-gray-400"
                                        @keydown.enter.exact.prevent="handleEnterKey"
                                        @keydown.esc="state.mention.isOpen = false" />
                                    <div v-if="state.mention.isOpen && state.mention.results.length > 0"
                                        @mousedown.prevent
                                        class="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                        <button v-for="entity in state.mention.results" :key="entity.uuid"
                                            type="button" @click="selectMention(entity)"
                                            class="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                                            <Icon :name="entity.type === 'employee' ? 'ph:identification-badge' : 'ph:user'"
                                                class="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span class="truncate">{{ entity.label }}</span>
                                        </button>
                                    </div>
                                    <!-- Audit P2.3: on-demand preview of exactly what will be redacted
                                    out of the typed prompt before it's sent, plus the currently
                                    tagged records. Not a mandatory gate on every send - that would
                                    be disruptive chat UX - just available if the user wants to check. -->
                                    <div v-if="state.preview.isOpen" @mousedown.prevent
                                        class="absolute bottom-full left-0 mb-1 w-80 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3">
                                        <div class="flex items-center justify-between mb-2">
                                            <span class="text-xs font-medium text-gray-500">{{ $t('assistants.preview.title') }}</span>
                                            <button type="button" @click="state.preview.isOpen = false" class="text-gray-300 hover:text-gray-500">
                                                <Icon name="ph:x" class="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                        <div v-if="state.preview.isLoading" class="text-xs text-gray-400 py-2">
                                            {{ $t('assistants.preview.loading') }}
                                        </div>
                                        <template v-else>
                                            <p class="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-2 mb-2">{{ state.preview.redactedPrompt }}</p>
                                            <p v-if="state.mentionedEntities.length > 0" class="text-xs text-gray-500">
                                                {{ $t('assistants.preview.taggedRecords') }}:
                                                {{ state.mentionedEntities.map(e => e.label).join(', ') }}
                                            </p>
                                        </template>
                                    </div>
                                </div>
                                <button type="button" @click="sendMessage"
                                    :disabled="!state.newMessage.trim() && state.files.length === 0"
                                    class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all disabled:cursor-not-allowed"
                                    :class="state.newMessage.trim() || state.files.length > 0
                                        ? 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                                        : 'bg-gray-200 text-gray-400'">
                                    <Icon name="ph:paper-plane-tilt" class="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Modal>

        <DialogConfirmation :isModalOpen="state.isConfirmDeleteOpen"
            :message="$t('assistants.history.deleteConfirmation')" @close="state.isConfirmDeleteOpen = false"
            @confirm="deleteConversation" />
    </div>
</template>

<script setup lang="ts">
import { aIAssistantService } from '@/components/api/user/AIAssistantService'
import { aiConversationService } from '@/components/api/user/AiConversationService'
import { citizenService } from '@/components/api/user/CitizenService'
import { userService } from '@/components/api/user/UserService'
import { useCompactRelativeTime } from '@/composables/compactRelativeTime'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})

const emit = defineEmits(['close'])
const { t } = useI18n()
const { errorAlert } = useAlert()
const { formatCompactRelativeTime } = useCompactRelativeTime()

const MAX_FILE_SIZE = 20 * 1024 * 1024

const editInputRef = ref<HTMLInputElement | null>(null)
const promptTextarea = ref<HTMLTextAreaElement | null>(null)

function closeModal() {
    emit('close')
}

const state = reactive({
    error: {} as Error,
    isGeneratingResponse: false,
    messages: [] as any,
    newMessage: '',
    files: [] as File[],
    view: 'chat' as 'chat' | 'history',
    conversations: [] as any[],
    activeConversationUuid: null as string | null,
    isConfirmDeleteOpen: false,
    pendingDeleteUuid: null as string | null,
    searchQuery: '',
    editingUuid: null as string | null,
    editingTitle: '',
    aiElements: {
        conversationId: null as string | null,
        vectorStoreId: null as string | null,
        fileIds: [] as string[],
    },
    // @mention citizen/employee picker - lets the user explicitly tag someone instead of the
    // AI having to guess who "Louise" or "John" is from free text (the vector store no longer
    // contains real names, only "Citizen Ref: #id" / "Employee Ref: #id", so explicit tagging
    // is the reliable path).
    mentionedEntities: [] as Array<{ uuid: string, label: string, type: 'citizen' | 'employee' }>,
    mention: {
        isOpen: false,
        query: '',
        allEntities: [] as Array<{ uuid: string, label: string, type: 'citizen' | 'employee' }>,
        results: [] as Array<{ uuid: string, label: string, type: 'citizen' | 'employee' }>,
    },
    // Audit P2.3: on-demand "what will be sent" preview.
    preview: {
        isOpen: false,
        isLoading: false,
        redactedPrompt: '',
    },
})

const filteredConversations = computed(() => {
    const query = state.searchQuery.trim().toLowerCase()
    if (!query) return state.conversations
    return state.conversations.filter((c: any) => (c.title || '').toLowerCase().includes(query))
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.view = 'chat'
        state.messages = []
        state.files = []
        state.mentionedEntities = []
        state.searchQuery = ''
        state.activeConversationUuid = null
        state.preview.isOpen = false
        state.messages.push({ type: 'bot', text: `${t('assistants.helloHowCanIAssistYouToday')}?` })
        clearAiElements()
        fetchConversations()
        fetchMentionableEntities()
    }
})

async function fetchMentionableEntities() {
    const [citizensRes, employeesRes] = await Promise.allSettled([
        citizenService.getAllCitizens({}),
        userService.getAllUsers({}),
    ])

    const citizens = citizensRes.status === 'fulfilled'
        ? (citizensRes.value?.data ?? [])
            .filter((c: any) => c.uuid !== 'all-citizens')
            .map((c: any) => ({ uuid: c.uuid, label: `${c.firstname ?? ''} ${c.lastname ?? ''}`.trim(), type: 'citizen' as const }))
        : []

    const employees = employeesRes.status === 'fulfilled'
        ? (employeesRes.value?.data ?? [])
            .filter((e: any) => e.uuid && e.uuid !== 'all-employees')
            .map((e: any) => ({ uuid: e.uuid, label: `${e.firstname ?? ''} ${e.lastname ?? ''}`.trim(), type: 'employee' as const }))
        : []

    state.mention.allEntities = [...citizens, ...employees]
}

function toggleView() {
    state.view = state.view === 'chat' ? 'history' : 'chat'
}

async function fetchConversations() {
    try {
        const res = await aiConversationService.getConversations({ source: 'ask_ai' })
        state.conversations = res?.data ?? []
        const active = state.conversations.find((c: any) => c.openai_conversation_id === state.aiElements.conversationId)
        state.activeConversationUuid = active?.uuid ?? state.activeConversationUuid
    } catch {
        // History is a nice-to-have - failing to load it shouldn't block chatting.
    }
}

function startEditing(conversation: any) {
    state.editingUuid = conversation.uuid
    state.editingTitle = conversation.title || ''
    nextTick(() => editInputRef.value?.focus())
}

function cancelEditing() {
    state.editingUuid = null
    state.editingTitle = ''
}

async function saveTitle(conversation: any) {
    if (state.editingUuid !== conversation.uuid) return

    const title = state.editingTitle.trim()
    cancelEditing()
    if (!title || title === conversation.title) return

    try {
        await aiConversationService.updateConversationTitle(conversation.uuid, { title })
        conversation.title = title
    } catch (e: any) {
        state.error = e
    }
}

/**
 * Restores the conversation id too (not just the messages), so continuing
 * to type after opening a past conversation appends to that same OpenAI
 * thread - matching Own ChatGPT. The thread is no longer deleted on close
 * (see clearAiElements()), so it's still there to resume.
 */
async function selectConversation(conversation: any) {
    state.error = {}
    try {
        const res = await aiConversationService.getConversationMessages(conversation.uuid)
        const messages = res?.data?.messages ?? []
        state.messages = messages.map((m: any) => ({ type: m.role === 'user' ? 'user' : 'bot', text: m.content }))
        state.aiElements.conversationId = conversation.openai_conversation_id
        state.activeConversationUuid = conversation.uuid
        state.view = 'chat'
    } catch (e: any) {
        state.error = e
    }
}

function startNewChat() {
    clearAiElements()
    state.messages = [{ type: 'bot', text: `${t('assistants.helloHowCanIAssistYouToday')}?` }]
    state.activeConversationUuid = null
    state.view = 'chat'
}

function confirmDeleteConversation(conversation: any) {
    state.pendingDeleteUuid = conversation.uuid
    state.isConfirmDeleteOpen = true
}

async function deleteConversation() {
    const uuid = state.pendingDeleteUuid
    state.isConfirmDeleteOpen = false
    if (!uuid) return

    try {
        await aiConversationService.deleteConversation(uuid)
        state.conversations = state.conversations.filter((c: any) => c.uuid !== uuid)
        if (state.activeConversationUuid === uuid) state.activeConversationUuid = null
    } catch (e: any) {
        state.error = e
    }
    state.pendingDeleteUuid = null
}

async function sendMessage() {
    if (!state.newMessage.trim() && state.files.length === 0) return
    state.error = {}
    state.isGeneratingResponse = true
    try {
        const attachedFiles = state.files.map(f => ({ name: f.name, size: f.size }))
        state.messages.push({
            type: 'user',
            text: state.newMessage,
            files: attachedFiles,
        })

        const formData = processPayload()

        const response = await aIAssistantService.sendMessage(formData)
        if (response?.data) {
            state.messages.push({
                type: 'bot',
                text: response?.data?.answer,
            })

            if (response.conversation_id) {
                state.aiElements.conversationId = response.conversation_id
            }
            if (response.tools?.[0]?.vector_store_ids) {
                state.aiElements.vectorStoreId = response.tools[0].vector_store_ids[0]
            }
            if (response.file_ids) {
                state.aiElements.fileIds.push(...response.file_ids)
            }

            fetchConversations()
        }
    } catch (error: any) {
        state.error = error
    }
    state.isGeneratingResponse = false
}

function formatMessage(messageText: string) {
    // Example format: If the message contains a structured citizen list, format it
    // const formattedMessage = messageText.replace(/---/g, '<hr/>') // Replace "---" with horizontal line
    //     .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold the text wrapped in **
    //     .replace(/\*\[(.*?)\]\(.*?\)/g, '<a href="#">$1</a>') // Make links clickable
    //     .replace(/\n/g, '<br/>') // Replace newlines with <br/>

    return messageText
}

function getTotalFilesSize(files: File[]) {
    return files.reduce((total, file) => total + file.size, 0)
}

function onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (input.files) {
        const newFiles = Array.from(input.files)
        const currentSize = getTotalFilesSize(state.files)
        const incomingSize = getTotalFilesSize(newFiles)

        if (currentSize + incomingSize > MAX_FILE_SIZE) {
            errorAlert(t('alert.error'), t('assistants.fileSizeExceeds'))
            input.value = ''
            return
        }

        state.files.push(...newFiles)
    }
    input.value = ''
}

function removeFile(index: number) {
    state.files.splice(index, 1)
}

// Watches the message rather than binding an @input handler alongside v-model on
// the same textarea (the two compete for the native "input" event unreliably).
// Checks the end of the message rather than the textarea's live cursor position -
// mentions are always typed at the current end of input in this chat box.
watch(() => state.newMessage, (newVal) => {
    const match = newVal.match(/@([^\s@]*)$/)

    if (match) {
        state.mention.isOpen = true
        state.mention.query = match[1]
        filterMentionResults()
    } else {
        state.mention.isOpen = false
    }

    // The message changed since the preview was fetched - close it rather
    // than show a stale redacted version of a different prompt.
    state.preview.isOpen = false
})

function filterMentionResults() {
    const query = state.mention.query.trim().toLowerCase()
    const alreadyMentioned = new Set(state.mentionedEntities.map((e) => e.uuid))

    state.mention.results = state.mention.allEntities
        .filter((e) => !alreadyMentioned.has(e.uuid))
        .filter((e) => !query || e.label.toLowerCase().includes(query))
        .slice(0, 8)
}

function selectMention(entity: { uuid: string, label: string, type: 'citizen' | 'employee' }) {
    state.newMessage = state.newMessage.replace(/@([^\s@]*)$/, `@${entity.label} `)
    state.mentionedEntities.push(entity)
    state.mention.isOpen = false
    nextTick(() => promptTextarea.value?.focus())
}

function removeMentionedEntity(uuid: string) {
    state.mentionedEntities = state.mentionedEntities.filter((e) => e.uuid !== uuid)
}

// Surfaces the @-mention feature for users who wouldn't otherwise know it exists -
// appends "@" (the same trigger the watch() above listens for) and focuses the
// textarea, so clicking this button behaves exactly like typing "@" would.
function insertMentionTrigger() {
    const needsSpace = state.newMessage.length > 0 && !/\s$/.test(state.newMessage)
    state.newMessage += `${needsSpace ? ' ' : ''}@`
    nextTick(() => promptTextarea.value?.focus())
}

// Audit P2.3: fetches the redacted version of the currently typed prompt
// on demand, rather than gating every send behind a confirmation step.
async function togglePreview() {
    if (state.preview.isOpen) {
        state.preview.isOpen = false
        return
    }

    if (!state.newMessage.trim()) return

    state.preview.isOpen = true
    state.preview.isLoading = true
    try {
        const res = await aIAssistantService.previewPrompt({ prompt: state.newMessage })
        state.preview.redactedPrompt = res?.redacted_prompt ?? state.newMessage
    } catch {
        state.preview.redactedPrompt = state.newMessage
    }
    state.preview.isLoading = false
}

function handleEnterKey() {
    if (state.mention.isOpen && state.mention.results.length > 0) {
        selectMention(state.mention.results[0])
        return
    }
    sendMessage()
}

// Resets the local pointer to the active OpenAI thread. Used to start a
// fresh conversation (new chat / modal reopened) - does NOT delete the
// thread server-side, so a conversation can always be resumed later from
// history via selectConversation().
function clearAiElements() {
    state.aiElements.conversationId = null
    state.aiElements.vectorStoreId = null
    state.aiElements.fileIds = []
}

function processPayload() {
    const formData = new FormData()

    formData.append('prompt', state.newMessage)
    if (state.aiElements.conversationId) {
        formData.append('conversation_id', state.aiElements.conversationId)
    }
    if (state.aiElements.vectorStoreId) {
        formData.append('vector_store_id', state.aiElements.vectorStoreId)
    }
    if (state.files.length > 0) {
        state.files.forEach((file) => {
            formData.append('files[]', file)
        })
    }
    state.mentionedEntities.forEach((entity) => {
        if (entity.type === 'citizen') {
            formData.append('citizen_uuids[]', entity.uuid)
        } else {
            formData.append('employee_uuids[]', entity.uuid)
        }
    })

    state.newMessage = ''
    state.files = []
    state.mentionedEntities = []

    return formData
}
</script>

<style>
@keyframes blink {
    0% {
        opacity: 0;
    }

    33% {
        opacity: 1;
    }

    66% {
        opacity: 0;
    }

    100% {
        opacity: 0;
    }
}

.dot1 {
    animation: blink 1.4s infinite both;
}

.dot2 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.2s;
}

.dot3 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.4s;
}

.dot4 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.6s;
}

.dot5 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.8s;
}
</style>