<template>
    <div class="grow flex h-[80vh] min-w-0">
        <!-- ===================== LIST COLUMN ===================== -->
        <div class="w-[384px] shrink-0 flex flex-col bg-white border-r-0.5 border-gray-300 min-w-0">
            <div class="px-4 pt-4 pb-3 border-b-0.5 border-gray-300 flex flex-col gap-3">
                <div class="flex items-baseline gap-2">
                    <h2 class="text-base font-bold text-gray-900">{{ $t('mail.inbox') }}</h2>
                    <span class="text-xs font-semibold text-gray-400 tabular-nums" v-if="state.emails.length">
                        {{ state.emails.length }}
                    </span>
                </div>
                <div class="flex items-center gap-1.5">
                    <button type="button" @click="activeFilter = 'all'"
                        class="h-[30px] px-3 rounded-full text-[12.5px] font-semibold border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        :class="activeFilter === 'all' ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-500 hover:border-primary hover:text-primary'">
                        {{ $te('mail.filter.all') ? $t('mail.filter.all') : 'Alle' }}
                    </button>
                    <button type="button" @click="activeFilter = 'unread'"
                        class="h-[30px] px-3 rounded-full text-[12.5px] font-semibold border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        :class="activeFilter === 'unread' ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300 text-gray-500 hover:border-primary hover:text-primary'">
                        {{ $te('mail.filter.unread') ? $t('mail.filter.unread') : 'Ulæste' }}
                        <span class="tabular-nums opacity-85" v-if="unreadCount"> {{ unreadCount }}</span>
                    </button>
                </div>
                <div class="relative">
                    <Icon name="ph:magnifying-glass"
                        class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                        aria-hidden="true" />
                    <input v-model="searchInput" type="search"
                        :placeholder="$te('mail.search.placeholder') ? $t('mail.search.placeholder') : 'Søg i mail'"
                        class="w-full h-[34px] pl-8 pr-8 rounded-md border border-gray-300 bg-white text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 transition"
                        @keydown.enter.prevent="runSearch" />
                    <button v-if="searchInput" type="button" @click="clearSearch"
                        class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
                        :aria-label="$te('mail.search.clear') ? $t('mail.search.clear') : 'Ryd søgning'">
                        <Icon name="ph:x" class="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div v-if="state.loading.isEmailsLoading" class="grow flex items-center justify-center text-gray-500 text-sm">
                <span>{{ $t('mail.loading.loadingYourEmails') }}</span>
                <span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span><span
                    class="dot4">.</span><span class="dot5">.</span>
            </div>

            <template v-else>
                <Alert type="danger" :text="state?.error?.message" class="m-3"
                    v-if="state.error?.message && state.error.message.length > 0" />

                <div v-if="!visibleEmails.length"
                    class="grow flex flex-col items-center justify-center text-center text-gray-400 gap-2 px-6">
                    <Icon name="ph:tray" class="h-9 w-9" aria-hidden="true" />
                    <p class="text-sm font-medium text-gray-500">
                        {{ searchTerm
                            ? ($te('mail.search.noResults') ? $t('mail.search.noResults') : 'Ingen beskeder matcher din søgning')
                            : (activeFilter === 'unread'
                                ? ($te('mail.filter.noUnread') ? $t('mail.filter.noUnread') : 'Ingen ulæste beskeder')
                                : $t('mail.inbox')) }}
                    </p>
                </div>

                <div v-else class="grow overflow-y-auto scroll-smooth">
                    <button v-for="(email, emailIndex) in visibleEmails" :key="email?.id ?? emailIndex"
                        :data-uid="email?.id" :style="{ animationDelay: (emailIndex * 40) + 'ms' }"
                        @click="setSelectedEmail(email)"
                        class="mail-row relative w-full text-left grid grid-cols-[38px_1fr] gap-3 px-4 py-3 border-b-0.5 border-gray-300 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40"
                        :class="isSelected(email) ? 'bg-primary/5' : 'hover:bg-gray-50'">
                        <span class="absolute left-0 top-0 bottom-0 w-[3px] transition-colors duration-150" aria-hidden="true"
                            :class="isSelected(email) ? 'bg-primary' : (isUnread(email) ? 'bg-primary/50' : 'bg-transparent')"></span>
                        <img
                            :src="`https://ui-avatars.com/api/?background=205E77&color=fff&bold=true&name=${encodeURIComponent(senderName(email))}`"
                            class="rounded-full w-[38px] h-[38px] object-cover" alt="" />
                        <div class="min-w-0">
                            <div class="flex items-center gap-2">
                                <span class="unread-dot w-1.5 h-1.5 rounded-full bg-primary shrink-0" v-if="isUnread(email)"
                                    aria-hidden="true"></span>
                                <span class="grow truncate text-[13.5px]"
                                    :class="isUnread(email) ? 'font-bold text-gray-900' : 'font-medium text-gray-700'">
                                    {{ senderName(email) }}
                                </span>
                                <span class="shrink-0 text-[11.5px] text-gray-400 tabular-nums">
                                    {{ formatShort(email?.createdDateTime) }}
                                </span>
                            </div>
                            <p class="truncate text-[13px] mt-0.5"
                                :class="isUnread(email) ? 'font-semibold text-gray-900' : 'text-gray-600'">
                                {{ email?.subject }}
                            </p>
                            <p class="truncate text-[12px] text-gray-500 mt-0.5" v-if="email?.bodyPreview">
                                {{ email?.bodyPreview }}
                            </p>
                        </div>
                    </button>

                    <div class="text-center py-3 text-gray-500 text-sm" v-if="state.loading.isEmailsLoadingMore">
                        {{ $t('mail.loading.loadingYourEmails') }}
                        <span class="dot1">.</span><span class="dot2">.</span><span class="dot3">.</span><span
                            class="dot4">.</span><span class="dot5">.</span>
                    </div>
                    <div class="text-center py-3" v-else-if="activeFilter === 'all' && state.nextPageLink">
                        <button
                            class="text-sm font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-2 py-1"
                            @click="fetchEmails(state.nextPageLink)">
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
                        @click="closeSelectedEmail">
                        <Icon name="ph:arrow-left" class="h-4 w-4" aria-hidden="true" />
                        <span>{{ $t('back') }}</span>
                    </button>
                    <h1 class="text-xl font-bold text-gray-900 mb-3 text-balance">
                        {{ state.selectedEmail?.subject }}
                    </h1>
                    <div class="flex items-center gap-3">
                        <img
                            :src="`https://ui-avatars.com/api/?background=205E77&color=fff&bold=true&name=${encodeURIComponent(senderName(state.selectedEmail))}`"
                            class="rounded-full w-10 h-10 object-cover" alt="" />
                        <div class="min-w-0 grow">
                            <p class="text-sm font-semibold text-gray-900 truncate">
                                {{ senderName(state.selectedEmail) }}
                            </p>
                            <p class="text-xs text-gray-500 truncate">
                                {{ state.selectedEmail?.sender?.emailAddress?.address }}
                            </p>
                        </div>
                        <p class="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                            {{ formatDateTimeToReadable(state.selectedEmail?.createdDateTime) }}
                        </p>
                    </div>
                </div>

                <div class="grow overflow-y-auto px-6 py-5">
                    <div class="mail-body" :key="state.selectedEmail?.id"
                        v-html="sanitizeEmailHtml((state.selectedEmail?.body?.content || '').replace(/\n/g, '<br>'))" />

                    <div class="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-dashed border-gray-300"
                        v-if="state.selectedEmail?.attachments?.length">
                        <button v-for="(attachment, attachmentIndex) in state.selectedEmail?.attachments"
                            :key="attachmentIndex" @click="downloadAttachment(attachment?.url)"
                            class="flex items-center gap-2.5 pl-2 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 hover:bg-white hover:border-primary hover:-translate-y-px transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
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
                    <ModulesUserMailEntraReplyRegularMailForm :selectedEmail="state.selectedEmail"
                        @close="state.showReplyForm = false" v-if="state.showReplyForm" />
                    <ModulesUserMailEntraForwardRegularMailForm :selectedEmail="state.selectedEmail"
                        @close="state.showForwardForm = false" v-if="state.showForwardForm" />
                    <div class="flex items-center gap-x-3" v-if="!state.showReplyForm && !state.showForwardForm">
                        <FormButton buttonStyle="primary" class="w-fit rounded-md" @click="state.showReplyForm = true">
                            <Icon name="ph:arrow-bend-up-left" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('mail.reply') }}
                        </FormButton>
                        <FormButton buttonStyle="white" class="w-fit rounded-md" @click="state.showForwardForm = true">
                            <Icon name="ph:arrow-bend-up-right" class="h-4 w-4" aria-hidden="true" />
                            {{ $t('mail.forward') }}
                        </FormButton>
                    </div>
                </div>
            </template>

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

        <ModulesUserMailEntraModalDownloadFile :isModalOpen="state.modal.isDownloadAttachment"
            :selectedAttachment="state.selectedAttachment" @close="state.modal.isDownloadAttachment = false" />
    </div>
