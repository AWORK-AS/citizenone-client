<template>
    <div class="grow flex h-[80vh] min-w-0">
        <!-- ===================== LIST COLUMN ===================== -->
        <div class="w-[384px] shrink-0 flex flex-col bg-white border-r-0.5 border-gray-300 min-w-0">
            <div class="px-4 pt-4 pb-3 border-b-0.5 border-gray-300">
                <div class="flex items-baseline gap-2">
                    <h2 class="text-base font-bold text-gray-900">{{ $t('mail.inbox') }}</h2>
                    <span class="text-xs font-semibold text-gray-400 tabular-nums" v-if="state.emails.length">
                        {{ state.emails.length }}
                    </span>
                </div>
            </div>

            <!-- loading -->
            <div v-if="state.loading.isEmailsLoading" class="grow flex items-center justify-center text-gray-500 text-sm">
                <span>{{ $t('mail.loading.loadingYourEmails') }}</span>
                <span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span><span
                    class="dot4">.</span><span class="dot5">.</span>
            </div>

            <template v-else>
                <Alert type="danger" :text="state?.error?.message" class="m-3"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <!-- empty list -->
                <div v-if="!state.emails.length"
                    class="grow flex flex-col items-center justify-center text-center text-gray-400 gap-2 px-6">
                    <Icon name="ph:tray" class="h-9 w-9" aria-hidden="true" />
                    <p class="text-sm font-medium text-gray-500">{{ $t('mail.inbox') }}</p>
                </div>

                <!-- rows -->
                <div v-else class="grow overflow-y-auto">
                    <button v-for="(email, emailIndex) in state.emails" :key="email?.header?.uid ?? emailIndex"
                        @click="setSelectedEmail(emailIndex, email)"
                        class="relative w-full text-left grid grid-cols-[38px_1fr] gap-3 px-4 py-3 border-b-0.5 border-gray-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                        :class="isSelected(email) ? 'bg-primary/5' : 'hover:bg-gray-50'">
                        <span class="absolute left-0 top-0 bottom-0 w-[3px]" aria-hidden="true"
                            :class="isSelected(email) ? 'bg-primary' : (isUnread(email) ? 'bg-primary/50' : 'bg-transparent')"></span>
                        <img
                            :src="`https://ui-avatars.com/api/?background=205E77&color=fff&bold=true&name=${encodeURIComponent(senderName(email?.header?.from))}`"
                            class="rounded-full w-[38px] h-[38px] object-cover" alt="" />
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-primary shrink-0" v-if="isUnread(email)"
                                    aria-hidden="true"></span>
                                <span class="grow truncate text-[13.5px]"
                                    :class="isUnread(email) ? 'font-bold text-gray-900' : 'font-medium text-gray-700'">
                                    {{ senderName(email?.header?.from) }}
                                </span>
                                <span class="shrink-0 text-[11.5px] text-gray-400 tabular-nums">
                                    {{ formatShort(email?.header?.date) }}
                                </span>
                            </div>
                            <p class="truncate text-[13px] mt-0.5"
                                :class="isUnread(email) ? 'font-semibold text-gray-900' : 'text-gray-600'">
                                {{ email?.header?.subject }}
                            </p>
                            <div class="mt-1" v-if="email?.attachments?.length">
                                <span
                                    class="inline-flex items-center gap-1 text-[10.5px] text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                                    <Icon name="ph:paperclip" class="h-3 w-3" aria-hidden="true" />
                                    {{ email.attachments.length }}
                                </span>
                            </div>
                        </div>
                    </button>

                    <!-- load more -->
                    <div class="text-center py-3 text-gray-500 text-sm" v-if="state.loading.isEmailsLoadingMore">
                        {{ $t('mail.loading.loadingYourEmails') }}
                        <span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span><span
                            class="dot4">.</span><span class="dot5">.</span>
                    </div>
                    <div class="text-center py-3" v-else-if="parseInt(state.pagination?.current_page) < parseInt(state.pagination?.last_page)">
                        <button
                            class="text-sm font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-2 py-1"
                            @click="fetchEmails(parseInt(state.pagination?.current_page) + 1)">
                            {{ $t('mail.loadMore') }}
                        </button>
                    </div>
                </div>
            </template>
        </div>

        <!-- ===================== READING PANE ===================== -->
        <div class="grow flex flex-col min-w-0 bg-white">
            <template v-if="state.selectedEmail">
                <div class="px-6 pt-5 pb-4 border-b-0.5 border-gray-300">
                    <button
                        class="md:hidden mb-3 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary focus:outline-none"
                        @click="state.selectedEmail = null">
                        <Icon name="ph:arrow-left" class="h-4 w-4" aria-hidden="true" />
                        <span>{{ $t('back') }}</span>
                    </button>
                    <h1 class="text-xl font-bold text-gray-900 mb-3 text-balance">
                        {{ state.selectedEmail?.header?.subject }}
                    </h1>
                    <div class="flex items-center gap-3">
                        <img
                            :src="`https://ui-avatars.com/api/?background=205E77&color=fff&bold=true&name=${encodeURIComponent(senderName(state.selectedEmail?.header?.from))}`"
                            class="rounded-full w-10 h-10 object-cover" alt="" />
                        <div class="min-w-0 grow">
                            <p class="text-sm font-semibold text-gray-900 truncate">
                                {{ senderName(state.selectedEmail?.header?.from) }}
                            </p>
                            <p class="text-xs text-gray-500 truncate">{{ state.selectedEmail?.header?.from }}</p>
                        </div>
                        <p class="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                            {{ formatDateTimeToReadable(state.selectedEmail?.header?.date) }}
                        </p>
                    </div>
                </div>

                <div class="grow overflow-y-auto px-6 py-5">
                    <div class="mail-body" v-html="state.selectedEmail?.bodies?.html" />

                    <div class="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-dashed border-gray-300"
                        v-if="state.selectedEmail?.attachments?.length">
                        <button v-for="(attachment, attachmentIndex) in state.selectedEmail?.attachments"
                            :key="attachmentIndex" @click="downloadAttachment(attachment?.url)"
                            class="flex items-center gap-2.5 pl-2 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-white hover:border-primary transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                            <span class="flex items-center justify-center w-8 h-8 rounded text-white shrink-0"
                                :class="attachmentColor(attachment?.url)">
                                <Icon :name="attachmentIcon(attachment?.url)" class="h-4 w-4" aria-hidden="true" />
                            </span>
                            <span class="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                                {{ attachment?.filename }}
                            </span>
                        </button>
                    </div>
                </div>

                <div class="px-6 py-4 border-t-0.5 border-gray-300">
                    <ModulesUserMailSmtpReplyRegularMailForm :selectedEmail="state.selectedEmail"
                        @close="state.showReplyForm = false" v-if="state.showReplyForm" />
                    <ModulesUserMailSmtpForwardRegularMailForm :selectedEmail="state.selectedEmail"
                        @close="state.showForwardForm = false" v-if="state.showForwardForm" />
                    <div class="flex items-center gap-x-3" v-if="!state.showReplyForm && !state.showForwardForm">
                        <FormButton buttonStyle="primary" class="w-fit rounded-md"
                            @click="state.showReplyForm = true">
                            <Icon name="ph:arrow-bend-up-left" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('mail.reply') }}
                        </FormButton>
                        <FormButton buttonStyle="white" class="w-fit rounded-md"
                            @click="state.showForwardForm = true">
                            <Icon name="ph:arrow-bend-up-right" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('mail.forward') }}
                        </FormButton>
                    </div>
                </div>
            </template>

            <!-- empty reading state -->
            <div v-else class="grow flex flex-col items-center justify-center text-center text-gray-400 gap-3 px-8">
                <span class="flex items-center justify-center w-[74px] h-[74px] rounded-full bg-primary/5 text-primary">
                    <Icon name="ph:envelope-open" class="h-8 w-8" aria-hidden="true" />
                </span>
                <!-- TODO(i18n): add mail.content.selectAMessage to lang/{en,dk,sv,no}.json -->
                <p class="text-base font-semibold text-gray-500">
                    {{ $te('mail.content.selectAMessage') ? $t('mail.content.selectAMessage') : 'Vælg en besked' }}
                </p>
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

