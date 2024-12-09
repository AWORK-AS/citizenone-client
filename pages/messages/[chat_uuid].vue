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

                <ul>
                    <li v-for="file in files" :key="file.name">{{ file.name }}</li>
                </ul>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4">
                        <div class="md:col-span-5 xl:col-span-4 bg-white rounded-md p-6 overflow-y-auto"
                            style="height: 80vh;">
                            <ul>
                                <li class="flex items-center space-x-4 border-b border-gray-100 px-1 py-3 cursor-pointer"
                                    v-for="(chattedUser, index) in state.chattedUsers" :key="index"
                                    @click="messageEmployee(chattedUser)">
                                    <img :src="chattedUser?.profile_image ?? '/img/avatars/user.svg'" alt="User"
                                        class="w-12 h-12 rounded-full object-cover">
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
                                    <img :src="employeeStore.getSelectedEmployee?.profile_image ?? '/img/avatars/user.svg'"
                                        alt="User" class="w-12 h-12 rounded-full object-cover">
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
                                                    <div v-if="message?.attachments?.length > 0" class="space-y-3">
                                                        <div v-for="(attachment, index) in message?.attachments"
                                                            :key="index">
                                                            <img :src="attachment?.file" alt="Image failed to load."
                                                                v-if="isImageFile(attachment?.file_name)"
                                                                class="w-44 cursor-pointer"
                                                                @click="openExternalFile(attachment)">
                                                            <div v-else
                                                                class="flex items-center gap-x-1 w-fit cursor-pointer"
                                                                @click="openExternalFile(attachment)">
                                                                <Icon name="ph:file" class="h-8 w-8"
                                                                    aria-hidden="true" />
                                                                {{ attachment?.file_name }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p v-else>{{ message?.message }}</p>
                                                </div>
                                                <span class="text-xs text-gray-500 mt-1">
                                                    {{ formatTimeToReadable(message?.created_at) }}
                                                </span>
                                            </div>
                                            <div class="flex-shrink-0 flex items-center">
                                                <img :src="message?.sender?.profile_image ?? '/img/avatars/user.svg'"
                                                    alt="User" class="w-10 h-10 rounded-full object-cover">
                                            </div>
                                        </div>
                                        <!-- Message (Left) -->
                                        <div class="flex items-start mb-4" v-else>
                                            <div class="flex-shrink-0">
                                                <img :src="message?.sender?.profile_image ?? '/img/avatars/user.svg'"
                                                    alt="User" class="w-10 h-10 rounded-full object-cover">
                                            </div>
                                            <div class="ml-2">
                                                <div class="bg-gray-200 p-3 rounded-lg">
                                                    <div v-if="message?.attachments?.length > 0" class="space-y-3">
                                                        <div v-for="(attachment, index) in message?.attachments"
                                                            :key="index">
                                                            <img :src="attachment?.file" alt="Image failed to load."
                                                                v-if="isImageFile(attachment?.file_name)"
                                                                class="w-44 cursor-pointer"
                                                                @click="openExternalFile(attachment)">
                                                            <div v-else
                                                                class="flex items-center gap-x-1 w-fit cursor-pointer"
                                                                @click="openExternalFile(attachment)">
                                                                <Icon name="ph:file" class="h-8 w-8"
                                                                    aria-hidden="true" />
                                                                {{ attachment?.file_name }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p v-else class="text-gray-700">{{ message?.message }}</p>
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
                                    <input ref="fileInput" type="file" multiple @change="handleFileChange"
                                        class="hidden" />
                                    <button type="button"
                                        class="flex items-center px-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-700 focus:ring-opacity-50"
                                        :disabled="state.isPageLoading" @click="triggerFileInput">
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
                <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
                    :title="$t('citizens.documents.upgradeStorage')"
                    :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
                    @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import pusher from '@/services/pusher'
import { messageService } from '@/components/api/MessageService'
import { useUserStore } from '@/store/user'
import { useEmployeeStore } from '@/store/employee'
import type { ChattedUser, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatTimeToReadable } = useDatetimeFormatter()
const employeeStore = useEmployeeStore() as any
const userStore = useUserStore() as any
const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid
const scrollableChatHistory = ref<HTMLElement | null>(null)
let currentPage = 1
let scrollHeight = 0
const fileInput = ref(null) as any
const files = ref<File[]>([])

const state = reactive({
    chattedUsers: [] as ChattedUser[],
    error: {} as Error,
    isLastPage: false,
    isChatLoading: false,
    isPageLoading: false,
    message: '',
    messages: [] as any,
    modal: {
        isUpgradeStorageOpen: false
    },
})

onMounted(() => {
    const channel = pusher.subscribe('citizenone.' + userStore.getUser?.id)
    channel.bind('chat-message', (response: any) => {
        state.messages.push(response?.data)
        scrollToBottom()
        fetchChats()
    })
    fetchChats()
    fetchChatHistory()
    scrollHeight = scrollableChatHistory.value?.scrollHeight ?? 0
})

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

async function fetchChats() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await messageService.fetchChats()
        if (response) {
            console.log('response', response)
            // state.chattedUsers = response?.data
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
            page: currentPage,
            chat_uuid: chatUuid,
        }
        const response = await messageService.fetchChatHistory(params)
        if (response.data) {
            console.log('response.data', response.data)
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
                fetchChats()
                scrollToBottom()
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
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

const triggerFileInput = () => {
    fileInput.value?.click()
}

const handleFileChange = (event: any) => {
    uploadFiles(event.target.files)
}

const uploadFiles = async (files: any) => {
    state.isPageLoading = true
    if (files.length > 0) {
        try {
            const params = new FormData()
            params.append('receiver_uuid', receiverUuid as any)
            for (let i = 0; i < files.length; i++) {
                params.append('file[]', files[i])
            }
            const response = await messageService.sendMessage(params)
            if (response) {
                state.messages.push(response?.data)
                fetchChats()
                scrollToBottom()
                fileInput.value.value = ''
            }
        } catch (error: any) {
            state.error = error
            if (error?.message === 'You do not have enough storage space to upload new files.') {
                state.modal.isUpgradeStorageOpen = true
            } else if (error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.') {
                state.modal.isUpgradeStorageOpen = true
            }
        }
    }
    state.isPageLoading = false
}

function isImageFile(filename: string) {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i;
    return imageExtensions.test(filename);
}

async function openExternalFile(attachment: any) {
    await navigateTo(attachment?.file, {
        external: true,
        open: {
            target: '_blank',
        }
    })
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