</template>

<script setup lang="ts">
import { mailEntraService } from "@/components/api/user/MailEntraService"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'
import { fileHelper } from '@/composables/fileHelper'
import type { Error } from '@/types'

const emit = defineEmits(['setUnreadEmailsCount'])
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { isImage, isExcel, isPdf, isPpt, isWord } = fileHelper()
const { sanitizeEmailHtml } = useSanitizeHtml()

const activeFilter = ref<'all' | 'unread'>('all')

const searchInput = ref('')
const searchTerm = ref('')
let searchTimer: ReturnType<typeof setTimeout> | null = null

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
    nextPageLink: '',
    selectedAttachment: '' as any,
    selectedEmail: null as any,
    showForwardForm: false,
    showReplyForm: false,
    unreadEmails: 0,
    unreadSecuredMessage: 0,
})

const DK_MONTHS = ['jan.', 'feb.', 'mar.', 'apr.', 'maj', 'jun.', 'jul.', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.']

function isUnread(email: any): boolean {
    return !email?.isRead
}

function isSelected(email: any): boolean {
    return !!state.selectedEmail && state.selectedEmail?.id === email?.id
}

const unreadCount = computed(() => state.emails.filter((e: any) => isUnread(e)).length)

const visibleEmails = computed(() => {
    if (activeFilter.value !== 'unread') return state.emails
    return state.emails.filter((e: any) => isUnread(e) || isSelected(e))
})

function senderName(email: any): string {
    const addr = email?.sender?.emailAddress
    if (addr?.name) return addr.name
    if (addr?.address) return addr.address.split('@')[0]
    return ''
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

// Keyboard navigation over the currently visible list.
function moveSelection(delta: number) {
    const list = visibleEmails.value
    if (!list.length) return
    let idx = state.selectedEmail
        ? list.findIndex((e: any) => e?.id === state.selectedEmail?.id)
        : -1
    idx = Math.min(list.length - 1, Math.max(0, idx + delta))
    const email = list[idx]
    if (!email) return
    setSelectedEmail(email)
    nextTick(() => {
        document.querySelector(`.mail-row[data-uid="${email?.id}"]`)?.scrollIntoView({ block: 'nearest' })
    })
}

function onKeydown(ev: KeyboardEvent) {
    const t = ev.target as HTMLElement
    const tag = (t?.tagName || '').toLowerCase()
    if (tag === 'input' || tag === 'textarea' || t?.isContentEditable) return
    if (ev.key === 'ArrowDown') { ev.preventDefault(); moveSelection(1) }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); moveSelection(-1) }
    else if (ev.key === 'Enter' && state.selectedEmail) { ev.preventDefault(); state.showReplyForm = true; state.showForwardForm = false }
}

