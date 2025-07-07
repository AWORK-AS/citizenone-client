<template>
    <div class="bg-white px-4 rounded-tl-md rounded-bl-md border-r-0.5 border-gray-300" style="height: 80vh;">
        <div class="flex flex-col items-center gap-5 py-4">
            <Tooltip :text="$t('mail.compose')" @click="state.modal.isSendEmailOpen = true">
                <button class="flex flex-col items-center justify-center p-5 rounded-full text-white bg-primary">
                    <Icon name="ph:pencil-simple" class="h-6 w-6" aria-hidden="true" />
                </button>
            </Tooltip>
            <div class="relative">
                <button class="w-20 h-20 flex flex-col items-center justify-center px-6 py-4 rounded-lg text-gray-900"
                    :class="$route.name === 'mail-inbox' ? 'text-primary bg-white shadow-md hover:bg-gray-100' : 'shadow-sm bg-gray-100 hover:bg-gray-200'"
                    @click="navigateTo('/mail/inbox')">
                    <Icon name="ph:envelope-open" class="h-6 w-6" aria-hidden="true" />
                    <p class="text-xxs">{{ $t('mail.inbox') }}</p>
                </button>
                <Badge type="notification" class="w-fit absolute -right-2 -top-2">
                    {{ props?.unreadMessage ?? 0 }}
                </Badge>
            </div>
            <div class="relative">
                <button class="w-20 h-20 flex flex-col items-center justify-center px-6 py-4 rounded-lg text-gray-900"
                    :class="$route.name === 'mail-secured-mail' ? 'text-primary bg-white shadow-md hover:bg-gray-100' : 'shadow-sm bg-gray-100 hover:bg-gray-200'"
                    @click="navigateTo('/mail/secured-mail')">
                    <div>
                        <Icon name="ic:baseline-security" class="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p class="text-xxs">{{ $t('mail.secured.secured') }}</p>
                    <p class="text-xxs">{{ $t('mail.mail') }}</p>
                </button>
                <Badge type="notification" class="w-fit absolute -right-2 -top-2">
                    {{ props?.unreadSecuredMessage ?? 0 }}
                </Badge>
            </div>
            <button class="w-20 h-20 flex flex-col items-center justify-center px-6 py-4 rounded-lg text-gray-900"
                :class="$route.name === 'mail-sent' ? 'text-primary bg-white shadow-md hover:bg-gray-100' : 'shadow-sm bg-gray-100 hover:bg-gray-200'"
                @click="navigateTo('/mail/sent')">
                <Icon name="ph:paper-plane-tilt" class="h-6 w-6" aria-hidden="true" />
                <p class="text-xxs">{{ $t('mail.sent') }}</p>
            </button>
            <ModulesUserMailModalSendEmail :isModalOpen="state.modal.isSendEmailOpen"
                @close="state.modal.isSendEmailOpen = false" @refreshSentEmails="emit('refreshSentEmails')" />
        </div>
    </div>
    <!-- <div class="bg-white py-8 rounded-tl-md rounded-bl-md shadow-md">
        <div class="px-6">
            <FormButton buttonStyle="primary" class="px-16 w-full rounded-md">
                <Icon name="ph:pencil-simple" class="h-4 w-4" aria-hidden="true" />
                {{ $t('mail.compose') }}
            </FormButton>
        </div>
        <div class="mt-7 space-y-2">
            <button :class="[
                $route.name === 'mail-inbox' ? 'border-l-3 border-primary text-primary px-4' : 'pr-4 pl-5',
                'w-full py-3 flex items-center justify-between'
            ]">
                <div class="flex items-center gap-x-2" @click="navigateTo('/mail/inbox')">
                    <Icon name="ic:outline-email" class="h-6 w-6" aria-hidden="true" />
                    <p class="text-sm">{{ $t('mail.inbox') }}</p>
                </div>
                <div>
                    <Badge type="notification" class="w-fit">
                        {{ props?.unreadMessage ?? 0 }}
                    </Badge>
                </div>
            </button>
            <button :class="[
                $route.name === 'mail-secured-mail' ? 'border-l-3 border-primary text-primary px-4' : 'pr-4 pl-5',
                'w-full py-3 flex items-center justify-between'
            ]">
                <div class="flex items-center gap-x-2" @click="navigateTo('/mail/secured-mail')">
                    <Icon name="ic:baseline-security" class="h-6 w-6" aria-hidden="true" />
                    <p class="text-sm">
                        {{ $t('mail.secured.securedMail') }}
                    </p>
                </div>
                <div>
                    <Badge type="notification" class="w-fit">
                        {{ props?.unreadMessage ?? 0 }}
                    </Badge>
                </div>
            </button>
            <button :class="[
                $route.name === 'mail-sent' ? 'border-l-3 border-primary text-primary px-4' : 'pr-4 pl-5',
                'w-full py-3 flex items-center justify-between'
            ]">
                <div class="flex items-center gap-x-2" @click="navigateTo('/mail/send')">
                    <Icon name="ph:paper-plane-tilt" class="h-6 w-6" aria-hidden="true" />
                    <p class="text-sm">
                        {{ $t('mail.sent') }}
                    </p>
                </div>
            </button>
        </div>
    </div> -->
</template>

<script setup lang="ts">
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

const state = reactive({
    modal: {
        isSendEmailOpen: false,
    },
})
const emit = defineEmits(['refreshSentEmails'])
</script>