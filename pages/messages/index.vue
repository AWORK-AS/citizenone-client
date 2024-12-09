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
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-4"
                        v-if="state.chattedUsers?.length > 0">
                        <div class="md:col-span-5 xl:col-span-4 bg-white rounded-md p-6 overflow-y-auto"
                            style="height: 80vh;">
                            <ul>
                                <li class="flex items-center space-x-4 border-b border-gray-100 px-1 py-3 cursor-pointer"
                                    v-for="(chattedUser, index) in state.chattedUsers" :key="index"
                                    @click="messageEmployee(chattedUser)">
                                    <img :src="chattedUser?.profile_image ?? '/img/avatars/user.svg'" alt="Item 1"
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
                                            v-model="state.formChat.receivers" />
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
import { userService } from '@/components/api/UserService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { messageService } from '@/components/api/MessageService'
import { useEmployeeStore } from '@/store/employee'
import { useUserStore } from '@/store/user'
import { useI18n } from "vue-i18n"
import type { ChattedUser, Error } from '@/types'

const runtimeConfig = useRuntimeConfig()
const employeeStore = useEmployeeStore() as any
const userStore = useUserStore() as any
const { t } = useI18n()

const state = reactive({
    chattedUsers: [] as ChattedUser[],
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
    fetchAllUsers()
    const channel = pusher.subscribe('citizenone.' + userStore.getUser?.id)
    // channel.bind('chat-message', (response: any) => {
    //     fetchChattedUsers()
    // })
    // fetchChattedUsers()
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

async function fetchAllUsers() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await userService.getAllUsers()
        if (response.data) {
            let options: any = []
            response.data.forEach(
                (user: any) => options.push({
                    value: user?.uuid,
                    label: user?.firstname + " " + user?.lastname,
                })
            )
            state.options.receivers = options
        }
    } catch (error: any) {
        state.error = error
    }
    state.isPageLoading = false
}

// async function fetchChattedUsers() {
//     state.error = {}
//     state.isPageLoading = true
//     try {
//         const response = await messageService.fetchChattedUsers()
//         if (response) {
//             state.chattedUsers = response?.data
//         }
//     } catch (error: any) {
//         state.error = { message: error.message }
//     }
//     state.isPageLoading = false
// }

async function sendMessage() {
    v$.value.$validate()
    if (!v$.value.$error) {
        state.isPageLoading = true
        try {
            const params = {
                message: state.formChat.message,
                receiver_uuid: state.formChat.receivers
            }
            const response = await messageService.sendMessageViaReceiverUuid(params)
            if (response) {
                const chatUuid = response?.data?.chat?.uuid
                navigateTo(`/messages/${chatUuid}`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}

function messageEmployee(employee: any) {
    employeeStore.setSelectedEmployee(employee)
    navigateTo(`/messages/${employee.uuid}`)
}
</script>