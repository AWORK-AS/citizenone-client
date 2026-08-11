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
                    <Icon name="ph:sparkle" class="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                    <p class="flex-1 truncate text-sm font-semibold text-gray-900">{{ $t('assistants.askAI') }}</p>
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

                <!-- History list -->
                <div v-if="state.view === 'history'" class="flex-1 min-h-0 overflow-y-auto px-4 py-3">
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

                <div v-else class="flex flex-1 min-h-0 flex-col bg-transparent">
                    <!-- Chat container. Messages are top-anchored, including the
                    initial greeting, so the conversation always reads downward
                    from the same starting point. -->
                    <div class="flex-1 overflow-y-auto scroll-smooth">
                        <div class="px-4 py-5 space-y-5">
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
                                        <Icon name="ph:sparkle" class="h-4 w-4 text-white" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs font-medium text-gray-400 mb-1">{{ $t('assistants.askAI') }}
                                        </div>
                                        <div class="ai-answer text-sm text-gray-800 leading-relaxed"
                                            v-safe-html="formatMessage(message?.text)" />
                                        <!-- An answer with no company data behind it is not the
                                        same as an answer that found nothing, and it used to look
                                        identical. -->
                                        <p v-if="message.companyDataStatus && message.companyDataStatus !== 'ready'"
                                            class="mt-2 flex items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800">
                                            <Icon name="ph:warning-circle" class="mt-0.5 size-3.5 shrink-0"
                                                aria-hidden="true" />
                                            <span>
                                                {{ message.companyDataStatus === 'missing'
                                                    ? $t('assistants.companyDataMissing')
                                                    : $t('assistants.companyDataBuilding') }}
                                            </span>
                                        </p>

                                        <!-- What the answer was actually built from. The backend
                                        already resolved these for the audit trail. -->
                                        <p v-if="message.sources?.length"
                                            class="mt-2 flex flex-wrap items-center gap-1 text-xs text-gray-400">
                                            <Icon name="ph:database" class="size-3.5 shrink-0" aria-hidden="true" />
                                            <span>{{ $t('assistants.basedOn') }}:</span>
                                            <span v-for="source in message.sources" :key="source.uuid"
                                                class="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                                                {{ source.name }}
                                            </span>
                                        </p>

                                        <!-- The answer used to be a dead end: read it, then retype it
                                        somewhere else. Copy takes the markdown as written. -->
                                        <div v-if="index > 0" class="flex items-center gap-1 mt-2 -ml-1.5">
                                            <button type="button" @click="copyAnswer(message, index)"
                                                :title="$t('assistants.actions.copy')"
                                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                                                <Icon :name="state.copiedIndex === index ? 'ph:check' : 'ph:copy'"
                                                    class="h-3.5 w-3.5" />
                                                {{ state.copiedIndex === index ? $t('assistants.actions.copied') :
                                                    $t('assistants.actions.copy') }}
                                            </button>
                                            <button type="button" v-if="assistantStore.insertTargetLabel"
                                                @click="assistantStore.requestInsert(formatMessage(message?.text))"
                                                :title="assistantStore.insertTargetLabel"
                                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
                                                <Icon name="ph:arrow-line-down" class="h-3.5 w-3.5" />
                                                {{ $t('assistants.actions.insert') }}
                                            </button>
                                            <button type="button"
                                                v-if="index === state.messages.length - 1 && state.lastRequest.prompt"
                                                @click="regenerateAnswer" :disabled="state.isGeneratingResponse"
                                                :title="$t('assistants.actions.regenerate')"
                                                class="flex items-center gap-1 px-1.5 py-1 rounded text-xs text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors disabled:opacity-40">
                                                <Icon name="ph:arrow-clockwise" class="h-3.5 w-3.5" />
                                                {{ $t('assistants.actions.regenerate') }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- A blank box does not tell anyone what the assistant is for, so a
                            fresh chat offers the things it is actually good at. -->
                            <div v-if="showStarters" class="space-y-2">
                                <p class="text-xs font-medium text-gray-400">{{ $t('assistants.starters.title') }}</p>
                                <button v-for="starter in STARTER_KEYS" :key="starter" type="button"
                                    @click="useStarter($t(`assistants.starters.${starter}`))"
                                    class="flex w-full items-start gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left text-sm text-gray-600 hover:border-primary/40 hover:text-primary transition-colors">
                                    <Icon name="ph:sparkle" class="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
                                    <span>{{ $t(`assistants.starters.${starter}`) }}</span>
                                </button>
                            </div>
                            <div v-if="state.isStreaming" class="flex justify-center">
                                <button type="button" @click="stopGenerating"
                                    class="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors">
                                    <Icon name="ph:stop-circle" class="h-3.5 w-3.5" />
                                    {{ $t('assistants.actions.stop') }}
                                </button>
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
                    <div class="border-t border-gray-100 bg-white px-4 py-4">
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
                                <div class="flex items-start gap-1.5">
                                    <Icon name="ph:shield-check" class="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                    <span>
                                        {{ $t('assistants.dataGovernanceNotice') }}
                                        <a :href="aiGovernanceUrl" target="_blank" rel="noopener noreferrer"
                                            class="underline" style="color: #104c75">AI Governance</a>
                                    </span>
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
                                    class="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                    <Icon name="ph:paperclip" class="h-5 w-5" />
                                </button>
                                <button type="button" @click="insertMentionTrigger" :title="$t('assistants.mentionSomeone')"
                                    class="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                    <Icon name="ph:at" class="h-5 w-5" />
                                </button>
                                <button type="button" @click="togglePreview" :title="$t('assistants.previewBeforeSending')"
                                    :disabled="!state.newMessage.trim()"
                                    class="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
                                    <Icon name="ph:eye" class="h-5 w-5" />
                                </button>
                                <div class="relative flex-1">
                                    <textarea ref="promptTextarea" v-model="state.newMessage"
                                        :placeholder="$t('assistants.askAnything')" rows="1"
                                        class="block w-full bg-transparent border-none shadow-none ring-0 focus:ring-0 focus:outline-none resize-none py-1.5 px-0 text-sm text-gray-900 placeholder-gray-400"
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
            </aside>
        </transition>

        <DialogConfirmation :isModalOpen="state.isConfirmDeleteOpen"
            :message="$t('assistants.history.deleteConfirmation')" @close="state.isConfirmDeleteOpen = false"
            @confirm="deleteConversation" />
    </div>
</template>

<script setup lang="ts">
import { aIAssistantService } from '@/components/api/user/AIAssistantService'
import { aiConversationService } from '@/components/api/user/AiConversationService'
import { citizenService } from '@/components/api/user/CitizenService'
import { generalSearchService } from '@/components/api/user/GeneralSearchService'
import { userService } from '@/components/api/user/UserService'
import { useAssistantStore } from '@/store/assistant'
import { useCitizenStore } from '@/store/citizen'
import { useCompactRelativeTime } from '@/composables/compactRelativeTime'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import type { Error } from '@/types'

const assistantStore = useAssistantStore()
const citizenStore = useCitizenStore() as any
const route = useRoute()
const { t, locale } = useI18n()
const { errorAlert } = useAlert()
const { formatCompactRelativeTime } = useCompactRelativeTime()

const AI_GOVERNANCE_URLS: Record<string, string> = {
    dk: 'https://citizenone.dk/ai-governance',
    en: 'https://citizenone.eu/ai-governance',
    sv: 'https://citizenone.eu/sv/ai-governance',
    no: 'https://citizenone.eu/nb/ai-governance',
}

const aiGovernanceUrl = computed(() => AI_GOVERNANCE_URLS[locale.value] ?? AI_GOVERNANCE_URLS.en)

const MAX_FILE_SIZE = 20 * 1024 * 1024

const editInputRef = ref<HTMLInputElement | null>(null)
const promptTextarea = ref<HTMLTextAreaElement | null>(null)

function closePanel() {
    assistantStore.close()
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
        employees: [] as Array<{ uuid: string, label: string, type: 'citizen' | 'employee' }>,
        employeesLoaded: false,
        citizenResults: [] as Array<{ uuid: string, label: string, type: 'citizen' | 'employee' }>,
        results: [] as Array<{ uuid: string, label: string, type: 'citizen' | 'employee' }>,
    },
    // Audit P2.3: on-demand "what will be sent" preview.
    preview: {
        isOpen: false,
        isLoading: false,
        redactedPrompt: '',
    },
    copiedIndex: null as number | null,
    // Distinct from isGeneratingResponse: true only while fragments are still
    // arriving, which is the window where stopping means anything.
    isStreaming: false,
    // Kept so an answer can be re-asked without the user retyping the question.
    lastRequest: {
        prompt: '',
        citizenUuids: [] as string[],
        employeeUuids: [] as string[],
    },
})

