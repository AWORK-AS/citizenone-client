<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('ownChatGpt.title') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <div class="flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                style="height: 82vh;">

                <!-- Chat Area -->
                <div class="flex flex-col flex-1 overflow-hidden h-full">

                    <!-- Header -->
                    <div class="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-white gap-2 flex-shrink-0">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                                <Icon name="simple-icons:openai" class="w-4 h-4 text-white" aria-hidden="true" />
                            </div>
                            <div>
                                <h4 class="font-semibold text-sm text-gray-900">{{ $t('ownChatGpt.title') }}</h4>
                                <p class="text-xs text-gray-400">{{ $t('ownChatGpt.poweredByYourKey') }}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-1">
                            <Tooltip :text="$t('ownChatGpt.sync')" position="left">
                                <button type="button"
                                    class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-40"
                                    :disabled="syncStore.isSyncing"
                                    @click="syncStore.startSync()">
                                    <Icon :name="syncStore.isSyncing ? 'ph:spinner' : 'ph:arrows-clockwise'"
                                        class="h-4 w-4 text-gray-500"
                                        :class="syncStore.isSyncing ? 'animate-spin' : ''"
                                        aria-hidden="true" />
                                </button>
                            </Tooltip>
                            <Tooltip :text="$t('ownChatGpt.clearChat')" position="left">
                                <button type="button"
                                    class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                                    @click="clearChat">
                                    <Icon name="ph:trash" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                                </button>
                            </Tooltip>
                            <Tooltip :text="$t('ownChatGpt.settings')" position="left">
                                <button type="button"
                                    class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                                    @click="state.isSettingsOpen = true">
                                    <Icon name="ph:gear" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                                </button>
                            </Tooltip>
                        </div>
                    </div>

                    <!-- Sync error -->
                    <div v-if="syncStore.error" class="px-4 pt-3 flex-shrink-0">
                        <Alert type="danger" :text="syncStore.error" />
                    </div>

                    <!-- Messages -->
                    <div class="flex-1 overflow-y-auto px-4 py-4 space-y-4" ref="messagesContainer">

                        <!-- Empty state -->
                        <div v-if="state.messages.length === 0"
                            class="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                                <Icon name="simple-icons:openai" class="w-8 h-8 text-gray-400" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 class="text-base font-semibold text-gray-800">{{ $t('ownChatGpt.emptyTitle') }}</h3>
                                <p class="text-sm text-gray-400 mt-1">{{ $t('ownChatGpt.emptySubtitle') }}</p>
                            </div>
                        </div>

                        <!-- Message bubbles -->
                        <div v-for="(msg, i) in state.messages" :key="i"
                            :class="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'">
                            <div :class="[
                                'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                                msg.role === 'user'
                                    ? 'bg-secondary text-white rounded-br-sm'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            ]">
                                <div v-if="msg.files && msg.files.length > 0"
                                    class="flex flex-wrap gap-1.5 mb-2">
                                    <div v-for="(file, fi) in msg.files" :key="fi"
                                        class="flex items-center gap-1.5 text-xs bg-white/20 text-white px-2 py-1 rounded-md">
                                        <Icon name="ph:file" class="h-3 w-3 shrink-0" aria-hidden="true" />
                                        <span class="max-w-[120px] truncate">{{ file.name }}</span>
                                    </div>
                                </div>
                                <p v-if="msg.role === 'user'" style="white-space: pre-wrap">{{ msg.content }}</p>
                                <p v-else v-html="msg.content" />
                            </div>
                        </div>

                        <!-- Thinking indicator -->
                        <div v-if="state.isThinking" class="flex justify-start">
                            <div class="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms" />
                                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms" />
                                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms" />
                            </div>
                        </div>
                    </div>

                    <!-- Input -->
                    <div class="flex-shrink-0 border-t border-gray-100 px-4 py-3 bg-white">
                        <Alert type="danger" :text="state.error" v-if="state.error" class="mb-3" />
                        <div v-if="state.files.length > 0" class="flex flex-wrap gap-1.5 mb-2">
                            <div v-for="(file, index) in state.files" :key="index"
                                class="flex items-center gap-1.5 bg-gray-100 text-xs text-gray-600 pl-2.5 pr-1.5 py-1.5 rounded-md">
                                <Icon name="ph:file" class="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                                <span class="max-w-[150px] truncate">{{ file.name }}</span>
                                <button type="button" @click="removeFile(index)"
                                    class="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded p-0.5 transition-colors">
                                    <Icon name="ph:x" class="h-3 w-3" aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                        <input ref="fileInput" type="file" multiple
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png"
                            class="hidden" @change="onFilesSelected" />
                        <div class="flex items-stretch gap-2">
                            <Tooltip :text="$t('ownChatGpt.attachFile')" position="top">
                                <button type="button"
                                    class="h-10 px-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors flex items-center"
                                    @click="($refs.fileInput as HTMLInputElement).click()">
                                    <Icon name="ph:paperclip" class="h-5 w-5" aria-hidden="true" />
                                </button>
                            </Tooltip>
                            <textarea rows="1"
                                class="flex-1 h-10 px-4 bg-gray-100 rounded-md text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 border-0 leading-10"
                                :placeholder="$t('ownChatGpt.placeholder')"
                                v-model="state.input"
                                @keydown.enter.exact.prevent="send" />
                            <button type="button"
                                class="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary-600 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
                                @click="send"
                                :disabled="state.isThinking || (!state.input.trim() && state.files.length === 0)">
                                <Icon name="ph:paper-plane-tilt" class="w-4 h-4 text-white" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Settings Modal -->
            <Modal size="md" :title="$t('ownChatGpt.settings')" :show="state.isSettingsOpen" @close="state.isSettingsOpen = false">
                <template #modal-body>
                    <div class="space-y-4">
                        <Alert type="danger" :text="state.settingsError" v-if="state.settingsError" />
                        <Alert type="success" :text="$t('ownChatGpt.savedSuccess')" v-if="state.settingsSuccess" />
                        <div class="space-y-1">
                            <label class="text-sm font-medium text-gray-700">{{ $t('ownChatGpt.apiKey') }}</label>
                            <input v-model="state.apiKey" type="password"
                                :placeholder="$t('ownChatGpt.apiKeyPlaceholder')"
                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
                        </div>
                        <div class="flex justify-end gap-x-2 pt-2">
                            <FormButton buttonStyle="cancel" @click="state.isSettingsOpen = false">
                                {{ $t('close') }}
                            </FormButton>
                            <FormButton buttonStyle="primary" :isLoading="state.isSavingKey" @click="saveApiKey">
                                {{ $t('ownChatGpt.save') }}
                            </FormButton>
                        </div>
                    </div>
                </template>
            </Modal>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { ownChatGptService } from '@/components/api/user/OwnChatGptService'
