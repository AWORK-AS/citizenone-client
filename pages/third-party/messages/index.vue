<template>
    <div>
        <NuxtLayout name="third-party">

            <Head>
                <Title>{{ $t('messages.messages') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #breadcrumb>
                <BreadcrumbThirdParty>
                    <template #custom-link>
                        <div class="flex items-center">
                            <Icon name="heroicons:chevron-right" class="size-3 shrink-0 text-gray-400"
                                aria-hidden="true" />
                            <button @click="navigateTo('/third-party/messages')"
                                class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                                {{ $t('messages.messages') }}
                            </button>
                        </div>
                    </template>
                </BreadcrumbThirdParty>
            </template>

            <template #header>{{ $t('messages.messages') }}</template>

            <div class="space-y-5">
                <Alert type="danger" :text="state?.error?.message"
                    v-if="state.error?.message && state.error.message.length > 0" />
                <LoadingSpinner :isActive="state.isPageLoading">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4" v-if="state.chats?.data?.length > 0">
                        <div class="md:col-span-5 xl:col-span-4 bg-white rounded-md overflow-y-auto pane-height">
                            <ModulesThirdPartyMessagesChats :chats="state.chats" />
                        </div>
                        <div
                            class="hidden md:flex md:col-span-7 xl:col-span-8 bg-white rounded-md items-center justify-center">
                            <div class="text-center space-y-2 text-gray-500">
                                <Icon name="ph:chats-circle" class="w-12 h-12 mx-auto text-primary" aria-hidden="true" />
                                <p class="text-sm">{{ $t('messages.welcomeDescription') }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-else class="mx-auto max-w-lg py-20">
                        <div class="text-center space-y-3 bg-white rounded-md px-8 py-12">
                            <Icon name="ph:chats-circle" class="w-14 h-14 mx-auto text-primary" aria-hidden="true" />
                            <h3 class="text-lg font-semibold">
                                {{ $t('messages.welcomeToChat') }}
                            </h3>
                            <p class="text-sm text-gray-600">
                                {{ $t('messages.startConversationWithOrganization') }}.
                            </p>
                            <FormButton buttonStyle="primary" class="w-full"
                                @click="state.modal.isNewChatOpen = true">
                                {{ $t('messages.newMessage') }}
                            </FormButton>
                        </div>
                    </div>
                </LoadingSpinner>
                <ModulesThirdPartyMessagesModalNewChat :isModalOpen="state.modal.isNewChatOpen"
                    @close="state.modal.isNewChatOpen = false" />
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/third-party/MessageService'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    chats: [] as any,
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isNewChatOpen: false
    },
})

onMounted(() => {
    fetchChats()
})

async function fetchChats() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await messageService.fetchChats()
        if (response) {
            state.chats = response
        }
    } catch (error: any) {
        state.error = { message: error.message }
    }
    state.isPageLoading = false
}
</script>
