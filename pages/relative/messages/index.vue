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
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4" v-if="state.chats?.data?.length > 0">
                        <div class="md:col-span-5 xl:col-span-4 bg-white rounded-md overflow-y-auto"
                            style="height: 80vh;">
                            <ModulesRelativeMessagesChats :chats="state.chats" />
                        </div>
                    </div>
                    <div v-else class="mx-auto max-w-lg py-20 text-center space-y-3">
                        <h3 class="text-lg font-semibold">
                            {{ $t('messages.noMessagesYet') }}.
                        </h3>
                        <p>
                            {{ $t('messages.looksLikeYouHaventInitiatedAConversation') }}.
                        </p>
                        <FormButton buttonStyle="primary" class="w-full" @click="state.modal.isNewChatOpen = true">
                            {{ $t('messages.startTheConversation') }}
                        </FormButton>
                    </div>
                </LoadingSpinner>
            </div>
            <ModulesRelativeMessagesModalNewChat :isModalOpen="state.modal.isNewChatOpen"
                @close="state.modal.isNewChatOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { chatService } from '@/components/api/relative/ChatService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const breadcrumbLinks = [
    {
        name: 'messages.messages',
        translate: true,
        href: '/relative/messages',
    },
]

const state = reactive({
    chats: [] as any,
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isNewChatOpen: false,
    },
})

onMounted(() => {
    fetchChats()
})

async function fetchChats() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await chatService.fetchChats()
        if (response) {
            state.chats = response
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}
</script>
