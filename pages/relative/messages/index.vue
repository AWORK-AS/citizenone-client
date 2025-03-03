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
                    <div v-else class="mx-auto max-w-lg py-20">
                        <div v-if="!state.showStartConversation" class="text-center space-y-3">
                            <h3 class="text-lg font-semibold">
                                {{ $t('messages.noMessagesYet') }}.
                            </h3>
                            <p>
                                {{ $t('messages.looksLikeYouHaventInitiatedAConversation') }}.
                            </p>
                            <FormButton buttonStyle="primary" class="w-full rounded-md"
                                @click="state.showStartConversation = true">
                                {{ $t('messages.startTheConversation') }}
                            </FormButton>
                        </div>
                        <div v-else>
                            <form @submit.prevent="sendMessage">
                                <div class="space-y-3">
                                    <h3 class="text-base font-semibold text-primary">
                                        {{ $t('messages.startTheConversation') }}
                                    </h3>
                                    <div class="space-y-1">
                                        <FormLabel for="message" :label="$t('messages.users')" />
                                        <FormSelectMultiple id="receivers" :options="state.options.receivers"
                                            v-model="state.formChat.receivers"
                                            v-if="userStore.getUser?.company?.group_chat_enabled" />
                                        <FormSelect id="receivers" :options="state.options.receivers"
                                            v-model="state.formChat.receivers" v-else />
                                        <FormError :error="v$?.formChat?.receivers?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.receiver_uuid?.[0]" />
                                    </div>
                                    <div class="space-y-1">
                                        <FormLabel for="message" :label="$t('messages.message')" />
                                        <FormTextField id="message" name="message" :placeholder="$t('messages.message')"
                                            v-model="state.formChat.message" />
                                        <FormError :error="v$?.formChat?.message?.$errors[0]?.$message.toString()" />
                                        <FormError :error="state?.error?.errors?.message?.[0]" />
                                    </div>
                                </div>
                                <div class="mt-6">
                                    <FormButton type="submit" buttonStyle="primary" class="w-full rounded-md">
                                        {{ $t('messages.send') }}
                                    </FormButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </LoadingSpinner>
            </div>
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import pusher from '@/services/pusher'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { messageService } from '@/components/api/relative/MessageService'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const router = useRouter()
const userStore = useUserStore() as any
const chatUuid = router?.currentRoute?.value?.params?.chat_uuid
const { t } = useI18n()
const breadcrumbLinks = [
    {
        name: 'messages.messages',
        translate: true,
        href: '/messages',
    },
]

const state = reactive({
    chats: [] as any,
    error: {} as Error,
    formChat: {
        message: '',
        receivers: [],
    },
    isPageLoading: false,
    showStartConversation: false,
    options: {
        receivers: []
    }
})

onMounted(() => {
    fetchAllAvailableChatUsers()
    const channel = pusher.subscribe('citizenone.' + chatUuid)
    channel.bind('chat-message', () => {
        fetchChats()
    })
    fetchChats()
})

const rules = computed(() => {
    return {
        formChat: {
            message: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
            receivers: {
                required: helpers.withMessage(`${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

async function fetchAllAvailableChatUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await messageService.getAllAvailableUsers()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname + " (" + user?.role + ")",
                })
            )
            state.options.receivers = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

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

async function sendMessage() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                message: state.formChat.message,
                receiver_uuid: userStore.getUser?.company?.group_chat_enabled ?
                    state.formChat.receivers :
                    [state.formChat.receivers]
            }
            const response = await messageService.sendMessageViaReceiverUuid(params)
            if (response) {
                const chatUuid = response?.data?.chat?.uuid
                navigateTo(`/citizen/messages/${chatUuid}`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>