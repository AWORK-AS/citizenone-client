<template>
    <div class="bg-white flex flex-col items-center gap-1.5 px-3 py-5 rounded-tl-md rounded-bl-md border-r-0.5 border-gray-300"
        style="height: 80vh;">
        <Tooltip :text="$t('mail.compose')" @click="state.modal.isSendEmailOpen = true">
            <button
                class="flex items-center justify-center w-12 h-12 mb-3 rounded-full text-white bg-primary shadow-md transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                :aria-label="$t('mail.compose')">
                <Icon name="ph:pencil-simple" class="h-5 w-5" aria-hidden="true" />
            </button>
        </Tooltip>

        <div class="relative w-full">
            <button
                class="w-full flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                :class="$route.name === 'mail-inbox' ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-primary hover:bg-gray-50'"
                @click="navigateTo('/mail/inbox')">
                <Icon name="ph:envelope-open" class="h-6 w-6" aria-hidden="true" />
                <span class="text-xxs font-semibold">{{ $t('mail.inbox') }}</span>
            </button>
            <span v-if="$route.name === 'mail-inbox'"
                class="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" aria-hidden="true"></span>
            <Badge type="notification" class="w-fit absolute right-1 top-1" v-if="(props?.unreadMessage ?? 0) > 0">
                {{ props?.unreadMessage ?? 0 }}
            </Badge>
        </div>

        <div class="relative w-full" v-if="userStore.getUser?.is_secure_mail_active">
            <button
                class="w-full flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                :class="$route.name === 'mail-secured-mail' ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-primary hover:bg-gray-50'"
                @click="navigateTo('/mail/secured-mail')">
                <Icon name="ph:lock-key-fill" class="h-6 w-6" aria-hidden="true" />
                <span class="text-xxs font-semibold">{{ $t('mail.secured.securedMail') }}</span>
            </button>
            <span v-if="$route.name === 'mail-secured-mail'"
                class="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" aria-hidden="true"></span>
            <Badge type="notification" class="w-fit absolute right-1 top-1" v-if="(props?.unreadSecuredMessage ?? 0) > 0">
                {{ props?.unreadSecuredMessage ?? 0 }}
            </Badge>
        </div>

        <div class="relative w-full">
            <button
                class="w-full flex flex-col items-center justify-center gap-1 py-3 rounded-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                :class="$route.name === 'mail-sent' ? 'text-primary bg-primary/5' : 'text-gray-500 hover:text-primary hover:bg-gray-50'"
                @click="navigateTo('/mail/sent')">
                <Icon name="ph:paper-plane-tilt" class="h-6 w-6" aria-hidden="true" />
                <span class="text-xxs font-semibold">{{ $t('mail.sent') }}</span>
            </button>
            <span v-if="$route.name === 'mail-sent'"
                class="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-primary" aria-hidden="true"></span>
        </div>

        <ModulesUserMailModalSendEmail :isModalOpen="state.modal.isSendEmailOpen"
            @close="state.modal.isSendEmailOpen = false" @refreshSentEmails="emit('refreshSentEmails')" />
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'

const props = defineProps({
    unreadMessage: {
        type: Number,
        required: true,
    },
    unreadSecuredMessage: {
        type: Number,
        required: true,
    },
})

const userStore = useUserStore() as any

const state = reactive({
    modal: {
        isSendEmailOpen: false,
    },
})
const emit = defineEmits(['refreshSentEmails'])
</script>
