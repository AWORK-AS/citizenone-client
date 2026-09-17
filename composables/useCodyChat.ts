import { aIAssistantService } from '@/components/api/user/AIAssistantService'
import { aiConversationService } from '@/components/api/user/AiConversationService'
import { citizenService } from '@/components/api/user/CitizenService'
import { generalSearchService } from '@/components/api/user/GeneralSearchService'
import { userService } from '@/components/api/user/UserService'
import { useCitizenStore } from '@/store/citizen'
import { useAlert } from '@/composables/alert'
import { usePermissions } from '@/composables/usePermissions'
import { useI18n } from 'vue-i18n'
import type { InjectionKey } from 'vue'
import type { Error } from '@/types'

/**
 * Everything Cody's panel knows and does, in one place instead of inside the
 * component that draws it.
 *
 * The panel was a single 1,235-line component holding the conversation, the
 * history list, the @mention picker, uploads, the redaction preview, the
 * rate-limit story and the stream reader. Cody is about to appear next to the
 * thing you are reading rather than only in a panel, and every one of those
 * surfaces would have had to reach into that component to do it.
 *
 * So the state and the behaviour live here, and the components that show it are
 * free to be small. Created once by the panel and handed down with
 * provide/inject rather than kept in Pinia: it is scoped to the panel's tree,
 * and it needs `useI18n()`, which only resolves inside a component's setup.
 * What genuinely is global - whether the panel is open, and a question handed
 * over from elsewhere in the product - stays in `store/assistant`.
 */

export interface MentionEntity {
    uuid: string
    label: string
    type: 'citizen' | 'employee'
}

export interface ToolCall {
    tool: string
    turn: number
}

export interface ToolReceipt {
    tool: string
    summary?: string
    ms?: number
    ok?: boolean
}

export interface CodyMessage {
    type: 'user' | 'bot'
    text: string
    files?: Array<{ name: string, size: number }>
    sources?: Array<{ uuid: string, name: string }>
    companyDataStatus?: 'ready' | 'missing' | 'building'
    receipts?: ToolReceipt[]
}

export type CodyChat = ReturnType<typeof createCodyChat>

export const CODY_CHAT: InjectionKey<CodyChat> = Symbol('codyChat')

/**
 * Read the panel's chat from a child component. Throws rather than returning
 * null: a component reaching for this outside the panel is a wiring mistake,
 * and finding out at render time beats an empty thread nobody can explain.
 */
export function useCodyChat(): CodyChat {
    const chat = inject(CODY_CHAT)

    if (!chat) {
        throw new Error('useCodyChat() was called outside the assistant panel.')
    }

    return chat
}

const MAX_FILE_SIZE = 20 * 1024 * 1024

