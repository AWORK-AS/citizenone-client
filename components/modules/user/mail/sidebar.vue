<template>
    <div class="flex flex-col items-center gap-4 py-4">
        <Tooltip :text="$t('mail.compose')" @click="state.modal.isSendEmailOpen = true">
            <button class="flex flex-col items-center justify-center p-5 rounded-full text-white bg-primary">
                <Icon name="ph:pencil" class="h-6 w-6" aria-hidden="true" />
            </button>
        </Tooltip>
        <div class="relative">
            <button
                class="flex flex-col items-center justify-center px-6 py-4 rounded-lg text-gray-900 hover:bg-gray-200"
                :class="$route.name === 'mail-inbox' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50'"
                @click="navigateTo('/mail/inbox')">
                <Icon name="ph:envelope-open" class="h-6 w-6" aria-hidden="true" />
                <p class="text-xxs">{{ $t('mail.inbox') }}</p>
            </button>
            <Badge type="notification" class="w-fit absolute -right-2 -top-2">
                {{ props?.unreadMessage ?? 0 }}
            </Badge>
        </div>
        <button class="flex flex-col items-center justify-center px-6 py-4 rounded-lg text-gray-900 hover:bg-gray-200"
            :class="$route.name === 'mail-sent' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50'"
            @click="navigateTo('/mail/sent')">
            <Icon name="ph:paper-plane-tilt" class="h-6 w-6" aria-hidden="true" />
            <p class="text-xxs">{{ $t('mail.sent') }}</p>
        </button>
        <ModulesUserMailModalSendEmail :isModalOpen="state.modal.isSendEmailOpen"
            @close="state.modal.isSendEmailOpen = false" @refreshSentEmails="emit('refreshSentEmails')" />
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    unreadMessage: {
        type: Number,
        required: true,
    },
})

const state = reactive({
    modal: {
        isSendEmailOpen: false,
    },
})
const emit = defineEmits(['refreshSentEmails'])
</script>