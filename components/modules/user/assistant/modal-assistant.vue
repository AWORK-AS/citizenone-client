<template>
    <div>
        <Modal size="xl" :title="$t('assistants.askAI')" titleIcon="ph:lightbulb" :show="props.isModalOpen"
            @close="closeModal">
            <template #modal-body>
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <div class="flex flex-col h-[68vh] bg-transparent -mx-4 -mb-4 sm:-mx-6 sm:-mb-6">
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
                                    <div class="text-sm text-white leading-relaxed text-right"
                                        v-html="formatMessage(message?.text)" />
                                </div>
                                <!-- AI message -->
                                <div v-else
                                    class="w-full bg-gray-50 border border-gray-100 rounded-md px-0 py-2 flex items-start gap-3 ">
                                    <div
                                        class="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center mt-0.5 ml-2 shadow-sm px-2">
                                        <Icon name="ph:lightbulb" class="h-4 w-4 text-white" />
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="text-xs font-medium text-gray-400 mb-1">Ask AI</div>
                                        <div class="text-sm text-gray-800 leading-relaxed"
                                            v-html="formatMessage(message?.text)" />
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
                            <div
                                class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md
                                focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all px-3 py-1.5">

                                <input ref="fileInput" type="file" multiple
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.jpg,.jpeg,.png" class="hidden"
                                    @change="onFilesSelected" />
                                <button type="button" @click="($refs.fileInput as HTMLInputElement).click()"
                                    class="shrink-0 px-1.5 pt-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                                    <Icon name="ph:paperclip" class="h-5 w-5" />
                                </button>
                                <div class="flex-1 [&_input]:border-none [&_input]:shadow-none [&_input]:bg-transparent [&_input]:ring-0
                                    [&_input]:focus:ring-0 [&_input]:focus:border-none [&_input]:h-9 [&_input]:px-0">
                                    <FormTextField id="prompt" name="prompt" :placeholder="$t('assistants.askAnything')"
                                        v-model="state.newMessage" @keydown.enter="sendMessage" />
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
    </div>
</template>

<script setup lang="ts">
import { aIAssistantService } from '@/components/api/user/AIAssistantService'
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

const MAX_FILE_SIZE = 20 * 1024 * 1024

function closeModal() {
    emit('close')
}

const state = reactive({
    error: {} as Error,
    isGeneratingResponse: false,
    messages: [] as any,
    newMessage: '',
    files: [] as File[],
    aiElements: {
        conversationId: null as string | null,
        vectorStoreId: null as string | null,
        fileIds: [] as string[],
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        state.messages = []
        state.files = []
        state.messages.push({ type: 'bot', text: `${t('assistants.helloHowCanIAssistYouToday')}?` })
    } else {
        clearAiElements()
    }
})

onUnmounted(() => {
    clearAiElements()
})

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
        if (response && response.output) {
            const messageOutput = response.output.find((item: any) => item.type === 'message');

            if (messageOutput?.content?.[0]?.text) {
                state.messages.push({
                    type: 'bot',
                    text: messageOutput.content[0].text,
                })
            }

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

function clearAiElements() {
    if (state.aiElements.conversationId) {
        const payload = {
            vector_store_id: state.aiElements.vectorStoreId,
            file_ids: state.aiElements.fileIds,
        }
        aIAssistantService.deleteThread(state.aiElements.conversationId, payload)
    }
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

    state.newMessage = ''
    state.files = []

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