import { useOwnChatGptSyncStore } from '@/store/own-chatgpt-sync'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from 'vue-i18n'

const userStore = useUserStore()
if (!(userStore.getUser as any)?.has_own_chatgpt_access) {
    await navigateTo('/')
}

const syncStore = useOwnChatGptSyncStore()
const runtimeConfig = useRuntimeConfig()
const { t } = useI18n()
const { errorAlert } = useAlert()

const MAX_FILE_SIZE = 20 * 1024 * 1024

const messagesContainer = ref<HTMLElement | null>(null)

const state = reactive({
    messages: [] as any,
    input: '',
    files: [] as File[],
    isThinking: false,
    error: '',
    isSettingsOpen: false,
    apiKey: '',
    isSavingKey: false,
    settingsError: '',
    settingsSuccess: false,
    aiElements: {
        conversationId: null as string | null,
        vectorStoreId: null as string | null,
        fileIds: [] as string[],
    },
})

async function send() {
    const content = state.input.trim()
    if ((!content && state.files.length === 0) || state.isThinking) return

    state.error = ''
    const attachedFiles = state.files.map(f => ({ name: f.name }))
    state.messages.push({ role: 'user', content, files: attachedFiles.length ? attachedFiles : undefined })
    state.isThinking = true
    await nextTick()
    scrollToBottom()

    const formData = buildFormData(content)

    try {
        const res = await ownChatGptService.sendMessage(formData)
        const messageOutput = res?.output?.find((item: any) => item.type === 'message')
        const reply = messageOutput?.content?.[0]?.text ?? ''
        state.messages.push({ role: 'assistant', content: reply })

        if (res?.conversation_id) state.aiElements.conversationId = res.conversation_id
        if (res?.tools?.[0]?.vector_store_ids) state.aiElements.vectorStoreId = res.tools[0].vector_store_ids[0]
        if (res?.file_ids?.length) state.aiElements.fileIds.push(...res.file_ids)
    } catch (e: any) {
        state.error = e?.message ?? 'Something went wrong'
        state.messages.pop()
        state.input = content
        state.files = attachedFiles.length ? state.files : []
    } finally {
        state.isThinking = false
        await nextTick()
        scrollToBottom()
    }
}

function buildFormData(content: string): FormData {
    const formData = new FormData()
    formData.append('prompt', content)
    if (state.aiElements.conversationId) formData.append('conversation_id', state.aiElements.conversationId)
    if (state.aiElements.vectorStoreId) formData.append('vector_store_id', state.aiElements.vectorStoreId)
    state.files.forEach(file => formData.append('files[]', file))
    state.input = ''
    state.files = []
    return formData
}

function onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files) return
    const newFiles = Array.from(input.files)
    const currentSize = state.files.reduce((t, f) => t + f.size, 0)
    const incomingSize = newFiles.reduce((t, f) => t + f.size, 0)
    if (currentSize + incomingSize > MAX_FILE_SIZE) {
        errorAlert(t('alert.error'), t('assistants.fileSizeExceeds'))
        input.value = ''
        return
    }
    state.files.push(...newFiles)
    input.value = ''
}

function removeFile(index: number) {
    state.files.splice(index, 1)
}

async function saveApiKey() {
    state.settingsError = ''
    state.settingsSuccess = false
    state.isSavingKey = true
    try {
        await ownChatGptService.saveApiKey({ api_key: state.apiKey })
        state.settingsSuccess = true
        state.apiKey = ''
        setTimeout(() => { state.isSettingsOpen = false }, 1500)
    } catch (e: any) {
        state.settingsError = e?.message ?? 'Something went wrong'
    } finally {
        state.isSavingKey = false
    }
}

function clearChat() {
    state.messages = []
    state.error = ''
    state.files = []
    state.aiElements.conversationId = null
    state.aiElements.vectorStoreId = null
    state.aiElements.fileIds = []
}

function scrollToBottom() {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
}
</script>
