<template>
    <div>
        <NuxtLayout name="relative">

            <Head>
                <Title>{{ $t('messages.messages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbRelative>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/relative/messages')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('messages.messages') }}
                            </button>
                        </div>
                    </template>
                </BreadcrumbRelative>
            </template>

            <template #header>{{ $t('messages.messages') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4">
                    <LoadingSpinner :isActive="state.isChatLoading"
                        class="hidden md:block md:col-span-5 xl:col-span-4 bg-white rounded-md overflow-y-auto pane-height">
                        <ModulesRelativeMessagesChats :chats="state.chats" />
                    </LoadingSpinner>
                    <LoadingSpinner :isActive="state.isChatHistoryDividerLoading"
                        class="md:col-span-7 xl:col-span-8 bg-white rounded-md pb-6">
                        <div class="px-6 py-3 shadow-sm">
                            <div class="h-10 flex items-center">
                                <div v-if="otherChatMembers?.length > 0" class="flex items-center space-x-4">
                                    <img :src="memberAvatar(otherChatMembers[0])" alt="Avatar"
                                        class="w-10 h-10 rounded-full object-cover">
                                    <div>
                                        <h4 class="font-semibold text-sm">
                                            {{ otherChatMembers.map((member: any) =>
                                                memberDisplayName(member)).join(', ') }}
                                        </h4>
                                        <p class="text-xs text-gray-500" v-if="state.chat?.data?.subject">
                                            {{ state.chat?.data?.subject }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="overflow-y-auto pt-4 mb-4" style="height: 62vh;" ref="scrollableChatHistory"
                            @scroll="handleScroll">
                            <!-- Chat Messages -->
                            <div class="px-4 md:px-6">
                                <div v-if="state.isLastPage && currentPage !== 1"
                                    class="text-center text-gray-500 text-sm">
                                    {{ $t('messages.allMessagesAreLoaded') }}
                                </div>
                                <div class="text-center text-gray-500 text-sm" v-if="state.isChatHistoryLoading">
                                    {{ $t('messages.loadingMessages') }}
                                    <span class="dot1">.</span>
                                    <span class="dot2">.</span>
                                    <span class="dot3">.</span>
                                    <span class="dot4">.</span>
                                    <span class="dot5">.</span>
                                </div>
                                <div v-for="(message, index) in state.messages" :key="index">
                                    <!-- Message (Right, own) -->
                                    <div v-if="isOwnMessage(message)">
                                        <div class="flex items-start justify-end mb-4">
                                            <div class="mr-2">
                                                <Tooltip position="left"
                                                    :text="formatDateTimeToReadable(message?.created_at)">
                                                    <div class="bg-primary text-white p-3 rounded-lg">
                                                        <div v-if="message?.chat_message_attachments?.length > 0"
                                                            class="space-y-3">
                                                            <div v-for="(attachment, attachmentIndex) in message?.chat_message_attachments"
                                                                :key="attachmentIndex">
                                                                <img :src="attachment?.file_url"
                                                                    alt="Image failed to load."
                                                                    v-if="isImageFile(attachment?.file_name)"
                                                                    class="w-44 cursor-pointer"
                                                                    @click="downloadFile(attachment)">
                                                                <div v-else
                                                                    class="flex items-center gap-x-1 w-fit cursor-pointer"
                                                                    @click="downloadFile(attachment)">
                                                                    <Icon name="ph:file" class="h-8 w-8"
                                                                        aria-hidden="true" />
                                                                    {{ attachment?.file_name }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p v-if="message?.message" :class="message?.chat_message_attachments?.length > 0 && 'mt-2'" class="text-sm">{{ message?.message }}</p>
                                                    </div>
                                                    <p class="text-xs text-gray-500 mt-1"
                                                        v-if="index === state.messages.length - 1 && message?.receipt?.created_at">
                                                        {{ $t('messages.seen') }}
                                                        {{ formatDateTimeToReadable(message?.receipt?.created_at) }}
                                                    </p>
                                                </Tooltip>
                                            </div>
                                            <div class="flex-shrink-0 flex items-center">
                                                <img :src="senderAvatar(message)" alt="User"
                                                    class="w-10 h-10 rounded-full object-cover"
                                                    v-if="index === 0 || !isSameSender(message, state.messages[index - 1])">
                                                <div v-else class="mr-10"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Message (Left, others) -->
                                    <div v-else>
                                        <p class="text-xs ml-12"
                                            v-if="index === 0 || !isSameSender(message, state.messages[index - 1])">
                                            {{ senderDisplayName(message) }}
                                        </p>
                                        <div class="flex items-start mt-1 mb-4">
                                            <div class="flex-shrink-0">
                                                <img :src="senderAvatar(message)" alt="User"
                                                    class="w-10 h-10 rounded-full object-cover"
                                                    v-if="index === 0 || !isSameSender(message, state.messages[index - 1])">
                                                <div v-else class="ml-10"></div>
                                            </div>
                                            <div class="ml-2">
                                                <Tooltip position="right"
                                                    :text="formatDateTimeToReadable(message?.created_at)">
                                                    <div class="bg-gray-200 p-3 rounded-lg">
                                                        <div v-if="message?.chat_message_attachments?.length > 0"
                                                            class="space-y-3">
                                                            <div v-for="(attachment, attachmentIndex) in message?.chat_message_attachments"
                                                                :key="attachmentIndex">
                                                                <img :src="attachment?.file_url"
                                                                    alt="Image failed to load."
                                                                    v-if="isImageFile(attachment?.file_name)"
                                                                    class="w-44 cursor-pointer"
                                                                    @click="downloadFile(attachment)">
                                                                <div v-else
                                                                    class="flex items-center gap-x-1 w-fit cursor-pointer"
                                                                    @click="downloadFile(attachment)">
                                                                    <Icon name="ph:file" class="h-8 w-8"
                                                                        aria-hidden="true" />
                                                                    {{ attachment?.file_name }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p v-if="message?.message" :class="message?.chat_message_attachments?.length > 0 && 'mt-2'" class="text-gray-700 text-sm">{{ message?.message }}
                                                        </p>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center px-4 md:px-6">
                            <!-- Chat Input -->
                            <div class="w-full flex justify-between gap-x-1">
                                <input ref="fileInput" type="file" multiple @change="handleFileChange" class="hidden" />
                                <button type="button"
                                    class="flex items-center px-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700 focus:ring-opacity-50"
                                    :disabled="state.isPageLoading" @click="triggerFileInput">
                                    <Icon name="ph:paperclip" class="w-7 h-7 text-primary rounded-full" />
                                </button>
                                <input type="text"
                                    class="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    :placeholder="$t('messages.typeAMessage')" v-model="state.message"
                                    @keydown.enter="!state.isPageLoading && sendMessage()" />
                                <button type="button"
                                    class="px-4 py-3 bg-primary text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:ring-opacity-50"
                                    @click="sendMessage" :disabled="state.isPageLoading">
                                    {{ $t('messages.send') }}
                                </button>
                            </div>
                        </div>
                    </LoadingSpinner>
                </div>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import pusher from '@/services/pusher'
import { messageService } from '@/components/api/relative/MessageService'
import { useUserStore } from '@/store/user'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const userStore = useUserStore() as any
const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid
const scrollableChatHistory = ref<HTMLElement | null>(null)
let currentPage = 1
let chatListInterval: ReturnType<typeof setInterval> | null = null
const fileInput = ref(null) as any

const state = reactive({
    chat: [] as any,
    chats: [] as any,
    error: {} as Error,
    isLastPage: false,
    isChatLoading: false,
    isChatHistoryDividerLoading: false,
    isChatHistoryLoading: false,
    isPageLoading: false,
    message: '',
    messages: [] as any,
})

const otherChatMembers = computed(() => {
    return state.chat?.data?.chat_members?.filter((member: any) => !isSelfMember(member)) ?? []
})

onMounted(() => {
    const channel = pusher.subscribe('citizenone.' + chatUuid)
    channel.bind('chat-message', (response: any) => {
        appendMessage(response?.data)
        fetchChats()
        readChat()
    })
    fetchChat()
    fetchChats()
    fetchChatHistory()
    readChat()
    chatListInterval = setInterval(() => {
        fetchChats()
    }, 10000)
})

onUnmounted(() => {
    pusher.unsubscribe('citizenone.' + chatUuid)
    if (chatListInterval) {
        clearInterval(chatListInterval)
    }
})

// The relative is a CitizenContact morph; compare sender by type and id pair
// so numeric id collisions with User rows never mark a message as own.
function isRelativeType(type: string | undefined) {
    return (type ?? '').includes('CitizenContact')
}

function isSelfMember(member: any) {
    return isRelativeType(member?.user_type) && member?.user_id === userStore.getUser?.id
}

function isOwnMessage(message: any) {
    return isRelativeType(message?.sender_type) && message?.sender?.id === userStore.getUser?.id
}

function isSameSender(message: any, previousMessage: any) {
    return message?.sender_type === previousMessage?.sender_type &&
        message?.sender?.id === previousMessage?.sender?.id
}

function memberDisplayName(member: any) {
    const user = member?.user || {}
    return `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() || user.name || ''
}

function memberAvatar(member: any) {
    return member?.user?.profile_image ?? '/img/avatars/user.svg'
}

function senderDisplayName(message: any) {
    const sender = message?.sender || {}
    return `${sender.firstname ?? ''} ${sender.lastname ?? ''}`.trim() || sender.name || ''
}

function senderAvatar(message: any) {
    return message?.sender?.profile_image ?? '/img/avatars/user.svg'
}

async function fetchChat() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await messageService.fetchChat(chatUuid)
        if (response) {
            state.chat = response
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

async function fetchChats() {
    state.error = {}
    state.isChatLoading = true
    try {
        const response = await messageService.fetchChats()
        if (response) {
            state.chats = response
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isChatLoading = false
}

async function fetchChatHistory() {
    state.error = {}
    state.isChatHistoryLoading = true
    try {
        const params = {
            page: currentPage,
            chat_uuid: chatUuid,
        }
        const response = await messageService.fetchChatHistory(params)
        if (response.data) {
            response?.data?.forEach((chat: any) => {
                state.messages.unshift(chat)
            })
            if (currentPage === 1) {
                scrollToBottom()
            }
            if (response.links.next === null) {
                state.isLastPage = true
            }
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isChatHistoryLoading = false
}

async function readChat() {
    state.error = {}
    try {
        await messageService.readChat({ chat_uuid: chatUuid })
    } catch (error: any) {
        state.error = { message: error.message }
    }
}

// Append with uuid dedupe: the own send response and the Pusher broadcast can
// both deliver the same message.
function appendMessage(message: any) {
    if (!message?.uuid) return
    if (state.messages.some((existing: any) => existing?.uuid === message.uuid)) return
    state.messages.push(message)
    scrollToBottom()
}

async function sendMessage() {
    if (state.message !== '') {
        state.isChatHistoryDividerLoading = true
        try {
            const params = {
                message: state.message,
                chat_uuid: chatUuid
            }
            const response = await messageService.sendMessageViaChatUuid(params)
            if (response?.data) {
                appendMessage(response.data)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isChatHistoryDividerLoading = false
        state.message = ''
    }
}

function scrollToBottom() {
    nextTick(() => {
        if (scrollableChatHistory.value) {
            scrollableChatHistory.value.scrollTop = scrollableChatHistory.value.scrollHeight
        }
    })
}

function handleScroll() {
    if (scrollableChatHistory.value) {
        if (scrollableChatHistory.value.scrollTop === 0 && !state.isLastPage) {
            const previousScrollHeight = scrollableChatHistory.value.scrollHeight
            const currentScrollTop = scrollableChatHistory.value.scrollTop

            currentPage++
            fetchChatHistory().then(() => {
                if (scrollableChatHistory.value) {
                    const newScrollHeight = scrollableChatHistory.value.scrollHeight
                    const scrollDifference = newScrollHeight - previousScrollHeight
                    scrollableChatHistory.value.scrollTop = scrollDifference + currentScrollTop
                }
            })
        }
    }
}

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileChange = (event: any) => {
    uploadFiles(event.target.files)
}

const uploadFiles = async (files: any) => {
    state.isChatHistoryDividerLoading = true
    if (files.length > 0) {
        try {
            const params = new FormData()
            params.append('chat_uuid', chatUuid as any)
            for (let i = 0; i < files.length; i++) {
                params.append('file[]', files[i])
            }
            const response = await messageService.sendMessageViaChatUuid(params)
            if (response) {
                if (response?.data) {
                    appendMessage(response.data)
                }
                fetchChats()
                fileInput.value.value = ''
            }
        } catch (error: any) {
            state.error = error
        }
    }
    state.isChatHistoryDividerLoading = false
}

function isImageFile(filename: string) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
    return imageExtensions.test(filename);
}

async function downloadFile(attachment: any) {
    state.error = {}
    state.isChatHistoryDividerLoading = true
    try {
        const attachmentUuid = attachment?.uuid
        const response = await messageService.downloadAttachment(attachmentUuid)
        if (response) {
            saveAs(response, attachment?.file_name)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isChatHistoryDividerLoading = false
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