export function createCodyChat() {
    const { t } = useI18n()
    const { can } = usePermissions()
    const { errorAlert } = useAlert()
    const citizenStore = useCitizenStore() as any
    const route = useRoute()

    const state = reactive({
        error: {} as Error,
        isGeneratingResponse: false,
        messages: [] as CodyMessage[],
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
        mentionedEntities: [] as MentionEntity[],
        mention: {
            isOpen: false,
            query: '',
            employees: [] as MentionEntity[],
            employeesLoaded: false,
            citizenResults: [] as MentionEntity[],
            results: [] as MentionEntity[],
        },
        // Audit P2.3: on-demand "what will be sent" preview.
        preview: {
            isOpen: false,
            isLoading: false,
            redactedPrompt: '',
        },
        copiedIndex: null as number | null,
        // The two quieter notices, opened from "About data and access" under the
        // field. Kept in the chat rather than in the composer so the same answer
        // is given wherever Cody grows a second surface.
        showDataNotice: false,
        // Distinct from isGeneratingResponse: true only while fragments are still
        // arriving, which is the window where stopping means anything.
        isStreaming: false,
        // What Cody is reading right now, and what it has read on this turn. Both
        // are per-request: the receipts move onto the message when it lands, so
        // they stay attached to the answer they belong to.
        activeTools: [] as ToolCall[],
        receipts: [] as ToolReceipt[],
        // Kept so an answer can be re-asked without the user retyping the question.
        lastRequest: {
            prompt: '',
            citizenUuids: [] as string[],
            employeeUuids: [] as string[],
        },
    })

    // Cody's opening, shown while the thread is genuinely empty. It used to be
    // `<= 1` because the greeting was itself a message.
    const showStarters = computed(() =>
        state.view === 'chat' && state.messages.length === 0 && !state.isGeneratingResponse)

    const filteredConversations = computed(() => {
        const query = state.searchQuery.trim().toLowerCase()
        if (!query) return state.conversations
        return state.conversations.filter((c: any) => (c.title || '').toLowerCase().includes(query))
    })

    /**
     * The composer owns the textarea, so it says how to focus it and everything
     * else asks. Half the actions here end in "and put the cursor back in the
     * field", and passing a DOM ref around to achieve that is how a component
     * ends up owning state it has no business holding.
     */
    let focusComposer: (() => void) | null = null

    function onComposerFocusRequest(handler: () => void) {
        focusComposer = handler

        onScopeDispose(() => {
            if (focusComposer === handler) focusComposer = null
        })
    }

    function requestComposerFocus() {
        nextTick(() => focusComposer?.())
    }

    // ---------------------------------------------------------------- opening

    function initialisePanel() {
        // No seeded greeting message any more. An empty thread now shows Cody's
        // own opening - the figure, the greeting and four things worth asking -
        // and a greeting that is also the first chat message would say hello
        // twice. Re-opening keeps the conversation either way, otherwise
        // stepping away to look something up would wipe the answer you went to
        // check.
        state.view = 'chat'
        state.preview.isOpen = false
        fetchConversations()
        loadMentionableEmployees()
        applyRouteContext()
    }

    // Follows the user around the app: ask about the citizen whose page is open
    // without tagging them by hand first.
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

    // ------------------------------------------------------------- @mentions

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

    async function searchMentionableCitizens(query: string): Promise<MentionEntity[]> {
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

    onScopeDispose(() => {
        if (mentionSearchTimer) clearTimeout(mentionSearchTimer)
    })

    function selectMention(entity: MentionEntity) {
        state.newMessage = state.newMessage.replace(/@([^\s@]*)$/, `@${entity.label} `)
        state.mentionedEntities.push(entity)
        state.mention.isOpen = false
        requestComposerFocus()
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
        requestComposerFocus()
    }

    // ---------------------------------------------------------------- history

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
        state.messages = []
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

    // ------------------------------------------------------------------ asking

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

        // The backend now names the ceiling that fired instead of leaving us to infer
        // it. The retryAfter reading stays as the fallback so a client deployed ahead
        // of the backend still behaves: a daily ceiling resets hours out, a burst one
        // within the minute.
        const isDaily = error?.limit ? error.limit === 'daily' : seconds > 600

        if (isDaily) {
            return {
                message: t('assistants.rateLimitedToday'),
                isDaily: true,
                // Only the daily ceiling is worth offering a purchase against, and only
                // to someone allowed to make one. The permission is read from the user
                // rather than from the error: the response says the same thing, but the
                // streaming path does not always carry the body through, and a button
                // that appears or not depending on which request path answered is worse
                // than one decided by what the user is actually allowed to do.
                canBuy: can('manage_licenses') || error?.can_manage_licenses === true,
            }
        }

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

        state.activeTools = []
        state.receipts = []

        try {
            await aIAssistantService.streamMessage(formData, (event: string, data: any) => {
                // Tool events arrive between the fragments. An event name this
                // client does not know is ignored by requestStream, which is what
                // lets the backend add to this list without a flag day.
                if (event === 'tool_call_start') {
                    state.activeTools.push({ tool: data?.tool ?? '', turn: data?.turn ?? 1 })
                    return
                }
                if (event === 'tool_call_end') {
                    state.activeTools = state.activeTools.filter((call) => call.tool !== data?.tool)
                    state.receipts.push({
                        tool: data?.tool ?? '',
                        summary: data?.summary ?? '',
                        ms: data?.ms ?? 0,
                        ok: data?.ok !== false,
                    })
                    return
                }
                if (event === 'delta') {
                    if (streamed.index === -1) {
                        // The typing indicator gives way to the answer itself as
                        // soon as there is something to show.
                        state.isGeneratingResponse = false
                        state.isStreaming = true
                        streamed.index = state.messages.push({
                            type: 'bot',
                            text: '',
                            receipts: state.receipts,
                        }) - 1
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
            // A tool left in the running list would sit there claiming to be
            // reading something after the answer arrived.
            state.activeTools = []
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
            // Copied, not referenced: the next question resets state.receipts, and
            // an answer's receipt belongs to that answer for as long as it is read.
            receipts: [...state.receipts],
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

    function formatMessage(messageText: string) {
        return renderMarkdown(messageText ?? '')
    }

    async function copyAnswer(message: any, index: number) {
        try {
            const { $sanitizeHtml } = useNuxtApp()
            const sanitized = $sanitizeHtml(formatMessage(message?.text))
            await navigator.clipboard.writeText(htmlToPlainText(sanitized))
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
        requestComposerFocus()
    }

    function handleEnterKey() {
        if (state.mention.isOpen && state.mention.results.length > 0) {
            selectMention(state.mention.results[0])
            return
        }
        sendMessage()
    }

    // ------------------------------------------------------------------- files

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

    // ----------------------------------------------------------------- preview

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

    // ---------------------------------------------------------------- payloads

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

    return {
        state,
        showStarters,
        filteredConversations,
        onComposerFocusRequest,
        requestComposerFocus,
        initialisePanel,
        applyRouteContext,
        loadMentionableEmployees,
        toggleView,
        fetchConversations,
        startEditing,
        cancelEditing,
        saveTitle,
        selectConversation,
        startNewChat,
        confirmDeleteConversation,
        deleteConversation,
        sendMessage,
        stopGenerating,
        regenerateAnswer,
        formatMessage,
        copyAnswer,
        useStarter,
        handleEnterKey,
        onFilesSelected,
        removeFile,
        selectMention,
        removeMentionedEntity,
        insertMentionTrigger,
        togglePreview,
    }
}
