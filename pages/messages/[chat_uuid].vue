<template>
    <div class="relative w-full h-full flex flex-col overflow-hidden">

        <Alert type="danger" :text="state?.error?.message" v-if="state.error?.message && state.error.message.length > 0"
            class="mb-3" />

        <!-- Loading overlay -->
        <div v-if="state.isChatHistoryDividerLoading"
            class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center pointer-events-none">
            <div class="w-10 h-10 border-b-2 border-gray-400 rounded-full animate-spin"></div>
        </div>

        <div class="flex flex-col flex-1 min-h-0">

            <!-- Chat Header -->
            <div class="flex items-center justify-between px-4 md:px-5 py-3.5 border-b border-gray-100 bg-white gap-2">
                <!-- Mobile Back Button -->
                <button
                    class="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    @click="navigateTo('/messages')" :title="$t('back')">
                    <Icon name="ph:arrow-left" class="w-5 h-5 text-gray-600" aria-hidden="true" />
                </button>

                <!-- Direct Chat Header -->
                <div v-if="state.chat?.data?.type === 'direct'" class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="relative">
                        <img :src="getChatHeaderAvatar()" alt="avatar" class="w-9 h-9 rounded-full object-cover" />
                    </div>
                    <div>
                        <h4 class="font-semibold text-sm text-gray-900">{{ getChatHeaderName() }}</h4>
                        <p class="text-xs text-gray-400 line-clamp-1">{{ state.chat?.data?.subject }}</p>
                    </div>
                </div>

                <!-- Group Chat Header -->
                <div v-if="state.chat?.data?.type === 'group'" class="flex items-center gap-3 flex-1 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="ph:users-three" class="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <div class="min-w-0">
                        <Tooltip :text="state.chat?.data?.name || chatGroupMembers(state.chat?.data)" position="bottom">
                            <h4 class="font-semibold text-sm text-gray-900 line-clamp-1">
                                {{ state.chat?.data?.name || chatGroupMembers(state.chat?.data) }}
                            </h4>
                        </Tooltip>
                        <p class="text-xs text-gray-400">
                            {{ state.chat?.data?.chat_members?.length || 0 }} {{ $t('messages.members') }}
                            <span v-if="state.chat?.data?.unread_messages > 0" class="ml-1 text-primary font-medium">
                                · {{ state.chat?.data?.unread_messages }} {{ $t('messages.unread') }}
                            </span>
                        </p>
                    </div>
                </div>

                <!-- Header Actions -->
                <div class="flex items-center gap-1">
                    <Tooltip :text="$t('messages.groupChat.editGroupName')" position="left"
                        v-if="state.chat?.data?.type === 'group'">
                        <button
                            class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                            @click="editGroupChatName()">
                            <Icon name="ph:pencil-simple" class="h-4 w-4 text-gray-500" aria-hidden="true" />
                        </button>
                    </Tooltip>
                    <Tooltip :text="$t('messages.groupChat.groupMembers')" position="left"
                        v-if="state.chat?.data?.type === 'group'">
                        <button
                            class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                            @click="state.modal.isManageGroupChatMembersOpen = true">
                            <Icon name="ph:users-three" class="h-5 w-5 text-gray-500" aria-hidden="true" />
                        </button>
                    </Tooltip>
                </div>
            </div>

            <!-- Messages Area -->
            <div class="flex-1 overflow-y-auto px-3 md:px-5 py-4 space-y-1" ref="scrollableChatHistory"
                @scroll="handleScroll" @click="state.openMessageMenuIndex = null">
                <!-- Load more indicator -->
                <div v-if="state.isLastPage && currentPage !== 1" class="text-center text-gray-400 text-xs py-2">
                    {{ $t('messages.allMessagesAreLoaded') }}
                </div>
                <div v-if="state.isChatHistoryLoading" class="text-center text-gray-400 text-xs py-2">
                    {{ $t('messages.loadingMessages') }}
                    <span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span><span
                        class="dot4">.</span><span class="dot5">.</span>
                </div>

                <!-- Messages -->
                <div v-for="(message, index) in state.messages" :key="index">

                    <!-- Date Divider -->
                    <div v-if="shouldShowDateDivider(index)" class="flex items-center gap-3 py-2 my-1">
                        <div class="flex-1 h-px bg-gray-200"></div>
                        <span class="text-xs text-gray-400 font-medium flex-shrink-0">{{
                            getMessageDateLabel(message?.created_at) }}</span>
                        <div class="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <!-- Sent Message (Right) -->
                    <div v-if="message?.sender?.id === userStore.getUser?.id"
                        class="flex flex-col items-end mb-3 group/msg">
                        <!-- Header: name + time + avatar -->
                        <div class="flex items-center gap-2 mb-1">
                            <p class="text-xs text-gray-500 font-medium">
                                {{ $t('messages.you') }}
                                <span class="text-gray-400 font-normal">{{
                                    formatMessageTime(message?.created_at) }}</span>
                            </p>
                            <img :src="message?.sender?.profile_image ?? '/img/avatars/user.svg'" alt="User"
                                class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                        </div>
                        <!-- Bubble row -->
                        <div class="mr-10 max-w-[85%] md:max-w-[70%] flex flex-col items-end gap-1">
                            <!-- Bubble with action button anchored to its left center -->
                            <div class="relative group/bubble">
                                <!-- Hover action buttons -->
                                <div
                                    class="hidden group-hover/msg:flex items-center gap-0.5 absolute right-full pr-2 top-1/2 -translate-y-1/2">
                                    <div class="relative">
                                        <button @click.stop="toggleMessageMenu(index)"
                                            class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                                            :title="$t('messages.actions.more')">
                                            <Icon name="ph:dots-three" class="h-4 w-4 text-gray-400"
                                                aria-hidden="true" />
                                        </button>
                                        <!-- Dropdown -->
                                        <div v-if="state.openMessageMenuIndex === index"
                                            class="absolute right-0 bottom-full mb-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                                            @click.stop>
                                            <button v-if="!(message?.chat_message_attachments?.length > 0)"
                                                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                @click="editChatMessage(index, message); state.openMessageMenuIndex = null">
                                                <Icon name="ph:pencil-simple" class="h-4 w-4 text-gray-400"
                                                    aria-hidden="true" />
                                                {{ $t('messages.actions.edit') }}
                                            </button>
                                            <button
                                                class="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                                @click="deleteChatConfirmation(index, message); state.openMessageMenuIndex = null">
                                                <Icon name="ph:trash" class="h-4 w-4 text-red-500" aria-hidden="true" />
                                                {{ $t('messages.actions.delete') }}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-secondary text-white px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm">
                                    <!-- Attachments -->
                                    <div v-if="message?.chat_message_attachments?.length > 0" class="space-y-2">
                                        <div v-for="(attachment, aIndex) in message?.chat_message_attachments"
                                            :key="aIndex">
                                            <img :src="attachment?.file_url" alt="Image"
                                                v-if="isImageFile(attachment?.file_name)"
                                                class="w-44 rounded-lg cursor-pointer hover:opacity-90"
                                                @click="downloadFile(attachment)" />
                                            <div v-else class="flex items-center gap-2 cursor-pointer hover:opacity-80"
                                                @click="downloadFile(attachment)">
                                                <Icon name="ph:file" class="h-7 w-7 flex-shrink-0" aria-hidden="true" />
                                                <span class="text-sm truncate max-w-[180px]">{{
                                                    attachment?.file_name }}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- Text -->
                                    <p v-else class="text-sm leading-relaxed"
                                        v-html="message?.message?.replace(/\n/g, '<br>')" />
                                </div>
                            </div>
                            <!-- Seen indicator -->
                            <ModulesUserMessagesTooltipSeenBy v-if="message?.receipts?.length > 0"
                                :receipts="message.receipts">
                                <div class="flex items-center gap-1">
                                    <span class="text-xs text-gray-400">{{ $t('messages.seen') }}</span>
                                    <div class="flex -space-x-1.5">
                                        <img v-for="(receipt, rIndex) in message.receipts.slice(0, 5)" :key="rIndex"
                                            :src="receipt?.user?.profile_image ?? '/img/avatars/user.svg'"
                                            class="w-4 h-4 rounded-full border border-white object-cover" />
                                    </div>
                                    <span v-if="message.receipts.length > 5" class="text-xs text-gray-400">+{{
                                        message.receipts.length - 5 }}</span>
                                </div>
                            </ModulesUserMessagesTooltipSeenBy>
                        </div>
                    </div>

                    <!-- Received Message (Left) -->
                    <div v-else class="flex flex-col items-start mb-3">
                        <!-- Header: avatar + name + time -->
                        <div class="flex items-center gap-2 mb-1">
                            <img :src="message?.sender?.profile_image ?? '/img/avatars/user.svg'" alt="User"
                                class="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            <p class="text-xs text-gray-500 font-medium">
                                {{ message?.sender?.firstname + ' ' + (message?.sender?.lastname ?? '') }}
                                <span class="text-gray-400 font-normal">{{
                                    formatMessageTime(message?.created_at) }}</span>
                            </p>
                        </div>
                        <!-- Bubble -->
                        <div class="max-w-[85%] md:max-w-[70%] ml-10">
                            <div class="bg-gray-100 text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
                                <!-- Attachments -->
                                <div v-if="message?.chat_message_attachments?.length > 0" class="space-y-2">
                                    <div v-for="(attachment, aIndex) in message?.chat_message_attachments"
                                        :key="aIndex">
                                        <img :src="attachment?.file_url" alt="Image"
                                            v-if="isImageFile(attachment?.file_name)"
                                            class="w-44 rounded-lg cursor-pointer hover:opacity-90"
                                            @click="downloadFile(attachment)" />
                                        <div v-else class="flex items-center gap-2 cursor-pointer hover:opacity-80"
                                            @click="downloadFile(attachment)">
                                            <Icon name="ph:file" class="h-7 w-7 flex-shrink-0 text-gray-500"
                                                aria-hidden="true" />
                                            <span class="text-sm truncate max-w-[180px]">{{
                                                attachment?.file_name }}</span>
                                        </div>
                                    </div>
                                </div>
                                <!-- Text -->
                                <p v-else class="text-sm leading-relaxed"
                                    v-html="message?.message?.replace(/\n/g, '<br>')" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Message Input -->
            <div class="flex-shrink-0 border-t border-gray-100 px-4 py-3 bg-white">
                <div class="flex items-stretch gap-2">
                    <!-- Attachment Button -->
                    <input ref="fileInput" type="file" multiple @change="handleFileChange" class="hidden" />
                    <button type="button"
                        class="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                        :disabled="state.isPageLoading" @click="triggerFileInput" :title="$t('messages.attachFile')">
                        <Icon name="ph:paperclip" class="w-5 h-5 text-gray-500" aria-hidden="true" />
                    </button>

                    <!-- Text Input -->
                    <textarea rows="1"
                        class="flex-1 h-10 px-4 bg-gray-100 rounded-md text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-primary/20 border-0 leading-10"
                        :placeholder="$t('messages.typeAMessage')" v-model="state.message"
                        @keydown.enter.exact.prevent="sendMessage" />

                    <!-- Send Button -->
                    <button type="button"
                        class="w-10 h-10 rounded-lg bg-secondary hover:bg-secondary-600 flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
                        @click="sendMessage" :disabled="state.isPageLoading || !state.message.trim()">
                        <Icon name="ph:paper-plane-tilt" class="w-4 h-4 text-white" aria-hidden="true" />
                    </button>
                </div>
            </div>

        </div>

        <!-- Modals -->
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
</template>

