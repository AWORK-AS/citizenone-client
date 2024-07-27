<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('messages.messages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('messages.messages') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4">
                        <div class="md:col-span-5 xl:col-span-4 bg-white rounded-md p-6 overflow-y-auto"
                            style="height: 80vh;">
                            <ul>
                                <li class="flex items-center space-x-4 border-b border-gray-100 px-1 py-3 cursor-pointer"
                                    v-for="(chattedUser, index) in state.chattedUsers" :key="index"
                                    @click="messageEmployee(chattedUser)">
                                    <img src="/img/avatars/user.svg" alt="Item 1" class="w-12 h-12 rounded-full">
                                    <div>
                                        <h4 class="font-semibold text-sm">
                                            {{ chattedUser?.firstname + " " + chattedUser?.lastname }}
                                        </h4>
                                        <p class="text-gray-600 text-xs">
                                            {{ chattedUser?.email }}
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="md:col-span-7 xl:col-span-8 bg-white rounded-md pb-6">
                            <div class="px-6 py-3 shadow-sm">
                                <div class="flex items-center gap-x-2">
                                    <img src="/img/avatars/user.svg" alt="Item 1" class="w-12 h-12 rounded-full">
                                    <div>
                                        <h4 class="font-semibold text-sm">
                                            {{ employeeStore.getSelectedEmployee?.firstname }}
                                            {{ employeeStore.getSelectedEmployee?.lastname }}
                                        </h4>
                                        <p class="text-gray-600 text-xs">
                                            {{ employeeStore.getSelectedEmployee?.email }}
                                        </p>
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
                                    <div class="text-center text-gray-500 text-sm" v-if="state.isChatLoading">
                                        {{ $t('messages.loadingMessages') }}
                                        <span class="dot1">.</span>
                                        <span class="dot2">.</span>
                                        <span class="dot3">.</span>
                                        <span class="dot4">.</span>
                                        <span class="dot5">.</span>
                                    </div>
                                    <div v-for="(message, index) in state.messages" :key="index">
                                        <!-- Message (Right) -->
                                        <div class="flex items-start justify-end mb-4"
                                            v-if="message?.sender_id === userStore.getUser?.id">
                                            <div class="mr-2">
                                                <div class="bg-primary text-white p-3 rounded-lg">
                                                    <p>{{ message?.message }}</p>
                                                </div>
                                                <span class="text-xs text-gray-500 mt-1">
                                                    {{ formatTimeToReadable(message?.created_at) }}
                                                </span>
                                            </div>
                                            <div class="flex-shrink-0 flex items-center">
                                                <img class="h-10 w-10 rounded-full mt-1" src="/img/avatars/user.svg"
                                                    alt="User">
                                            </div>
                                        </div>
                                        <!-- Message (Left) -->
                                        <div class="flex items-start mb-4" v-else>
                                            <div class="flex-shrink-0">
                                                <img class="h-10 w-10 rounded-full mt-1" src="/img/avatars/user.svg"
                                                    alt="User">
                                            </div>
                                            <div class="ml-2">
                                                <div class="bg-gray-200 p-3 rounded-lg">
                                                    <p class="text-gray-700">
                                                    <p>{{ message?.message }}</p>
                                                    </p>
                                                </div>
                                                <span class="text-xs text-gray-500 mt-1">
                                                    {{ formatTimeToReadable(message?.created_at) }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center px-4 md:px-6">
                                <!-- Chat Input -->
                                <div class="w-full flex justify-between gap-x-1">
                                    <button type="button"
                                        class="flex items-center px-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700 focus:ring-opacity-50"
                                        :disabled="state.isPageLoading">
                                        <Icon name="ph:paperclip" class="w-7 h-7 text-primary rounded-full" />
                                    </button>
                                    <input type="text"
                                        class="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Type a message..." v-model="state.message"
                                        @keydown.enter="!state.isPageLoading && sendMessage()" />
                                    <button type="button"
                                        class="px-4 py-3 bg-primary text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:ring-opacity-50"
                                        @click="sendMessage" :disabled="state.isPageLoading">
                                        Send
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import pusher from '@/services/pusher'
import { messageService } from '@/components/api/MessageService'
import { useUserStore } from '@/store/user'
import { useEmployeeStore } from '@/store/employee'
import type { ChattedUser, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const employeeStore = useEmployeeStore() as any
const userStore = useUserStore() as any
const router = useRouter()
const receiverUuid = router?.currentRoute?.value?.params?.receiver_uuid
const scrollableChatHistory = ref<HTMLElement | null>(null)
let currentPage = 1
let scrollHeight = 0

const state = reactive({
    chattedUsers: [] as ChattedUser[],
    error: {} as Error,
    isLastPage: false,
    isChatLoading: false,
    isPageLoading: false,
    message: '',
    messages: [] as any
})

onMounted(() => {
    const channel = pusher.subscribe('citizenone.' + userStore.getUser?.id)
    channel.bind('chat-message', (response: any) => {
        state.messages.push(response?.data)
        fetchChattedUsers()
    })
    fetchChattedUsers()
    fetchChatHistory()
    scrollHeight = scrollableChatHistory.value?.scrollHeight ?? 0
})

async function fetchChattedUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await messageService.fetchChattedUsers()
        if (response) {
            state.chattedUsers = response?.data
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

async function fetchChatHistory() {
    state.error = {}
    state.isChatLoading = true
    try {
        const params = {
            user_uuid: receiverUuid,
            page: currentPage
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
    state.isChatLoading = false
}

async function sendMessage() {
    if (state.message !== '') {
        state.isPageLoading = true
        try {
            const params = {
                message: state.message,
                receiver_uuid: receiverUuid
            }
            const response = await messageService.sendMessage(params)
            if (response) {
                state.messages.push(response?.data)
                fetchChattedUsers()
                scrollToBottom()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
        state.message = ''
    }
}

function formatTimeToReadable(datetime: string) {
    return moment(datetime).format('HH:mm')
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
            // Store the current scroll height
            const previousScrollHeight = scrollableChatHistory.value.scrollHeight

            // Store the position of the current scroll position relative to the scroll container
            const currentScrollTop = scrollableChatHistory.value.scrollTop

            // Increment the page number and fetch the chat history
            currentPage++
            fetchChatHistory().then(() => {
                if (scrollableChatHistory.value) {
                    // Calculate the new scroll position to maintain the current view
                    const newScrollHeight = scrollableChatHistory.value.scrollHeight
                    const scrollDifference = newScrollHeight - previousScrollHeight

                    // Set the scrollTop to the calculated position

                    scrollableChatHistory.value.scrollTop = scrollDifference + currentScrollTop
                }
            })
        }
    }
}

function messageEmployee(employee: any) {
    employeeStore.setSelectedEmployee(employee)
    navigateTo(`/messages/${employee.uuid}`)
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