const emit = defineEmits(['setUnreadEmailsCount'])
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { isImage, isExcel, isPdf, isPpt, isWord } = fileHelper()

const state = reactive({
    error: {} as Error,
    emails: [] as any,
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
    showForwardForm: false,
    showOnFirstLoad: false,
    showReplyForm: false,
    unreadEmails: 0,
    unreadSecuredMessage: 0,
})

const DK_MONTHS = ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.']

function isUnread(email: any): boolean {
    return email?.flags?.seen !== 'Seen'
}

function isSelected(email: any): boolean {
    return !!state.selectedEmail && state.selectedEmail?.header?.uid === email?.header?.uid
}

function senderName(from: string | undefined | null): string {
    if (!from) return ''
    const lt = from.indexOf('<')
    let name = lt > 0 ? from.slice(0, lt).trim().replace(/^"|"$/g, '') : from.trim()
    if (!name || name.includes('@')) {
        const addr = lt >= 0 ? from.slice(lt + 1).replace('>', '') : from
        name = addr.split('@')[0]
    }
    return name.trim()
}

function formatShort(value: string | undefined | null): string {
    if (!value) return ''
    const dt = new Date(value)
    if (isNaN(dt.getTime())) return ''
    const now = new Date()
    const pad = (n: number) => `${n}`.padStart(2, '0')
    if (dt.toDateString() === now.toDateString()) {
        return `${pad(dt.getHours())}:${pad(dt.getMinutes())}`
    }
    if (dt.getFullYear() === now.getFullYear()) {
        return `${dt.getDate()}. ${DK_MONTHS[dt.getMonth()]}`
    }
    return `${pad(dt.getDate())}.${pad(dt.getMonth() + 1)}.${dt.getFullYear()}`
}

