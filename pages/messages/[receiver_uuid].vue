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
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10">
                        <div class="md:col-span-3">
                            <ul class="py-4">
                                <li class="flex items-center space-x-4 border-b px-1 py-3 cursor-pointer"
                                    v-for="(chattedUser, index) in state.chattedUsers" :key="index"
                                    @click="navigateTo(`/messages/${chattedUser?.uuid}`)">
                                    <img src="/img/avatars/user.svg" alt="Item 1" class="w-12 h-12 rounded-full">
                                    <div>
                                        <h2 class="font-semibold">
                                            {{ chattedUser?.firstname + " " + chattedUser?.lastname }}
                                        </h2>
                                        <p class="text-gray-600 text-sm">
                                            {{ chattedUser?.email }}
                                        </p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div class="md:col-span-9">
                            <!-- Chat Messages -->
                            <div class="p-4 overflow-y-auto" style="height: 73vh;" ref="scrollableChatHistory"
                                @scroll="handleScroll">
                                <div v-if="state.isLastPage" class="text-center text-gray-500 text-sm">
                                    {{ $t('messages.allMessagesAreLoaded') }}
                                </div>
                                <div v-for="(message, index) in state.messages" :key="index">
                                    <!-- Message (Right) -->
                                    <div class="flex items-start justify-end mb-4"
                                        v-if="message?.sender_id === userStore.getUser.id">
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
                            <!-- Chat Input -->
                            <div class="fixed w-full bottom-4 md:right-4 md:max-w-5xl pr-7 md:pr-4">
                                <div class="flex justify-between gap-x-2">
                                    <input
                                        class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        type="text" placeholder="Type a message..." v-model="state.message"
                                        @keydown.enter="sendMessage">
                                    <button type="button"
                                        class="px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-700 focus:ring-opacity-50"
                                        @click="sendMessage">
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
import type { ChattedUser, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
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
    isPageLoading: false,
    message: '',
    messages: [] as any
})

onMounted(() => {
    const channel = pusher.subscribe('citizenone.' + userStore.getUser.id)
    channel.bind('chat-message', (response: any) => {
        state.messages.push(response?.data)
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
    // state.isPageLoading = true
    try {
        const params = {
            user_uuid: receiverUuid,
            page: currentPage
        }
        const response = await messageService.fetchChatHistory(params)
        if (response.data) {
            // console.log('response', response?.data?.reverse())
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
    state.isPageLoading = false
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
</script>