// Suggestions for an empty chat, matching what the assistant is actually good
// at. Order matches the product description: overview, summary, report, lookup.
const STARTER_KEYS = ['overview', 'summary', 'report', 'organisation']

const showStarters = computed(() =>
    state.view === 'chat' && state.messages.length <= 1 && !state.isGeneratingResponse)

const filteredConversations = computed(() => {
    const query = state.searchQuery.trim().toLowerCase()
    if (!query) return state.conversations
    return state.conversations.filter((c: any) => (c.title || '').toLowerCase().includes(query))
})

// Esc closes the panel. It is deliberately not a dialog - the page behind stays
// live - so headlessui's keyboard handling does not come with it.
function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !assistantStore.isOpen) return
    // Let the mention picker and the redaction preview take Escape first.
    if (state.mention.isOpen || state.preview.isOpen) return
    assistantStore.close()
}

onMounted(() => {
    document.addEventListener('keydown', onKeydown)
    // Reopening after a reload restores the panel, so its data has to load too.
    if (assistantStore.isOpen) initialisePanel()
})

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))

watch(() => assistantStore.isOpen, (isOpen: boolean) => {
    if (!isOpen) return
    initialisePanel()
    nextTick(() => promptTextarea.value?.focus())
})

function initialisePanel() {

    // The greeting is seeded once. Re-opening keeps the conversation, otherwise
    // stepping away to look something up would wipe the answer you went to check.
    if (!state.messages.length) {
        state.messages.push({ type: 'bot', text: `${t('assistants.helloHowCanIAssistYouToday')}?` })
    }
    state.view = 'chat'
    state.preview.isOpen = false
    fetchConversations()
    loadMentionableEmployees()
    applyRouteContext()
}

