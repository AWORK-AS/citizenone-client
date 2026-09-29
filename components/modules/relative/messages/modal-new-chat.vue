<template>
    <div>
        <Modal size="sm" :title="$t('messages.newMessage')" :show="props.isModalOpen" @close="closeModal">
            <template #modal-body>
                <LoadingSpinner :isActive="state.isPageLoading">
                    <form @submit.prevent="sendMessage">
                        <div class="space-y-4">
                            <div class="space-y-1">
                                <FormLabel for="receivers" :label="$t('messages.recipients')" />
                                <p class="text-xs text-gray-500">{{ $t('messages.recipientsHint') }}.</p>
                                <FormError :error="v$?.formChat?.receivers?.$errors[0]?.$message.toString()" />
                                <FormError :error="state?.error?.errors?.receiver_uuid?.[0]" />
                            </div>

                            <div v-if="contactPersons.length > 0" class="space-y-2">
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {{ $t('messages.yourContactPersons') }}
                                </p>
                                <button v-for="recipient in contactPersons" :key="recipient.uuid" type="button"
                                    class="w-full" @click="toggleRecipient(recipient.uuid)">
                                    <span :class="[
                                        isSelected(recipient.uuid)
                                            ? 'border-primary ring-1 ring-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-primary/50',
                                        'flex items-center gap-x-3 rounded-md border px-3 py-2 text-left transition-colors'
                                    ]">
                                        <img :src="recipientAvatar(recipient)" alt=""
                                            class="w-9 h-9 rounded-full object-cover">
                                        <span class="flex-1 min-w-0">
                                            <span class="block text-sm font-semibold truncate">
                                                {{ recipient.firstname }} {{ recipient.lastname }}
                                            </span>
                                            <span
                                                class="inline-block text-xxs font-medium bg-green-100 text-green-800 rounded-full px-2 py-0.5">
                                                {{ $t('messages.contactPerson') }}
                                            </span>
                                        </span>
                                        <Icon v-if="isSelected(recipient.uuid)" name="heroicons:check-circle-solid"
                                            class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                                    </span>
                                </button>
                            </div>

                            <div v-if="managementRecipients.length > 0" class="space-y-2">
                                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                    {{ $t('messages.managementAndAdministration') }}
                                </p>
                                <button v-for="recipient in managementRecipients" :key="recipient.uuid" type="button"
                                    class="w-full" @click="toggleRecipient(recipient.uuid)">
                                    <span :class="[
                                        isSelected(recipient.uuid)
                                            ? 'border-primary ring-1 ring-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-primary/50',
                                        'flex items-center gap-x-3 rounded-md border px-3 py-2 text-left transition-colors'
                                    ]">
                                        <img :src="recipientAvatar(recipient)" alt=""
                                            class="w-9 h-9 rounded-full object-cover">
                                        <span class="flex-1 min-w-0">
                                            <span class="block text-sm font-semibold truncate">
                                                {{ recipient.firstname }} {{ recipient.lastname }}
                                            </span>
                                            <span class="block text-xs text-gray-500">{{ recipient.role }}</span>
                                        </span>
                                        <Icon v-if="isSelected(recipient.uuid)" name="heroicons:check-circle-solid"
                                            class="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                                    </span>
                                </button>
                            </div>

                            <div class="space-y-1">
                                <FormLabel for="subject" :label="$t('messages.subjectOptional')" />
                                <FormTextField id="subject" name="subject"
                                    :placeholder="$t('messages.subjectPlaceholder')"
                                    v-model="state.formChat.subject" />
                                <FormError :error="state?.error?.errors?.subject?.[0]" />
                            </div>
                            <div class="space-y-1">
                                <FormLabel for="message" :label="$t('messages.message')" />
                                <FormTextArea id="message" name="message"
                                    :placeholder="$t('messages.messagePlaceholder')"
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
                </LoadingSpinner>
            </template>
        </Modal>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/relative/MessageService'
import { useVuelidate } from "@vuelidate/core"
import { required, helpers } from '@vuelidate/validators'
import { useI18n } from "vue-i18n"
import { useUserStore } from '@/store/user'
import type { Error } from '@/types'

const props = defineProps({
    isModalOpen: {
        type: Boolean,
        required: true,
    },
})
const emit = defineEmits(['close'])
const { t } = useI18n()
const userStore = useUserStore() as any

const state = reactive({
    error: {} as Error,
    formChat: {
        message: '',
        receivers: [] as string[],
        subject: '',
    },
    isPageLoading: false,
    recipients: [] as any[],
})

const contactPersons = computed(() => state.recipients.filter((recipient: any) => recipient.is_contact_person))
const managementRecipients = computed(() => state.recipients.filter((recipient: any) => !recipient.is_contact_person))

onMounted(() => {
    fetchRecipients()
})

const rules = computed(() => {
    return {
        formChat: {
            message: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
            receivers: {
                required: helpers.withMessage(() => `${t('validation.thisFieldIsRequired')}.`, required),
            },
        }
    }
})

const v$ = useVuelidate(rules, state)

function closeModal() {
    emit('close')
}

function isSelected(uuid: string) {
    return state.formChat.receivers.includes(uuid)
}

function toggleRecipient(uuid: string) {
    if (isSelected(uuid)) {
        state.formChat.receivers = state.formChat.receivers.filter((selected) => selected !== uuid)
        return
    }
    if (userStore.getUser?.company?.group_chat_enabled) {
        state.formChat.receivers.push(uuid)
    } else {
        // Single recipient when group chat is disabled: tapping replaces the selection.
        state.formChat.receivers = [uuid]
    }
}

function recipientAvatar(recipient: any) {
    return recipient?.profile_image ??
        avatarUrl(`${recipient?.firstname + ' ' + recipient?.lastname}`)
}

async function fetchRecipients() {
    state.error = {}
    state.isPageLoading = true
    try {
        const response = await messageService.getAllAvailableUsers()
        if (response.data) {
            state.recipients = response.data
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
                receiver_uuid: state.formChat.receivers,
            }
            const response = await messageService.sendMessageViaReceiverUuid(params)
            if (response) {
                const chatUuid = response?.data?.chat?.uuid
                closeModal()
                state.formChat.receivers = []
                state.formChat.subject = ''
                state.formChat.message = ''
                navigateTo(`/relative/messages/${chatUuid}`)
            }
        } catch (error: any) {
            state.error = error
        }
        state.isPageLoading = false
    }
}
</script>