<script setup lang="ts">
import pusher from '@/services/pusher'
import moment from 'moment'
import { messageService } from '@/components/api/user/MessageService'
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { useI18n } from 'vue-i18n'
import { useAlert } from '@/composables/alert'
import { useUserStore } from '@/store/user'
import { saveAs } from 'file-saver'
import type { Error } from '@/types'

const { formatDateToReadable } = useDatetimeFormatter()
const { t } = useI18n()
const { successAlert } = useAlert()
const userStore = useUserStore() as any
const router = useRouter()
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid
const scrollableChatHistory = ref<HTMLElement | null>(null)
let currentPage = 1
let scrollHeight = 0
const fileInput = ref(null) as any
const files = ref<File[]>([])

const fetchChats = inject('fetchChats') as any
const updateChatName = inject('updateChatName') as any

const state = reactive({
    chat: [] as any,
    error: {} as Error,
    isLastPage: false,
    isChatHistoryDividerLoading: false,
    isChatHistoryLoading: false,
    isPageLoading: false,
    message: '',
    messages: [] as any,
    openMessageMenuIndex: null as number | null,
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
    })
    fetchChat()
    fetchChatHistory().then(autoFillChatHistory)
    readChat()
    scrollHeight = scrollableChatHistory.value?.scrollHeight ?? 0
})

