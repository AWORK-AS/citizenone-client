<template>
    <!-- Only rendered when the organization has opened messages for relatives,
         so this never offers a door that would not open. -->
    <div v-if="isAvailable && state.recipients.length > 0"
        class="rounded-xl border border-primary/20 bg-white shadow-sm overflow-hidden">
        <div class="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
            <span class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                <Icon name="ph:chats-circle" class="w-5 h-5" aria-hidden="true" />
            </span>
            <div class="min-w-0">
                <p class="font-semibold text-gray-800 text-sm">{{ $t('messages.writeToUs') }}</p>
                <p class="text-xs text-gray-500">{{ recipientSummary }}</p>
            </div>
            <button v-if="state.chatCount > 0" type="button"
                class="ml-auto text-xs font-medium text-primary hover:underline"
                @click="navigateTo('/relative/messages')">
                {{ $t('messages.seeAllConversations') }}
            </button>
        </div>

        <form class="px-5 py-4 space-y-3" @submit.prevent="sendMessage">
            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <div class="space-y-1">
                <FormLabel for="write-to-us" :label="$t('messages.message')" />
                <FormTextArea id="write-to-us" name="write-to-us"
                    :placeholder="$t('messages.writeToUsPlaceholder')" v-model="state.message" />
                <FormError :error="state?.error?.errors?.message?.[0]" />
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <span v-for="recipient in state.recipients" :key="recipient.uuid" :class="[
                    isSelected(recipient.uuid)
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 text-gray-600 hover:border-primary/40',
                    'flex items-center gap-x-1.5 rounded-full border px-3 py-1 text-xs cursor-pointer'
                ]" @click="toggleRecipient(recipient.uuid)">
                    <Icon v-if="isSelected(recipient.uuid)" name="heroicons:check-circle-solid" class="w-3.5 h-3.5"
                        aria-hidden="true" />
                    {{ recipient.firstname }} {{ recipient.lastname }}
                    <span v-if="recipient.is_contact_person" class="text-xxs text-green-700">
                        · {{ $t('messages.contactPerson') }}
                    </span>
                </span>
            </div>

            <div class="pt-1">
                <FormButton type="submit" buttonStyle="primary" :disabled="state.isSending">
                    {{ state.isSending ? $t('messages.sending') : $t('messages.send') }}
                </FormButton>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { messageService } from '@/components/api/relative/MessageService'
import { useUserStore } from '@/store/user'
import { useChatCprWarning } from '@/composables/chatCprWarning'
import { useI18n } from 'vue-i18n'
import type { Error } from '@/types'

const userStore = useUserStore() as any
const { t } = useI18n()
const { confirmChatText } = useChatCprWarning()

const state = reactive({
    error: {} as Error,
    isSending: false,
    message: '',
    recipients: [] as any[],
    selected: [] as string[],
    chatCount: 0,
})

const isAvailable = computed(() =>
    !!userStore.getUser?.company?.relative_chat_enabled
    && (userStore.getUser?.portal_visibility ?? {}).messages !== false)

const recipientSummary = computed(() => {
    const contactPersons = state.recipients.filter((recipient: any) => recipient.is_contact_person)
    const names = (contactPersons.length ? contactPersons : state.recipients)
        .slice(0, 2)
        .map((recipient: any) => recipient.firstname)

    if (names.length === 0) return ''

    return contactPersons.length
        ? t('messages.writeToUsContactPersons', { names: names.join(', ') })
        : t('messages.writeToUsManagement')
})

// The layout fetches the user after this component mounts, so waiting for the
// store is what makes the card appear on a cold load.
watch(isAvailable, (available) => {
    if (available && state.recipients.length === 0) {
        fetchRecipients()
        fetchChatCount()
    }
}, { immediate: true })

function isSelected(uuid: string) {
    return state.selected.includes(uuid)
}

function toggleRecipient(uuid: string) {
    if (isSelected(uuid)) {
        state.selected = state.selected.filter((selected) => selected !== uuid)

        return
    }

    if (userStore.getUser?.company?.group_chat_enabled) {
        state.selected.push(uuid)
    } else {
        state.selected = [uuid]
    }
}

async function fetchRecipients() {
    try {
        const response = await messageService.getAllAvailableUsers()
        if (response?.data) {
            state.recipients = response.data
            // Pre-select the citizen's own contact persons when there are any,
            // so the common case is one field and one button.
            const contactPersons = response.data.filter((recipient: any) => recipient.is_contact_person)
            const preselect = contactPersons.length ? contactPersons : response.data.slice(0, 1)
            state.selected = userStore.getUser?.company?.group_chat_enabled
                ? preselect.map((recipient: any) => recipient.uuid)
                : preselect.slice(0, 1).map((recipient: any) => recipient.uuid)
        }
    } catch (error: any) {
        // A missing recipient list just hides the card; it is not worth an alert
        // on the landing page.
        state.recipients = []
    }
}

async function fetchChatCount() {
    try {
        const response = await messageService.fetchChats()
        state.chatCount = response?.data?.length ?? 0
    } catch (error: any) {
        state.chatCount = 0
    }
}

async function sendMessage() {
    state.error = {}

    if (!state.message.trim()) {
        state.error = { message: `${t('validation.thisFieldIsRequired')}.` } as Error

        return
    }

    if (state.selected.length === 0) {
        state.error = { message: t('messages.recipientsHint') } as Error

        return
    }

    if (!(await confirmChatText(state.message))) return

    state.isSending = true
    try {
        const response = await messageService.sendMessageViaReceiverUuid({
            subject: '',
            message: state.message,
            receiver_uuid: state.selected,
        })

        const chatUuid = response?.data?.chat?.uuid
        state.message = ''

        if (chatUuid) {
            navigateTo(`/relative/messages/${chatUuid}`)
        }
    } catch (error: any) {
        state.error = error
    }
    state.isSending = false
}
</script>