// Follows the user around the app: ask about the citizen whose page is open
// without tagging them by hand first.
watch(() => route.fullPath, () => {
    if (assistantStore.isOpen) applyRouteContext()
})

async function applyRouteContext() {
    const uuid = route.params?.uuid as string | undefined
    if (!uuid || !String(route.name ?? '').startsWith('citizens-uuid')) return
    if (state.mentionedEntities.some((entity) => entity.uuid === uuid)) return

    const label = await resolveCitizenLabel(uuid)
    if (!label) return
    // A second guard: resolving the name is async and the user may have tagged
    // or navigated in the meantime.
    if (state.mentionedEntities.some((entity) => entity.uuid === uuid)) return
    state.mentionedEntities.push({ uuid, label, type: 'citizen' })
}

async function resolveCitizenLabel(uuid: string): Promise<string> {
    const selected = citizenStore.getSelectedCitizen?.data
    if (selected?.uuid === uuid) {
        return `${selected.firstname ?? ''} ${selected.lastname ?? ''}`.trim()
    }
    try {
        const response = await citizenService.getCitizen(uuid)
        const citizen = response?.data
        return citizen ? `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim() : ''
    } catch {
        return ''
    }
}

// Employees are a short, stable list, so one fetch per session is enough.
// Citizens are not - they used to be pulled in full (with journals, plans and
// medicines eager-loaded) every single time the assistant opened, so they are
// looked up server-side as the user types instead.
async function loadMentionableEmployees() {
    if (state.mention.employeesLoaded) return
    try {
        const response = await userService.getAllUsersWithoutAllUsersOption()
        state.mention.employees = (response?.data ?? [])
            .filter((employee: any) => employee.uuid && employee.uuid !== 'all-employees')
            .map((employee: any) => ({
                uuid: employee.uuid,
                label: `${employee.firstname ?? ''} ${employee.lastname ?? ''}`.trim(),
                type: 'employee' as const,
            }))
        state.mention.employeesLoaded = true
    } catch {
        // Without the list the picker just falls back to citizens.
    }
}

async function searchMentionableCitizens(query: string) {
    if (query.length < 2) return []
    try {
        const response = await generalSearchService.search({
            search: JSON.stringify([query]),
            page_length: 8,
        })
        return (response?.citizens ?? [])
            .filter((citizen: any) => citizen.uuid)
            .map((citizen: any) => ({
                uuid: citizen.uuid,
                label: `${citizen.firstname ?? ''} ${citizen.lastname ?? ''}`.trim(),
                type: 'citizen' as const,
            }))
    } catch {
        return []
    }
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
    state.mentionedEntities = []
    state.lastRequest.prompt = ''
    state.view = 'chat'
    // A new chat on a citizen page starts from that citizen again.
    applyRouteContext()
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
        // processPayload clears the tags; on a citizen page the page context
        // should still be there for the next question.
        applyRouteContext()

        const response = await requestAnswer(formData)
        if (response?.data) {
            applyAnswer(response)
            fetchConversations()
        }
    } catch (error: any) {
        state.error = rateLimitError(error) ?? error
    }
    state.isGeneratingResponse = false
}

// The assistant has its own request ceiling. Telling the user "something went
// wrong" for a limit they will be under again shortly is the wrong story.
function rateLimitError(error: any) {
    if (error?.status !== 429) return null

    const seconds = Number(error.retryAfter) || 0
    if (seconds > 600) return { message: t('assistants.rateLimitedToday') }

    return { message: t('assistants.rateLimited', { minutes: Math.max(1, Math.ceil(seconds / 60)) }) }
}

// The model answers in markdown. This used to return the raw string, so
// headings, lists and tables reached the user as literal `#`, `-` and `|`.
// The result still goes through v-safe-html (DOMPurify) before it hits the DOM.
// Streams when the API and whatever sits in front of it allow it, and falls
// back to the buffered endpoint otherwise. Both return the same payload, so
// only the waiting differs.
let streamAbort: AbortController | null = null

function stopGenerating() {
    streamAbort?.abort()
}

async function requestAnswer(formData: FormData) {
    const streamed = { index: -1, text: '', done: null as any }
    streamAbort = new AbortController()

    try {
        await aIAssistantService.streamMessage(formData, (event: string, data: any) => {
            if (event === 'delta') {
                if (streamed.index === -1) {
                    // The typing indicator gives way to the answer itself as
                    // soon as there is something to show.
                    state.isGeneratingResponse = false
                    state.isStreaming = true
                    streamed.index = state.messages.push({ type: 'bot', text: '' }) - 1
                }
                streamed.text += data?.text ?? ''
                state.messages[streamed.index].text = streamed.text
                return
            }
            if (event === 'done') streamed.done = data
            if (event === 'error') throw new Error(data?.message ?? '')
        }, streamAbort.signal)
    } catch (error: any) {
        state.isStreaming = false

        // Stopping is a choice, not a failure: whatever was written is kept.
        if (error?.name === 'AbortError') {
            return streamed.done ?? (streamed.text ? { data: { answer: streamed.text }, stopped: true } : null)
        }

        // Drop a partial answer before retrying, so nothing is shown twice.
        if (streamed.index !== -1) state.messages.splice(streamed.index, 1)
        if (streamed.done) return streamed.done
        if (!error?.streamUnavailable) throw error

        state.isGeneratingResponse = true

        return await aIAssistantService.sendMessage(formData)
    } finally {
        state.isStreaming = false
        streamAbort = null
    }

    if (!streamed.done) throw new Error(t('alert.somethingWentWrong'))

    // The streamed fragments were progress; the completed answer is what gets
    // kept, so the rendered result matches the buffered path exactly.
    if (streamed.index !== -1) state.messages.splice(streamed.index, 1)

    return streamed.done
}

function applyAnswer(response: any) {
    state.messages.push({
        type: 'bot',
        text: response?.data?.answer,
        sources: response?.sources ?? [],
        companyDataStatus: response?.company_data_status ?? 'ready',
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
}

function formatMessage(messageText: string) {
    return renderMarkdown(messageText ?? '')
}

async function copyAnswer(message: any, index: number) {
    try {
        await navigator.clipboard.writeText(message?.text ?? '')
        state.copiedIndex = index
        setTimeout(() => {
            if (state.copiedIndex === index) state.copiedIndex = null
        }, 2000)
    } catch {
        errorAlert(`${t('alert.somethingWentWrong')}!`, t('assistants.actions.copyFailed'))
    }
}

function useStarter(text: string) {
    state.newMessage = text
    nextTick(() => promptTextarea.value?.focus())
}

// Re-asks the last question on the same conversation. Attachments are not
// resent - they already live on the conversation from the first send.
async function regenerateAnswer() {
    if (state.isGeneratingResponse || !state.lastRequest.prompt) return

    if (state.messages[state.messages.length - 1]?.type === 'bot') state.messages.pop()

    state.error = {}
    state.isGeneratingResponse = true
    try {
        const formData = new FormData()
        formData.append('prompt', state.lastRequest.prompt)
        if (state.aiElements.conversationId) formData.append('conversation_id', state.aiElements.conversationId)
        if (state.aiElements.vectorStoreId) formData.append('vector_store_id', state.aiElements.vectorStoreId)
        state.lastRequest.citizenUuids.forEach((uuid) => formData.append('citizen_uuids[]', uuid))
        state.lastRequest.employeeUuids.forEach((uuid) => formData.append('employee_uuids[]', uuid))

        const response = await requestAnswer(formData)
        if (response?.data) applyAnswer(response)
    } catch (error: any) {
        state.error = rateLimitError(error) ?? error
    }
    state.isGeneratingResponse = false
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

// Employees come from the cached list, citizens from a debounced server-side
// lookup, so the two halves of the picker settle independently.
let mentionSearchTimer: ReturnType<typeof setTimeout> | null = null
let mentionSearchToken = 0

function filterMentionResults() {
    const query = state.mention.query.trim()
    const lowered = query.toLowerCase()
    const alreadyMentioned = new Set(state.mentionedEntities.map((e) => e.uuid))

    const employees = state.mention.employees
        .filter((e) => !alreadyMentioned.has(e.uuid))
        .filter((e) => !lowered || e.label.toLowerCase().includes(lowered))
        .slice(0, 4)

    state.mention.results = [...employees, ...state.mention.citizenResults
        .filter((e) => !alreadyMentioned.has(e.uuid))
        .slice(0, 8 - employees.length)]

    if (mentionSearchTimer) clearTimeout(mentionSearchTimer)
    if (query.length < 2) {
        state.mention.citizenResults = []
        return
    }

    const token = ++mentionSearchToken
    mentionSearchTimer = setTimeout(async () => {
        const citizens = await searchMentionableCitizens(query)
        // A newer keystroke already started its own lookup.
        if (token !== mentionSearchToken) return
        state.mention.citizenResults = citizens
        const mentioned = new Set(state.mentionedEntities.map((e) => e.uuid))
        state.mention.results = [
            ...state.mention.results.filter((e) => e.type === 'employee'),
            ...citizens.filter((e) => !mentioned.has(e.uuid)),
        ].slice(0, 8)
    }, 250)
}

onBeforeUnmount(() => {
    if (mentionSearchTimer) clearTimeout(mentionSearchTimer)
})

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

    state.lastRequest.prompt = state.newMessage
    state.lastRequest.citizenUuids = state.mentionedEntities.filter((e) => e.type === 'citizen').map((e) => e.uuid)
    state.lastRequest.employeeUuids = state.mentionedEntities.filter((e) => e.type !== 'citizen').map((e) => e.uuid)

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
<style scoped>
/* Styling for the markdown the assistant returns. Scoped to the answer bubble
   so it can't leak into the rest of the chat. */
.ai-answer :deep(p) {
    margin: 0 0 0.6rem;
}

.ai-answer :deep(p:last-child) {
    margin-bottom: 0;
}

.ai-answer :deep(h3),
.ai-answer :deep(h4),
.ai-answer :deep(h5),
.ai-answer :deep(h6) {
    font-weight: 600;
    color: #111827;
    margin: 0.9rem 0 0.4rem;
}

.ai-answer :deep(h3) {
    font-size: 0.95rem;
}

.ai-answer :deep(h4),
.ai-answer :deep(h5),
.ai-answer :deep(h6) {
    font-size: 0.875rem;
}

.ai-answer :deep(> :first-child) {
    margin-top: 0;
}

.ai-answer :deep(ul),
.ai-answer :deep(ol) {
    margin: 0 0 0.6rem;
    padding-left: 1.25rem;
}

.ai-answer :deep(ul) {
    list-style: disc;
}

.ai-answer :deep(ol) {
    list-style: decimal;
}

.ai-answer :deep(li) {
    margin: 0.15rem 0;
}

.ai-answer :deep(a) {
    color: #0f4c75;
    text-decoration: underline;
}

.ai-answer :deep(strong) {
    font-weight: 600;
    color: #111827;
}

.ai-answer :deep(code) {
    background: #f3f4f6;
    border-radius: 0.25rem;
    padding: 0.05rem 0.3rem;
    font-size: 0.8125rem;
}

.ai-answer :deep(pre) {
    background: #f3f4f6;
    border-radius: 0.5rem;
    padding: 0.6rem 0.75rem;
    margin: 0 0 0.6rem;
    overflow-x: auto;
}

.ai-answer :deep(pre code) {
    background: transparent;
    padding: 0;
}

.ai-answer :deep(blockquote) {
    border-left: 3px solid #d1d5db;
    padding-left: 0.75rem;
    color: #4b5563;
    margin: 0 0 0.6rem;
}

.ai-answer :deep(hr) {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 0.75rem 0;
}

/* Wide tables scroll inside the bubble rather than stretching the chat. */
.ai-answer :deep(table) {
    display: block;
    overflow-x: auto;
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 0.6rem;
    font-size: 0.8125rem;
}

.ai-answer :deep(th),
.ai-answer :deep(td) {
    border: 1px solid #e5e7eb;
    padding: 0.35rem 0.55rem;
    text-align: left;
    vertical-align: top;
}

.ai-answer :deep(th) {
    background: #f9fafb;
    font-weight: 600;
}
</style>
