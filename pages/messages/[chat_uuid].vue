<template>
    <div>
        <NuxtLayout name="user">

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

                <ul>
                    <li v-for="file in files" :key="file.name">{{ file.name }}</li>
                </ul>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4">
                    <LoadingSpinner :isActive="state.isChatLoading"
                        class="md:col-span-5 xl:col-span-4 bg-white rounded-md overflow-y-auto" style="height: 80vh;">
                        <ModulesUserMessagesChats :chats="state.chats" @loadMoreMessages="fetchAdditionalChats" />
                    </LoadingSpinner>
                    <LoadingSpinner :isActive="state.isChatHistoryDividerLoading"
                        class="md:col-span-7 xl:col-span-8 bg-white rounded-md pb-6">
                        <div class="px-6 py-3 shadow-sm">
                            <div>
                                <div v-if="state.chat?.data?.type === 'direct'">
                                    <div class="h-10">
                                        <div
                                            v-if="excludeCurrentUserFromChatMembers(state.chat?.data?.chat_members)?.length > 0">
                                            <div v-for="(chatMember, index) in excludeCurrentUserFromChatMembers(state.chat?.data?.chat_members)"
                                                :index="index" class="flex items-center space-x-4">
                                                <img :src="chatMember?.user?.profile_image ?? '/img/avatars/user.svg'"
                                                    alt="Item 1" class="w-10 h-10 rounded-full object-cover">
                                                <div>
                                                    <h4 class="font-semibold text-sm">
                                                        {{ chatMember?.user?.firstname + " " +
                                                            (chatMember?.user?.lastname ?? '') }}
                                                    </h4>
                                                    <p class="text-xs line-clamp-1">
                                                        {{ state.chat?.data?.subject }}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else class="flex items-center space-x-4">
                                            <img :src="chatToSelf(state.chat?.data?.chat_members)[0]?.user?.profile_image ?? '/img/avatars/user.svg'"
                                                alt="Item 1" class="w-10 h-10 rounded-full object-cover">
                                            <div>
                                                <h4 class="font-semibold text-sm">
                                                    {{ chatToSelf(state.chat?.data?.chat_members)[0]?.user?.firstname +
                                                        " " +
                                                        (chatToSelf(state.chat?.data?.chat_members)[0]?.user?.lastname ??
                                                            '') }}
                                                </h4>
                                                <p class="text-xs line-clamp-1">
                                                    {{ state.chat?.data?.subject }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="state.chat?.data?.type === 'group'">
                                    <div class="h-10 w-full grid grid-cols-12 items-center">
                                        <div class="col-span-1">
                                            <div class="relative">
                                                <img src="/img/avatars/user.svg" alt="Item 1"
                                                    class="w-7 h-7 rounded-full object-cover relative top-1.5 left-1">
                                                <img src="/img/avatars/user.svg" alt="Item 1"
                                                    class="w-7 h-7 rounded-full object-cover absolute -top-2.5 left-4">
                                                <img src="/img/avatars/user.svg" alt="Item 1"
                                                    class="w-7 h-7 rounded-full object-cover absolute top-2.5 left-7">
                                            </div>
                                        </div>
                                        <div class="col-span-11 flex items-center">
                                            <div class="w-full flex items-center justify-between">
                                                <div>
                                                    <Tooltip :text="state.chat?.data?.name"
                                                        v-if="state.chat?.data?.name">
                                                        <h4 class="font-semibold text-sm" v-if="state.chat?.data?.name">
                                                            {{ state.chat?.data?.name }}
                                                        </h4>
                                                    </Tooltip>
                                                    <Tooltip :text="`${chatGroupMembers(state.chat?.data)}.`" v-else>
                                                        <h4 class="font-semibold text-sm line-clamp-1">
                                                            {{ chatGroupMembers(state.chat?.data) }}.
                                                        </h4>
                                                    </Tooltip>
                                                    <p class="text-xs line-clamp-1">
                                                        {{ state.chat?.data?.subject }}
                                                    </p>
                                                    <p class="text-xxs" v-if="state.chat?.data?.unread_messages > 0">
                                                        {{ state.chat?.data?.unread_messages }}
                                                        <span class="lowercase">
                                                            {{ $t('messages.unreadMessages') }}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div class="flex items-center space-x-1">
                                                    <Tooltip :text="$t('messages.groupChat.editGroupName')">
                                                        <button v-if="state.chat?.data?.type === 'group'"
                                                            @click="editGroupChatName()">
                                                            <Icon name="ph:pencil-simple"
                                                                class="h-5 w-5 text-primary hover:text-primary-700"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </Tooltip>
                                                    <Tooltip :text="$t('messages.groupChat.groupMembers')">
                                                        <button v-if="state.chat?.data?.type === 'group'"
                                                            @click="state.modal.isManageGroupChatMembersOpen = true">
                                                            <Icon name="ph:users-three"
                                                                class="h-6 w-6 text-primary hover:text-primary-700"
                                                                aria-hidden="true" />
                                                        </button>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
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
                                    <!-- Message (Right) -->
                                    <div v-if="message?.sender?.id === userStore.getUser?.id">
                                        <div class="flex items-start justify-end mb-4">
                                            <div class="mr-2">
                                                <Tooltip position="left"
                                                    :text="formatDateTimeToReadable(message?.created_at)">
                                                    <div class="bg-secondary text-white p-3 rounded-lg">
                                                        <div v-if="message?.chat_message_attachments?.length > 0"
                                                            class="space-y-3">
                                                            <div v-for="(attachment, index) in message?.chat_message_attachments"
                                                                :key="index">
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
                                                        <p v-else class="text-sm"
                                                            v-html="message?.message?.replace(/\n/g, '<br>')" />
                                                        <div class="mt-2 flex justify-end gap-x-1">
                                                            <Tooltip position="top" :text="$t('messages.actions.edit')"
                                                                v-if="!(message?.chat_message_attachments?.length > 0)">
                                                                <button @click="editChatMessage(index, message)">
                                                                    <Icon name="ph:pencil-simple" class="h-4 w-4"
                                                                        aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
                                                            <Tooltip position="top"
                                                                :text="$t('messages.actions.delete')">
                                                                <button @click="deleteChatConfirmation(index, message)">
                                                                    <Icon name="ph:trash" class="h-4 w-4"
                                                                        aria-hidden="true" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                    <p class="text-xs text-gray-500 mt-1"
                                                        v-if="index === state.messages.length - 1 && message?.receipt?.created_at">
                                                        {{ $t('messages.seen') }}
                                                        {{ formatDateTimeToReadable(message?.receipt?.created_at) }}
                                                    </p>
                                                </Tooltip>
                                            </div>
                                            <div class="flex-shrink-0 flex items-center">
                                                <img :src="message?.sender?.profile_image ?? '/img/avatars/user.svg'"
                                                    alt="User" class="w-10 h-10 rounded-full object-cover"
                                                    v-if="index === 0 || message?.sender?.id !== state.messages[index - 1]?.sender?.id">
                                                <div v-else class="mr-10"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Message (Left) -->
                                    <div v-else>
                                        <p class="text-xs ml-12"
                                            v-if="index === 0 || message?.sender?.id !== state.messages[index - 1]?.sender?.id">
                                            {{ message?.sender?.firstname + " " + (message?.sender?.lastname ?? '') }}
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
                                                        <div v-if="message?.chat_message_attachments?.length > 0"
                                                            class="space-y-3">
                                                            <div v-for="(attachment, index) in message?.chat_message_attachments"
                                                                :key="index">
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
                                                        <p v-else class="text-gray-700 text-sm"
                                                            v-html="message?.message?.replace(/\n/g, '<br>')" />
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
                                <textarea type="text" rows="1"
                                    class="text-sm flex-1 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    placeholder="Type a message..." v-model="state.message" />
                                <button type="button"
                                    class="px-4 py-3 bg-secondary text-white rounded-md hover:bg-secondary-600 focus:outline-none focus:ring-1 focus:ring-primary-700 focus:ring-opacity-50"
                                    @click="sendMessage" :disabled="state.isPageLoading">
                                    {{ $t('messages.send') }}
                                </button>
                            </div>
                        </div>
                    </LoadingSpinner>
                </div>
                <ModulesUserMessagesGroupChatModalEditName :isModalOpen="state.modal.isEditGroupNameOpen"
                    :selectedChat="state.selectedChat" @close="state.modal.isEditGroupNameOpen = false"
                    @refreshChatDetails="refreshChatDetails" />
                <ModulesUserMessagesGroupChatModalMembers :isModalOpen="state.modal.isManageGroupChatMembersOpen"
                    @close="state.modal.isManageGroupChatMembersOpen = false" @refreshChat="fetchChat" />
                <ModulesUserMessagesModalEditMessage :isModalOpen="state.modal.isEditChatMessageOpen"
                    :selectedChat="state.selectedChat" @close="state.modal.isEditChatMessageOpen = false"
                    @updateMessage="updateMessage" />
                <DialogConfirmation :isModalOpen="state.modal.isUpgradeStorageOpen"
                    :title="$t('citizens.documents.upgradeStorage')"
                    :message="state.error?.message + ' ' + $t('citizens.documents.confirmation.upgradeStorageConfirmation') + '?'"
                    @close="closeUpgradeStorageModal" @confirm="navigateTo(`/storage/upgrade`)" />
                <DialogConfirmation :isModalOpen="state.modal.isDeleteConfirmationOpen"
                    :message="$t('messages.confirmation.deleteMessageConfirmation') + '?'"
                    @close="state.modal.isDeleteConfirmationOpen = false" @confirm="deleteChatMessage" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import pusher from '@/services/pusher'
import { messageService } from '@/components/api/user/MessageService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from "vue-i18n"
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { successAlert } = useAlert()
const userStore = useUserStore() as any
const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid
const currentRoute = router?.currentRoute?.value?.name
const scrollableChatHistory = ref<HTMLElement | null>(null)
let currentPage = 1
let scrollHeight = 0
let currentTablePage = 1
const fileInput = ref(null) as any
const files = ref<File[]>([])
const breadcrumbLinks = [
    {
        name: 'messages.messages',
        translate: true,
        href: '/messages',
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
    modal: {
        isDeleteConfirmationOpen: false,
        isEditChatMessageOpen: false,
        isEditGroupNameOpen: false,
        isManageGroupChatMembersOpen: false,
        isUpgradeStorageOpen: false
    },
    selectedChat: {} as any,
    selectedChatIndex: '',
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
    readChat()
    scrollHeight = scrollableChatHistory.value?.scrollHeight ?? 0
})

// window.setInterval(() => {
//     if (currentRoute === 'messages-chat_uuid') {
//         fetchChats()
//     }
// }, 10000)

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

function refreshChatDetails() {
    fetchChat()
    fetchChats()
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
        const params = {
            page: currentTablePage
        }
        const response = await messageService.fetchChats(params)
        if (response) {
            state.chats = response
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isChatLoading = false
}

async function fetchAdditionalChats() {
    state.error = {}
    state.isPageLoading = true
    try {
        currentTablePage = currentTablePage + 1
        const params = {
            page: currentTablePage
        }
        const response = await messageService.fetchChats(params)
        if (response) {
            state.chats.data?.push(...response?.data)
            if (response?.meta) {
                state.chats.meta = response?.meta
            }
            if (response?.links) {
                state.chats.links = response?.links
            }
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
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

function editGroupChatName() {
    state.selectedChat = state.chat?.data
    state.modal.isEditGroupNameOpen = true
}

async function readChat() {
    state.error = {}
    state.isChatHistoryDividerLoading = true
    try {
        const params = {
            chat_uuid: chatUuid,
        }
        const response = await messageService.readChat(params)
        if (response) {
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isChatHistoryDividerLoading = false
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

function chatToSelf(chatMembers: any) {
    return chatMembers.filter((chatMember: any) => chatMember.user_id === userStore.getUser?.id)
}

function excludeCurrentUserFromChatMembers(chatMembers: any) {
    return chatMembers.filter((chatMember: any) => chatMember.user_id !== userStore.getUser?.id)
}

function chatGroupMembers(chat: any) {
    const members = excludeCurrentUserFromChatMembers(chat?.chat_members || [])
        .map((chatMember: any) => `${chatMember?.user?.firstname} ${chatMember?.user?.lastname ?? ''}`)

    if (members.length === 0) return ''

    if (members.length <= 3) return members.join(', ')

    const remaining = members.length - 1
    return `${members[0]}, ${members[1]}, ${t('messages.and')?.toLowerCase()} ${remaining} ${t('messages.more')?.toLowerCase()}`
}

function editChatMessage(index: any, message: any) {
    state.selectedChatIndex = index
    state.selectedChat = message
    state.modal.isEditChatMessageOpen = true
}

function updateMessage(message: any) {
    state.messages[state.selectedChatIndex].message = message
}

function deleteChatConfirmation(index: any, message: any) {
    state.selectedChatIndex = index
    state.selectedChat = message
    state.modal.isDeleteConfirmationOpen = true
}

async function deleteChatMessage() {
    state.error = {}
    state.isChatHistoryDividerLoading = true
    try {
        const chatIndex = state.selectedChatIndex as any
        const chatUuid = state.selectedChat?.uuid
        const response = await messageService.deleteChatMessage(chatUuid)
        if (response?.message === 'Success.' || response?.message === 'Succes.') {
            successAlert(`${t('alert.success')}!`, `${t('messages.alert.messageSuccessfullyDeleted')}.`)
            if (chatIndex !== undefined && chatIndex !== -1) {
                state.messages.splice(chatIndex, 1)
            }
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