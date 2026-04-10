<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('messages.messages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <!-- Two-Panel Chat Layout -->
            <div class="flex bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                style="height: 82vh;">

                <!-- Left Sidebar -->
                <div
                    :class="route.params.chat_uuid ? 'hidden md:flex md:w-72 flex-shrink-0 border-r border-gray-100 flex-col relative overflow-hidden' : 'w-full md:w-72 flex-shrink-0 md:border-r border-gray-100 flex flex-col relative overflow-hidden'">
                    <div :class="state.isPageLoading ? 'opacity-20 pointer-events-none' : ''"
                        class="flex flex-col h-full">
                        <ModulesUserMessagesChats :chats="state.chats"
                            :activeChatUuid="(route.params.chat_uuid as string) ?? ''"
                            @loadMoreMessages="fetchAdditionalChats" />
                    </div>
                    <div v-if="state.isPageLoading"
                        class="absolute inset-0 bg-white/60 z-10 flex items-center justify-center pointer-events-none">
                        <div class="w-8 h-8 border-b-2 border-gray-400 rounded-full animate-spin"></div>
                    </div>
                </div>

                <!-- Right Panel -->
                <div :class="route.params.chat_uuid ? 'flex' : 'hidden md:flex'"
                    class="flex-1 flex-col overflow-hidden h-full">
                    <NuxtPage />
                </div>

            </div>

        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/user/MessageService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
let currentTablePage = 1

provide('fetchChats', fetchChats)
provide('updateChatName', updateChatName)

const state = reactive({
    chats: [] as any,
    error: {} as Error,
    isPageLoading: false,
})

onMounted(() => {
    fetchChats()
})

async function fetchChats() {
    state.error = {}
    state.isPageLoading = true
    try {
        const allData: any[] = []
        let lastResponse: any = null
        for (let page = 1; page <= currentTablePage; page++) {
            const response = await messageService.fetchChats({ page })
            if (response?.data) {
                allData.push(...response.data)
                lastResponse = response
            }
        }
        if (lastResponse) {
            state.chats = { ...lastResponse, data: allData }
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

async function fetchAdditionalChats() {
    state.error = {}
    state.isPageLoading = true
    try {
        currentTablePage = currentTablePage + 1
        const params = { page: currentTablePage }
        const response = await messageService.fetchChats(params)
        if (response) {
            state.chats.data?.push(...response?.data)
            if (response?.meta) state.chats.meta = response?.meta
            if (response?.links) state.chats.links = response?.links
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}

function updateChatName(chatUuid: string, name: string) {
    const index = state.chats?.data?.findIndex((chat: any) => chat.uuid === chatUuid)
    if (index >= 0) {
        state.chats.data[index].name = name
    }
}
</script>
