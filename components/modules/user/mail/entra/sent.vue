<template>
    <div class="grow flex items-center justify-center" v-if="state.loading.isEmailsLoading">
        <span class="text-lg">
            {{ t('mail.loading.loadingYourEmails') }}
        </span>
        <span class="dot1">.</span>
        <span class="dot2">.</span>
        <span class="dot3">.</span>
        <span class="dot4">.</span>
        <span class="dot5">.</span>
    </div>
    <div class="grow" v-else>
        <div class="relative">
            <div style="height: 80vh; overflow-y: auto;">
                <div v-for="(email, emailIndex) in state.sentEmails" :key="emailIndex"
                    class="bg-white hover:bg-gray-100 px-4 py-3 cursor-pointer border-b-0.5 border-gray-300"
                    @click="setSelectedEmail(email)">
                    <div>
                        <div class="flex items-center gap-x-2">
                            <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${email?.toRecipients?.[0]?.emailAddress?.name}`"
                                class="rounded-full w-11 h-11 object-cover" />
                            <div class="grow">
                                <div class="flex justify-between gap-3">
                                    <div>
                                        <div class="flex items-center text-xs line-clamp-1">
                                            <p>
                                                {{
                                                    email?.toRecipients.map(receiver =>
                                                        receiver?.emailAddress?.address).join('; ')
                                                }}.
                                            </p>
                                        </div>
                                        <p class="text-sm">
                                            {{ email?.subject }}
                                        </p>
                                    </div>
                                    <div class="flex justify-end">
                                        <Tooltip :text="`Secured`" position="left">
                                            <Icon name="ic:baseline-security" class="h-4 w-4 text-primary"
                                                aria-hidden="true" />
                                        </Tooltip>
                                    </div>
                                </div>
                                <p class="text-xs line-clamp-1">
                                    {{ email?.bodyPreview }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <p class="text-xs text-right">
                        {{ formatDateTimeToReadable(email?.createdDateTime) }}
                    </p>
                </div>
                <div class="text-center py-3 text-gray-500 text-sm" v-if="state.loading.isEmailsLoadingMore">
                    {{ $t('mail.loading.loadingYourEmails') }}
                    <span class="dot1">.</span>
                    <span class="dot2">.</span>
                    <span class="dot3">.</span>
                    <span class="dot4">.</span>
                    <span class="dot5">.</span>
                </div>
                <div class="text-center py-3" v-else v-if="state.nextPageLink">
                    <button class="text-sm" @click="fetchSentMails(state.nextPageLink)">
                        {{ $t('mail.loadMore') }}
                    </button>
                </div>
            </div>
            <div v-if="state.showOnFirstLoad" :class="[
                state.selectedEmail && 'slide-from-right',
                !state.selectedEmail && 'slide-to-right',
                'absolute top-0 left-0 h-full w-full bg-white px-6 py-4 rounded-md overflow-x-scroll'
            ]">
                <button class="flex items-center gap-x-2" @click="state.selectedEmail = null">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </button>
                <div class="mt-3">
                    <p class="text-lg font-semibold">
                        {{ state.selectedEmail?.header?.subject }}
                    </p>
                    <div class="flex-wrap md:flex gap-1 text-sm">
                        <p>
                            {{ t('mail.content.to') }}
                        </p>
                        <p>
                            {{
                                state.selectedEmail?.toRecipients.map(receiver =>
                                    receiver?.emailAddress?.address).join(', ')
                            }}
                        </p>
                        <p class="lowercase">
                            {{ t('mail.content.on') }}
                        </p>
                        <p>
                            {{
                                formatDateTimeToReadable(state.selectedEmail?.createdDateTime)
                            }}
                        </p>
                    </div>
                    <div v-html="state.selectedEmail?.body?.content?.replace(/\n/g, '<br>')" class="py-6" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { mailEntraService } from "@/components/api/user/MailEntraService"
import type { Error } from '@/types'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const runtimeConfig = useRuntimeConfig()
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { errorAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    loading: {
        isEmailsLoading: false,
        isEmailsLoadingMore: false,
    },
    nextPageLink: '',
    selectedEmail: null as any,
    sentEmails: [] as any,
    showOnFirstLoad: false,
    unreadEmails: 0,
    unreadSecuredMessage: 0,
})

onMounted(() => {
    fetchSentMails(null)
})

async function fetchSentMails(page: any) {
    state.error = {}
    if (page === null) {
        state.loading.isEmailsLoading = true
    } else {
        state.loading.isEmailsLoadingMore = true
    }
    try {
        const params = {
            page: page,
        }
        const response = await mailEntraService.getSentMails(params)
        if (response) {
            state.sentEmails.push(...response?.value)
            state.nextPageLink = response['@odata.nextLink']
            // state.unreadEmails = response?.unread_emails ?? 0
            // state.unreadSecuredMessage = response?.unread_secured_emails ?? 0
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.loading.isEmailsLoading = false
        state.loading.isEmailsLoadingMore = false
    }
}

function setSelectedEmail(email: any) {
    state.selectedEmail = email
    state.showOnFirstLoad = true
}
</script>

<style>
@keyframes blink {
    0% {
        opacity: 0;
    }

    33% {
        opacity: 1;
    }

    66% {
        opacity: 0;
    }

    100% {
        opacity: 0;
    }
}

.dot1 {
    animation: blink 1.4s infinite both;
}

.dot2 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.2s;
}

.dot3 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.4s;
}

.dot4 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.6s;
}

.dot5 {
    animation: blink 1.4s infinite both;
    animation-delay: 0.8s;
}

@keyframes slideFromRight {
    0% {
        transform: translateX(100%);
        opacity: 0;
    }

    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideToRight {
    0% {
        transform: translateX(0);
        opacity: 1;
    }

    100% {
        transform: translateX(100%);
        opacity: 0;
    }
}

.slide-from-right {
    animation: slideFromRight 0.5s ease-out forwards;
}

.slide-to-right {
    animation: slideToRight 0.5s ease-in forwards;
}
</style>