function toggleMessageMenu(index: number) {
    state.openMessageMenuIndex = state.openMessageMenuIndex === index ? null : index
}

function formatMessageTime(datetime: string): string {
    return moment(datetime).format('hh:mm A')
}

function getMessageDateLabel(datetime: string): string {
    const date = moment(datetime).startOf('day')
    const today = moment().startOf('day')
    const yesterday = moment().subtract(1, 'days').startOf('day')
    if (date.isSame(today)) return t('messages.today')
    if (date.isSame(yesterday)) return t('messages.yesterday')
    return formatDateToReadable(datetime)
}

function shouldShowDateDivider(index: number): boolean {
    if (index === 0) return true
    const currentDate = moment(state.messages[index]?.created_at).format('YYYY-MM-DD')
    const prevDate = moment(state.messages[index - 1]?.created_at).format('YYYY-MM-DD')
    return currentDate !== prevDate
}

function getChatHeaderName(): string {
    const members = excludeCurrentUserFromChatMembers(state.chat?.data?.chat_members || [])
    if (members.length > 0) {
        return `${members[0]?.user?.firstname} ${members[0]?.user?.lastname ?? ''}`
    }
    const self = chatToSelf(state.chat?.data?.chat_members || [])
    return self[0] ? `${self[0]?.user?.firstname} ${self[0]?.user?.lastname ?? ''}` : ''
}

