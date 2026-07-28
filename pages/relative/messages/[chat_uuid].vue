<template>
    <div>
        <NuxtLayout name="relative">

            <Head>
                <Title>{{ $t('messages.messages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <Breadcrumb :links="breadcrumbLinks" />
            </template>

            <template #header>{{ $t('messages.messages') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4">
                    <LoadingSpinner :isActive="state.isChatLoading"
                        class="md:col-span-5 xl:col-span-4 bg-white rounded-md overflow-y-auto" style="height: 80vh;">
                        <ModulesRelativeMessagesChats :chats="state.chats" />
                    </LoadingSpinner>
                    <LoadingSpinner :isActive="state.isChatHistoryDividerLoading"
                        class="md:col-span-7 xl:col-span-8 bg-white rounded-md pb-6">
                        <div class="px-6 py-3 shadow-sm">
                            <div class="h-10 flex items-center space-x-4" v-if="otherMember">
                                <img :src="otherMember?.user?.profile_image ?? '/img/avatars/user.svg'" alt="Item 1"
                                    class="w-10 h-10 rounded-full object-cover">
                                <h4 class="font-semibold text-sm">
                                    {{ otherMember?.user?.firstname + " " + otherMember?.user?.lastname }}
                                </h4>
                            </div>
                        </div>
                        <div class="overflow-y-auto pt-4 mb-4" style="height: 62vh;" ref="scrollableChatHistory"
                            @scroll="handleScroll">
                            <div class="px-4 md:px-6">
                                <div v-if="state.isLastPage && currentPage !== 1"
                                    class="text-center text-gray-500 text-sm">
                                    {{ $t('messages.allMessagesAreLoaded') }}
                                </div>
                                <div class="text-center text-gray-500 text-sm" v-if="state.isChatHistoryLoading">
                                    {{ $t('messages.loadingMessages') }}
                                </div>
                                <div v-for="(message, index) in state.messages" :key="index">
                                    <div v-if="message?.sender?.id === userStore.getUser?.id">
                                        <div class="flex items-start justify-end mb-4">
                                            <div class="mr-2">
                                                <Tooltip position="left"
                                                    :text="formatDateTimeToReadable(message?.created_at)">
                                                    <div class="bg-primary text-white p-3 rounded-lg">
                                                        <p class="text-sm">{{ message?.message }}</p>
                                                    </div>
                                                    <p class="text-xs text-gray-500 mt-1"
                                                        v-if="index === state.messages.length - 1 && message?.receipt?.created_at">
                                                        {{ $t('messages.seen') }}
                                                        {{ formatDateTimeToReadable(message?.receipt?.created_at) }}
                                                    </p>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else>
                                        <p class="text-xs ml-12"
                                            v-if="index === 0 || message?.sender?.id !== state.messages[index - 1]?.sender?.id">
                                            {{ message?.sender?.firstname + " " + message?.sender?.lastname }}
                                        </p>
                                        <div class="flex items-start mt-1 mb-4">
                                            <div class="flex-shrink-0">
                                                <img :src="message?.sender?.profile_image ?? '/img/avatars/user.svg'"
                                                    alt="User" class="w-10 h-10 rounded-full object-cover"
                                                    v-if="index === 0 || message?.sender?.id !== state.messages[index - 1]?.sender?.id">
                                                <div v-else class="ml-10"></div>
                                            </div>
                                            <div class="ml-2">
                                                <Tooltip position="right"
                                                    :text="formatDateTimeToReadable(message?.created_at)">
                                                    <div class="bg-gray-200 p-3 rounded-lg">
                                                        <p class="text-gray-700 text-sm">{{ message?.message }}</p>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center px-4 md:px-6">
                            <div class="w-full flex justify-between gap-x-1">
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
import { chatService } from '@/components/api/relative/ChatService'
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const userStore = useUserStore() as any
const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid
const currentRoute = router?.currentRoute?.value?.name
const scrollableChatHistory = ref<HTMLElement | null>(null)
let currentPage = 1
const breadcrumbLinks = [
    {
        name: 'messages.messages',
        translate: true,
        href: '/relative/messages',
    },
]

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

const otherMember = computed(() => {
    const members = state.chat?.data?.chat_members ?? []
    return members.find((member: any) => member.user_id !== userStore.getUser?.id) ?? members[0]
})

onMounted(() => {
    const channel = pusher.subscribe('citizenone.' + chatUuid)
    channel.bind('chat-message', (response: any) => {
        state.messages.push(response?.data)
        scrollToBottom()
        fetchChats()
    })
    fetchChat()
    fetchChats()
    fetchChatHistory()
})

window.setInterval(() => {
    if (currentRoute === 'relative-messages-chat_uuid') {
        fetchChats()
    }
}, 10000)

async function fetchChat() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await chatService.fetchChat(chatUuid as string)
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
        const response = await chatService.fetchChats()
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
        const response = await chatService.fetchChatHistory(params)
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

async function sendMessage() {
    if (state.message !== '') {
        state.isChatHistoryDividerLoading = true
        try {
            const params = {
                message: state.message,
                chat_uuid: chatUuid,
            }
            const response = await chatService.sendMessageViaChatUuid(params)
            if (response) {
                scrollToBottom()
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
</script>