function runSearch() {
    if (searchTimer) { clearTimeout(searchTimer); searchTimer = null }
    const term = searchInput.value.trim()
    if (term === searchTerm.value) return
    searchTerm.value = term
    fetchEmails(null)
}

function clearSearch() {
    searchInput.value = ''
    if (searchTerm.value !== '') {
        searchTerm.value = ''
        fetchEmails(null)
    }
}

// Debounce typing before hitting the mailbox search.
watch(searchInput, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(runSearch, 350)
})

onMounted(() => {
    fetchEmails(null)
    document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    if (searchTimer) clearTimeout(searchTimer)
})

async function fetchEmails(page: any) {
    state.error = {}
    state.nextPageLink = ''
    if (page === null) {
        state.loading.isEmailsLoading = true
        state.emails = []
        state.selectedEmail = null
    } else {
        state.loading.isEmailsLoadingMore = true
    }
    try {
        const params: any = {
            page: page,
        }
        if (page === null && searchTerm.value) params.search = searchTerm.value
        const response = await mailEntraService.getMails(params)
        if (response?.value) {
            state.emails.push(...response?.value)
            state.nextPageLink = response['@odata.nextLink']
            state.unreadEmails = response?.unread_emails ?? 0
            state.unreadSecuredMessage = response?.unread_secured_emails ?? 0
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

async function setSelectedEmail(email: any) {
    state.selectedEmail = email
    state.showReplyForm = false
    state.showForwardForm = false
    if (!email?.isRead) {
        state.error = {}
        email.isRead = true
        try {
            const response = await mailEntraService.readMail(email?.id)
            if (response) {
                if (state.unreadEmails > 0) {
                    state.unreadEmails--
                    state.unreadEmails = response?.unread_emails ?? 0
                    state.unreadSecuredMessage = response?.unread_secured_emails ?? 0
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

function closeSelectedEmail() {
    state.selectedEmail = null
    state.showReplyForm = false
    state.showForwardForm = false
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

@keyframes rowIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.mail-row { opacity: 0; animation: rowIn 0.4s cubic-bezier(.22,.61,.36,1) forwards; }

@keyframes unreadPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(32,94,119,.4); } 50% { box-shadow: 0 0 0 4px rgba(32,94,119,0); } }
.unread-dot { animation: unreadPulse 2.4s cubic-bezier(.22,.61,.36,1) infinite; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.mail-body { font-size: 14px; line-height: 1.6; color: #2a3948; max-width: 68ch; overflow-wrap: break-word; animation: fadeUp 0.3s cubic-bezier(.22,.61,.36,1); }
.mail-body :deep(img) { max-width: 100%; height: auto; }
.mail-body :deep(a) { color: #205E77; text-decoration: underline; }
.mail-body :deep(table) { max-width: 100%; display: block; overflow-x: auto; }
.mail-body :deep(p) { margin: 0 0 12px; }

@media (prefers-reduced-motion: reduce) {
    .dot1, .dot2, .dot3, .dot4, .dot5,
    .unread-dot, .mail-body { animation: none; }
    .mail-row { opacity: 1; animation: none; }
}
</style>
