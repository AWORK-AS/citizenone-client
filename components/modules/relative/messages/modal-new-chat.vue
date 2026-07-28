<template>
    <div>
        <Modal size="sm" :title="$t('messages.message')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="sendMessage" v-if="state.options.receivers.length > 0">
                        <div class="space-y-3">
                            <h3 class="text-base font-semibold text-primary">
                                {{ $t('messages.startTheConversation') }}
                            </h3>
                            <div class="space-y-1">
                                <FormLabel for="receiver" :label="$t('messages.users')" />
                                <FormSelect id="receiver" :options="state.options.receivers"
                                    v-model="state.formChat.receiver" />
                                <FormError :error="v$?.formChat?.receiver?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.receiver_uuid?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="subject" :label="$t('messages.subject')" />
                                <FormTextField id="subject" name="subject" :placeholder="$t('messages.subject')"
                                    v-model="state.formChat.subject" />
                                <FormError :error="v$?.formChat?.subject?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.subject?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="message" :label="$t('messages.message')" />
                                <FormTextArea id="message" name="message" :placeholder="$t('messages.message')"
                                    v-model="state.formChat.message" />
                                <FormError :error="v$?.formChat?.message?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.message?.[0]" />
                            </div>
                        </div>
                        <div class="mt-6 mb-2">
                            <FormButton type="submit" buttonStyle="primary" class="w-full">
                                {{ $t('messages.send') }}
                            </FormButton>
                        </div>
                    </form>
                    <p v-else class="text-sm text-gray-500 py-4">
                        {{ $t('messages.noConversationsFound') }}
                    </p>
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { chatService } from '@/components/api/relative/ChatService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    formChat: {
        message: '',
        receiver: null as string | null,
        subject: '',
    },
    isPageLoading: false,
    options: {
        receivers: [] as any,
    }
})

watch(() => props.isModalOpen, (isModalOpen: boolean) => {
    if (isModalOpen) {
        fetchRecipients()
    }
})

const rules = computed(() => {
    return {
        formChat: {
            message: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            receiver: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

async function fetchRecipients() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await chatService.fetchRecipients()
        if (response.data) {
            state.options.receivers = response.data.map((user: any) => ({
                value: user.uuid,
                label: `${user.firstname} ${user.lastname ?? ''}`,
            }))
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
                subject: state.formChat.subject,
                message: state.formChat.message,
                receiver_uuid: [state.formChat.receiver],
            }
            const response = await chatService.sendMessageViaReceiverUuid(params)
            if (response) {
                const chatUuid = response?.data?.chat?.uuid
                navigateTo(`/relative/messages/${chatUuid}`)
                closeModal()
                state.formChat.receiver = null
                state.formChat.subject = ''
                state.formChat.message = ''
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>