function getChatHeaderAvatar(): string {
    const members = excludeCurrentUserFromChatMembers(state.chat?.data?.chat_members || [])
    if (members.length > 0) return members[0]?.user?.profile_image ?? '/img/avatars/user.svg'
    const self = chatToSelf(state.chat?.data?.chat_members || [])
    return self[0]?.user?.profile_image ?? '/img/avatars/user.svg'
}

function closeUpgradeStorageModal() {
    state.modal.isUpgradeStorageOpen = false
    state.error = {}
}

function refreshChatDetails(chatDetails: any) {
    fetchChat()
    updateChatName?.(chatUuid, chatDetails?.name)
}

async function fetchChat() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await messageService.fetchChat(chatUuid)
        if (response) state.chat = response
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

async function fetchChatHistory() {
    state.error = {}
    state.isChatHistoryLoading = true
    try {
        const params = { page: currentPage, chat_uuid: chatUuid }
        const response = await messageService.fetchChatHistory(params)
        if (response.data) {
            response?.data?.forEach((chat: any) => state.messages.unshift(chat))
            if (response.links.next === null) state.isLastPage = true
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isChatHistoryLoading = false
}

async function autoFillChatHistory() {
    await nextTick()
    while (!state.isLastPage && scrollableChatHistory.value) {
        const el = scrollableChatHistory.value
        if (el.scrollHeight > el.clientHeight) break
        currentPage++
        await fetchChatHistory()
        await nextTick()
    }
    scrollToBottom()
}

function editGroupChatName() {
    state.selectedChat = state.chat?.data
    state.modal.isEditGroupNameOpen = true
}

async function readChat() {
    state.error = {}
    state.isChatHistoryDividerLoading = true
    try {
        const params = { chat_uuid: chatUuid }
        await messageService.readChat(params)
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isChatHistoryDividerLoading = false
}

async function sendMessage() {
    if (state.message.trim() !== '') {
        state.isChatHistoryDividerLoading = true
        try {
            const params = { message: state.message, chat_uuid: chatUuid }
            const response = await messageService.sendMessageViaChatUuid(params)
            if (response) {
                fetchChats?.()
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
                    scrollableChatHistory.value.scrollTop = (newScrollHeight - previousScrollHeight) + currentScrollTop
                }
            })
        }
    }
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileChange = (event: any) => uploadFiles(event.target.files)

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
                fetchChats?.()
                scrollToBottom()
                fileInput.value.value = ''
            }
        } catch (error: any) {
            state.error = error
            if (
                error?.message === 'You do not have enough storage space to upload new files.' ||
                error?.message === 'Du har ikke nok lagerplads til at uploade nye filer.'
            ) {
                state.modal.isUpgradeStorageOpen = true
            }
        }
    }
    state.isChatHistoryDividerLoading = false
}

function isImageFile(filename: string) {
    return /\.(jpg|jpeg|png|gif|bmp|svg|webp)$/i.test(filename)
}

async function downloadFile(attachment: any) {
    state.error = {}
    state.isChatHistoryDividerLoading = true
    try {
        const response = await messageService.downloadAttachment(attachment?.uuid)
        if (response) saveAs(response, attachment?.file_name)
    } catch (error: any) {
        state.error = error
    }
    state.isChatHistoryDividerLoading = false
}

function chatToSelf(chatMembers: any) {
    return chatMembers.filter((m: any) => m.user_id === userStore.getUser?.id)
}

function excludeCurrentUserFromChatMembers(chatMembers: any) {
    return chatMembers.filter((m: any) => m.user_id !== userStore.getUser?.id)
}

function chatGroupMembers(chat: any) {
    const members = excludeCurrentUserFromChatMembers(chat?.chat_members || [])
        .map((m: any) => `${m?.user?.firstname} ${m?.user?.lastname ?? ''}`)
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
        const uuid = state.selectedChat?.uuid
        const response = await messageService.deleteChatMessage(uuid)
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

<style scoped>
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
