<template>
    <div>
        <Modal size="sm" :title="$t('messages.message')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="sendMessage">
                        <div class="space-y-3">
                            <h3 class="text-base font-semibold text-primary">
                                {{ $t('messages.startTheConversation') }}
                            </h3>
                            <div class="space-y-1">
                                <FormLabel for="receivers" :label="$t('messages.users')" />
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
                        <div class="mt-6 mb-2">
                            <FormButton type="submit" buttonStyle="primary" class="w-full rounded-md">
                                {{ $t('messages.send') }}
                            </FormButton>
                        </div>
                    </form>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/user/MessageService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'
import { userService } from '@/components/api/user/UserService'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { t } = useI18n()
const userStore = useUserStore() as any
const router = useRouter()
const userUuid = router?.currentRoute?.value?.query?.user_uuid

const state = reactive({
    error: {} as Error,
    formChat: {
        message: '',
        receivers: [] as any,
    },
    isPageLoading: false,
    options: {
        receivers: []
    }
})

onMounted(() => {
    fetchAllAvailableChatUsers()
    if (userUuid) {
        state.formChat.receivers.push(userUuid)
    }
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

function closeModal() {
    emit('close')
}

async function fetchAllAvailableChatUsers() {
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
                navigateTo(`/messages/${chatUuid}`)
                closeModal()
                state.formChat.receivers = []
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>