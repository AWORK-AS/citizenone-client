<template>
    <!-- A labelled folder column, as in any mail client. It was a 76px strip of
         stacked icon-over-label buttons: "Indbakke" did not fit and was clipped
         to "ndbakke", and the active marker sat on top of the first letter. -->
    <nav :aria-label="$t('sidebar.mail')"
        class="w-52 shrink-0 flex flex-col gap-1 p-3 border-r border-surface-200 bg-white pane-height">
        <button type="button" @click="state.modal.isSendEmailOpen = true"
            class="mb-3 inline-flex h-10 w-full items-center justify-center gap-x-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2">
            <Icon name="ph:pencil-simple" class="h-4 w-4" aria-hidden="true" />
            {{ $t('mail.compose') }}
        </button>

        <NuxtLink v-for="folder in folders" :key="folder.route" :to="folder.href"
            :aria-current="$route.name === folder.route ? 'page' : undefined"
            class="flex h-10 items-center gap-x-3 rounded-lg px-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            :class="$route.name === folder.route
                ? 'bg-primary-50 text-primary font-semibold'
                : 'text-slate-600 font-medium hover:bg-surface-50 hover:text-slate-900'">
            <Icon :name="folder.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
            <span class="truncate">{{ $t(folder.label) }}</span>
            <span v-if="folder.unread > 0"
                class="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-white">
                {{ folder.unread > 99 ? '99+' : folder.unread }}
            </span>
        </NuxtLink>

        <ModulesUserMailModalSendEmail :isModalOpen="state.modal.isSendEmailOpen"
            @close="state.modal.isSendEmailOpen = false" @refreshSentEmails="emit('refreshSentEmails')" />
    </nav>
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

const folders = computed(() => [
    { route: 'mail-inbox', href: '/mail/inbox', icon: 'ph:tray', label: 'mail.inbox', unread: props.unreadMessage ?? 0 },
    ...(userStore.getUser?.is_secure_mail_active
        ? [{ route: 'mail-secured-mail', href: '/mail/secured-mail', icon: 'ph:lock-key', label: 'mail.secured.securedMail', unread: props.unreadSecuredMessage ?? 0 }]
        : []),
    { route: 'mail-sent', href: '/mail/sent', icon: 'ph:paper-plane-tilt', label: 'mail.sent', unread: 0 },
])

const state = reactive({
    modal: {
        isSendEmailOpen: false,
    },
})
const emit = defineEmits(['refreshSentEmails'])
</script>