function attachmentIcon(url: string): string {
    if (isPdf(url)) return 'ph:file-pdf'
    if (isWord(url)) return 'ph:file-doc'
    if (isExcel(url)) return 'ph:file-xls'
    if (isPpt(url)) return 'ph:file-ppt'
    if (isImage(url)) return 'ph:file-image'
    return 'ph:file'
}

function attachmentColor(url: string): string {
    if (isPdf(url)) return 'bg-[#c8433b]'
    if (isImage(url)) return 'bg-secondary'
    if (isExcel(url)) return 'bg-[#2f8f6b]'
    return 'bg-primary'
}

onMounted(() => {
    fetchEmails(1)
})

async function fetchEmails(pageNumber: number) {
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
        const response = await mailSMTPService.getMails(params)
        if (response?.data) {
            state.emails.push(...response?.data?.data?.sort((a: any, b: any) => new Date(b.header.date).getTime() - new Date(a.header.date).getTime()))
            state.unreadEmails = response?.unread_emails ?? 0
            state.unreadSecuredMessage = response?.unread_secured_emails ?? 0
            state.pagination = response?.data
            emit('setUnreadEmailsCount', {
                unreadEmails: state.unreadEmails,
                unreadSecuredMessage: state.unreadSecuredMessage,
            })
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.loading.isEmailsLoading = false
        state.loading.isEmailsLoadingMore = false
    }
}

async function setSelectedEmail(emailIndex: any, email: any) {
    state.selectedEmail = email
    state.showOnFirstLoad = true
    state.showReplyForm = false
    state.showForwardForm = false
    if (email?.flags?.seen !== 'Seen') {
        state.error = {}
        state.emails[emailIndex].flags.seen = 'Seen'
        try {
            const emailUid = email?.header?.uid
            const response = await mailSMTPService.readMail(emailUid)
            if (response) {
                if (state.unreadEmails > 0) {
                    state.unreadEmails--
                    emit('setUnreadEmailsCount', {
                        unreadEmails: state.unreadEmails,
                        unreadSecuredMessage: state.unreadSecuredMessage,
                    })
                }
            }
        } catch (error: any) {
            state.error = error
        }
    }
}

function downloadAttachment(attachment: any) {
    state.modal.isDownloadAttachment = true
    state.selectedAttachment = attachment
}
</script>

<style scoped>
@keyframes blink {
    0% { opacity: 0; }
    33% { opacity: 1; }
    66% { opacity: 0; }
    100% { opacity: 0; }
}
.dot1 { animation: blink 1.4s infinite both; }
.dot2 { animation: blink 1.4s infinite both; animation-delay: 0.2s; }
.dot3 { animation: blink 1.4s infinite both; animation-delay: 0.4s; }
.dot4 { animation: blink 1.4s infinite both; animation-delay: 0.6s; }
.dot5 { animation: blink 1.4s infinite both; animation-delay: 0.8s; }

/* Constrain raw email HTML so it renders cleanly inside the reading pane */
.mail-body { font-size: 14px; line-height: 1.6; color: #2a3948; max-width: 68ch; overflow-wrap: break-word; }
.mail-body :deep(img) { max-width: 100%; height: auto; }
.mail-body :deep(a) { color: #205E77; text-decoration: underline; }
.mail-body :deep(table) { max-width: 100%; display: block; overflow-x: auto; }
.mail-body :deep(p) { margin: 0 0 12px; }
.mail-body :deep(h1), .mail-body :deep(h2), .mail-body :deep(h3) { font-size: 1.05em; margin: 16px 0 8px; }

@media (prefers-reduced-motion: reduce) {
    .dot1, .dot2, .dot3, .dot4, .dot5 { animation: none; }
}
</style>
