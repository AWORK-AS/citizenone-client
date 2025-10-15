<template>
    <div class="grow flex items-center justify-center" v-if="state.loading.isEmailsLoading">
        <span class="text-lg">
            {{ $t('mail.loading.loadingYourEmails') }}
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
                <div v-for="(email, emailIndex) in state.sentEmails" :key="emailIndex" :class="[
                    email?.is_read ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white hover:bg-gray-100',
                    'px-4 py-3 cursor-pointer border-b-0.5 border-gray-300'

                ]" @click="setSelectedEmail(email)">
                    <div>
                        <div class="flex items-center gap-x-2">
                            <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${email?.header?.to}`"
                                class="rounded-full w-11 h-11 object-cover" />
                            <div class="grow">
                                <div class="flex justify-between gap-3">
                                    <p class="text-xs line-clamp-1">
                                        {{ email?.header?.to }}
                                    </p>
                                    <div class="flex justify-end">
                                        <Tooltip :text="`Secured`" position="left" v-if="email?.is_secure_mail">
                                            <Icon name="ic:baseline-security" class="h-4 w-4 text-primary"
                                                aria-hidden="true" />
                                        </Tooltip>
                                    </div>
                                </div>
                                <p class="text-sm" v-if="email?.header?.subject && email?.header?.subject?.length > 0">
                                    {{ email?.header?.subject }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <p class="text-xs text-right">
                        {{ formatDateTimeToReadable(email?.header?.date) }}
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
                <div class="text-center py-3" v-else
                    v-if="parseInt(state.pagination?.current_page) < parseInt(state.pagination?.last_page)">
                    <button class="text-sm" @click="fetchSentMails(parseInt(state.pagination?.current_page) + 1)">
                        {{ $t('mail.loadMore') }}
                    </button>
                </div>
            </div>
            <div v-if="state.showOnFirstLoad" :class="[
                state.selectedEmail && 'slide-from-right',
                !state.selectedEmail && 'slide-to-right',
                'absolute top-0 left-0 h-full w-full bg-white px-6 py-4 rounded-md overflow-x-scroll'
            ]">
                <button class="flex items-center gap-x-2 text-gray-900" @click="state.selectedEmail = null">
                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                    <span>{{ $t('back') }}</span>
                </button>
                <div class="mt-3 text-gray-900">
                    <p class="text-lg font-semibold">
                        {{ state.selectedEmail?.header?.subject }}
                    </p>
                    <div class="flex-wrap md:flex gap-1 text-sm">
                        <p>
                            {{ $t('mail.content.from') }}
                        </p>
                        <p>
                            {{ state.selectedEmail?.header?.to }}
                        </p>
                        <p class="lowercase">
                            {{ $t('mail.content.on') }}
                        </p>
                        <p>
                            {{
                                formatDateTimeToReadable(state.selectedEmail?.header?.date)
                            }}
                        </p>
                    </div>
                    <div v-html="state.selectedEmail?.bodies?.html" class="py-6" />
                    <div class="flex flex-wrap items-center gap-2">
                        <div v-for="(attachment, attachmentIndex) in state.selectedEmail?.attachments"
                            :index="attachmentIndex" class="border border-gray-200 rounded-sm">
                            <div class="cursor-pointer flex items-center gap-x-2 p-2"
                                @click="downloadAttachment(attachment?.url)">
                                <div class="flex items-center" v-if="isPdf(attachment?.url)">
                                    <Icon name="ph:file-pdf" class="h-5 w-5 text-red-600" aria-hidden="true" />
                                </div>
                                <div class="flex items-center" v-else-if="isWord(attachment?.url)">
                                    <Icon name="ph:file-doc" class="h-5 w-5 text-blue-600" aria-hidden="true" />
                                </div>
                                <div class="flex items-center" v-else-if="isExcel(attachment?.url)">
                                    <Icon name="ph:file-xls" class="h-5 w-5 text-green-600" aria-hidden="true" />
                                </div>
                                <div class="flex items-center" v-else-if="isPpt(attachment?.url)">
                                    <Icon name="ph:file-ppt" class="h-5 w-5 text-purple-600" aria-hidden="true" />
                                </div>
                                <div class="flex items-center" v-else-if="isImage(attachment?.url)">
                                    <Icon name="ph:file-image" class="h-5 w-5 text-yellow-600" aria-hidden="true" />
                                </div>
                                <div class="flex items-center" v-else>
                                    <Icon name="ph:file" class="h-5 w-5 text-gray-600" aria-hidden="true" />
                                </div>
                                <p class="text-xs">
                                    {{ attachment?.filename }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <ModulesUserMailSmtpModalDownloadFile :isModalOpen="state.modal.isDownloadAttachment"
            :selectedAttachment="state.selectedAttachment" @close="state.modal.isDownloadAttachment = false" />
    </div>
</template>

<script setup lang="ts">
import { mailSMTPService } from "@/components/api/user/MailSMTPService"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { fileHelper } from '@/composables/fileHelper'
import type { Error } from '@/types'

const { formatDateTimeToReadable } = useDatetimeFormatter()
const { isImage, isExcel, isPdf, isPpt, isWord } = fileHelper()

const state = reactive({
    error: {} as Error,
    loading: {
        isEmailsLoading: false,
        isEmailsLoadingMore: false,
    },
    modal: {
        isDownloadAttachment: false,
    },
    pagination: {} as any,
    selectedAttachment: '' as any,
    selectedEmail: null as any,
    sentEmails: [] as any,
    showOnFirstLoad: false,
    unreadEmails: 0,
    unreadSecuredMessage: 0,
})

onMounted(() => {
    fetchSentMails(1)
})

async function fetchSentMails(pageNumber: number) {
    state.error = {}
    if (pageNumber > 1) {
        state.loading.isEmailsLoadingMore = true
    } else {
        state.loading.isEmailsLoading = true
    }
    try {
        const params = {
            page: pageNumber,
        }
        const response = await mailSMTPService.getSentMails(params)
        if (response?.data) {
            state.sentEmails.push(...response?.data?.data?.sort((a: any, b: any) => new Date(b.header.date).getTime() - new Date(a.header.date).getTime()))
            state.unreadEmails = response?.unread_emails ?? 0
            state.unreadSecuredMessage = response?.unread_secured_emails ?? 0
            state.pagination = response?.data
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

function downloadAttachment(attachment: any) {
    state.modal.isDownloadAttachment = true
    state.selectedAttachment = attachment
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