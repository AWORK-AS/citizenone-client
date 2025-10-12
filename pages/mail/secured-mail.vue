<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mail.secured.securedMail') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('mail.secured.securedMail') }}</template>

            <Alert type="danger" :text="state?.error?.message"
                v-if="state.error?.message && state.error.message.length > 0" />

            <div>
                <div v-if="state.loading.isUserLoading" class="mt-44 flex items-center justify-center">
                    <span class="text-lg">
                        {{ t('mail.loading.loadingUserSettings') }}
                    </span>
                    <span class="dot1">.</span>
                    <span class="dot2">.</span>
                    <span class="dot3">.</span>
                    <span class="dot4">.</span>
                    <span class="dot5">.</span>
                </div>
                <div v-else>
                    <div v-if="state.loading.isEmailConfigurationLoading"
                        class="mt-44 flex items-center justify-center">
                        <span class="text-lg">
                            {{ t('mail.loading.loadingEmailConfigurations') }}
                        </span>
                        <span class="dot1">.</span>
                        <span class="dot2">.</span>
                        <span class="dot3">.</span>
                        <span class="dot4">.</span>
                        <span class="dot5">.</span>
                    </div>
                    <div v-else>
                        <div class="mt-44 flex items-center justify-center" v-if="!state.hasEmailConfiguration">
                            <div class="space-y-6">
                                <p>{{ $t('mail.connectYourMessage') }}.</p>
                                <div class="flex justify-center">
                                    <FormButton buttonStyle="primary"
                                        @click="state.modal.isChooseEmailConfiguration = true" class="rounded-md">
                                        {{ $t('mail.connectYourMail') }}
                                    </FormButton>
                                </div>
                            </div>
                        </div>
                        <div v-else>
                            <div class="flex bg-white rounded-tr-md rounded-br-md">
                                <ModulesUserMailSidebar :unreadMessage="state.unreadEmails"
                                    :unreadSecuredMessage="state.unreadSecuredMessage" />
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
                                            <div v-for="(email, emailIndex) in state.emails" :key="emailIndex" :class="[
                                                email?.is_read ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white hover:bg-gray-100',
                                                'px-4 py-3 cursor-pointer border-b-0.5 border-gray-300'

                                            ]" @click="setSelectedEmail(emailIndex, email)">
                                                <div>
                                                    <div class="flex items-center gap-x-2">
                                                        <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${email?.email}`"
                                                            class="rounded-full w-11 h-11 object-cover" />
                                                        <div class="grow">
                                                            <div class="flex justify-between gap-3">
                                                                <p class="text-xs">
                                                                    {{ email?.email }}
                                                                </p>
                                                                <div class="flex justify-end" v-if="!email?.is_read">
                                                                    <div class="w-2 h-2 rounded-full bg-[#D27B7B]">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p class="text-xs line-clamp-1"
                                                                v-if="email?.subject && email?.subject?.length > 0">
                                                                {{ email?.subject }}
                                                            </p>
                                                            <p class="text-sm line-clamp-1">
                                                                {{ email?.message }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p class="text-xs text-right">
                                                    {{ formatDateTimeToReadable(email?.created_at) }}
                                                </p>
                                            </div>
                                            <div class="text-center py-3 text-gray-500 text-sm"
                                                v-if="state.loading.isEmailsLoadingMore">
                                                {{ $t('mail.loading.loadingYourEmails') }}
                                                <span class="dot1">.</span>
                                                <span class="dot2">.</span>
                                                <span class="dot3">.</span>
                                                <span class="dot4">.</span>
                                                <span class="dot5">.</span>
                                            </div>
                                            <div class="text-center py-3" v-else
                                                v-if="state.pagination?.next_page_url !== null">
                                                <button class="text-sm"
                                                    @click="fetchEmails(parseInt(state.pagination?.current_page) + 1)">
                                                    {{ $t('mail.loadMore') }}
                                                </button>
                                            </div>
                                        </div>
                                        <div v-if="state.showOnFirstLoad" :class="[
                                            state.selectedEmail && 'slide-from-right',
                                            !state.selectedEmail && 'slide-to-right',
                                            'absolute top-0 left-0 h-full w-full bg-white rounded-md overflow-x-scroll divide-y divide-gray-100'
                                        ]">
                                            <div class="px-6 py-4">
                                                <button class="flex items-center gap-x-2"
                                                    @click="state.selectedEmail = null">
                                                    <Icon name="ph:arrow-left" size="20" class="text-black" />
                                                    <span>{{ $t('back') }}</span>
                                                </button>
                                                <div class="mt-3 space-y-3">
                                                    <div>
                                                        <p class="text-sm">
                                                            {{
                                                                formatDateTimeToReadable(state.selectedEmail?.created_at)
                                                            }}
                                                        </p>
                                                        <p class="text-lg font-semibold">
                                                            {{ state.selectedEmail?.subject }}
                                                        </p>
                                                        <p>
                                                            {{ $t('mail.secured.from') }}:
                                                            {{ state?.selectedEmail?.sender?.firstname }}
                                                            {{ state?.selectedEmail?.sender?.lastname }}
                                                            {{ state?.selectedEmail?.from }}
                                                        </p>
                                                        <div class="flex items-center gap-x-1">
                                                            <p>
                                                                {{ $t('mail.secured.to') }}:
                                                            </p>
                                                            <div class="text-xxs flex flex-wrap gap-1">
                                                                <span
                                                                    v-for="(receipient, index) in state?.selectedEmail?.receipient_emails"
                                                                    :key=index
                                                                    class="bg-primary px-2 py-1 text-white rounded-md">
                                                                    {{ receipient }}
                                                                </span>
                                                            </div>
                                                            <p>
                                                                {{ state?.selectedEmail?.to }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div v-html="state.selectedEmail?.message" />
                                                    <p class="flex items-center gap-x-1 text-xs">
                                                        <span>
                                                            {{ $t('mail.secured.sent.sentWith') }}
                                                        </span>
                                                        <span class="text-primary">
                                                            {{ $t('mail.secured.sent.citizenOneMail') }}
                                                        </span>
                                                        <span class="lowercase">
                                                            {{ $t('mail.secured.sent.viaSecuredMail') }}.
                                                        </span>
                                                    </p>
                                                </div>
                                                <ModulesUserMailReplySecuredMailForm
                                                    :selectedEmail="state.selectedEmail"
                                                    @close="state.showReplyForm = false" v-if="state.showReplyForm" />
                                                <div class="mt-5 flex items-center" v-else>
                                                    <FormButton buttonStyle="primary" class="w-fit rounded-md"
                                                        @click="state.showReplyForm = !state.showReplyForm">
                                                        <Icon name="ph:arrow-bend-up-left" size="w-10 h-10" />
                                                        {{ $t('mail.reply') }}
                                                    </FormButton>
                                                </div>
                                            </div>
                                            <div class="space-y-3 px-6 py-4"
                                                v-for="(history, historyIndex) in state.selectedEmail?.history"
                                                :key="historyIndex">
                                                <div>
                                                    <p class="text-sm">
                                                        {{ formatDateTimeToReadable(history?.created_at) }}
                                                    </p>
                                                    <p>
                                                        {{ $t('mail.secured.from') }}:
                                                        {{ history?.from }}
                                                    </p>
                                                    <div class="flex items-center gap-x-1">
                                                        <p>
                                                            {{ $t('mail.secured.to') }}:
                                                        </p>
                                                        <div>
                                                            {{ history?.recipient_emails?.join('; ') }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div v-html="history?.message"></div>
                                                <div class="flex flex-wrap items-center gap-2">
                                                    <div v-for="(attachment, attachmentIndex) in history?.attachments"
                                                        :index="attachmentIndex"
                                                        class="border border-gray-200 rounded-sm">
                                                        <div class="cursor-pointer flex items-center gap-x-2 p-2"
                                                            @click="downloadAttachment(attachment)">
                                                            <div class="flex items-center" v-if="isPdf(attachment)">
                                                                <Icon name="ph:file-pdf" class="h-5 w-5 text-red-600"
                                                                    aria-hidden="true" />
                                                            </div>
                                                            <div class="flex items-center"
                                                                v-else-if="isWord(attachment)">
                                                                <Icon name="ph:file-doc" class="h-5 w-5 text-blue-600"
                                                                    aria-hidden="true" />
                                                            </div>
                                                            <div class="flex items-center"
                                                                v-else-if="isExcel(attachment)">
                                                                <Icon name="ph:file-xls" class="h-5 w-5 text-green-600"
                                                                    aria-hidden="true" />
                                                            </div>
                                                            <div class="flex items-center"
                                                                v-else-if="isPpt(attachment)">
                                                                <Icon name="ph:file-ppt" class="h-5 w-5 text-purple-600"
                                                                    aria-hidden="true" />
                                                            </div>
                                                            <div class="flex items-center"
                                                                v-else-if="isImage(attachment)">
                                                                <Icon name="ph:file-image"
                                                                    class="h-5 w-5 text-yellow-600"
                                                                    aria-hidden="true" />
                                                            </div>
                                                            <div class="flex items-center" v-else>
                                                                <Icon name="ph:file" class="h-5 w-5 text-gray-600"
                                                                    aria-hidden="true" />
                                                            </div>
                                                            <p class="text-xs">
                                                                {{ attachment?.split('/').pop() }}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p class="flex items-center gap-x-1 text-xs">
                                                    <span>
                                                        {{ $t('mail.secured.sent.sentWith') }}
                                                    </span>
                                                    <span class="text-primary">
                                                        {{ $t('mail.secured.sent.citizenOneMail') }}
                                                    </span>
                                                    <span class="lowercase">
                                                        {{ $t('mail.secured.sent.viaSecuredMail') }}.
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModulesUserMailModalChooseEmail :isModalOpen="state.modal.isChooseEmailConfiguration" formType="create"
                @close="state.modal.isChooseEmailConfiguration = false" />
            <ModulesUserMailModalSendEmail :isModalOpen="state.modal.isSendEmailOpen"
                @close="state.modal.isSendEmailOpen = false" />
            <ModulesUserSecuredMailModalDownloadFile :isModalOpen="state.modal.isDownloadAttachment"
                :selectedAttachment="state.selectedAttachment" @close="state.modal.isDownloadAttachment = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { mailSMTPService } from "@/components/api/user/MailSMTPService"
import { mailSettingService } from "@/components/api/user/MailSettingService"
import type { Error } from '@/types'
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { formatDateTimeToReadable } = useDatetimeFormatter()
const { errorAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    emails: [] as any,
    hasEmailConfiguration: false,
    loading: {
        isEmailConfigurationLoading: false,
        isEmailsLoading: false,
        isEmailsLoadingMore: false,
        isUserLoading: true,
    },
    modal: {
        isChooseEmailConfiguration: false,
        isDownloadAttachment: false,
        isSendEmailOpen: false,
    },
    pagination: {} as any,
    selectedAttachment: '' as any,
    selectedEmail: null as any,
    showOnFirstLoad: false,
    showReplyForm: false,
    unreadEmails: 0,
    unreadSecuredMessage: 0,
})

watch(() => userStore.getUser, (user: any) => {
    if (user) {
        state.loading.isUserLoading = false
        if (!user?.is_secure_mail_active) {
            navigateTo(`/daily-overview`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        } else {
            fetchEmailConfiguration()
        }
    }
})

watch(() => state.modal.isChooseEmailConfiguration, (isChooseEmailConfiguration: boolean) => {
    if (!isChooseEmailConfiguration) {
        fetchEmailConfiguration()
    }
})

async function fetchEmailConfiguration() {
    state.error = {}
    state.loading.isEmailConfigurationLoading = true
    try {
        const response = await mailSettingService.getMailSettings()
        if (response) {
            if (response?.data?.id) {
                state.hasEmailConfiguration = true
                fetchEmails(1)
            }
        }
    } catch (error: any) {
        state.error = error
    }
    finally {
        state.loading.isEmailConfigurationLoading = false
    }
}

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
        const response = await mailSMTPService.getSecuredMails(params)
        if (response?.data) {
            state.emails.push(...response?.data?.data)
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

async function setSelectedEmail(emailIndex: any, email: any) {
    state.showOnFirstLoad = true
    state.selectedEmail = email
    if (!state.emails[emailIndex].is_read) {
        state.emails[emailIndex].is_read = true
        state.error = {}
        try {
            const emailUuid = email?.uuid
            const response = await mailSMTPService.readSecuredMail(emailUuid)
            if (response) {
                if (state.unreadSecuredMessage > 0) {
                    state.unreadSecuredMessage--
                }
            }
        } catch (error: any) {
            state.error = error
        }
    }
}

function getFileExtension(url: string): string {
    const fileName = url.split('/').pop() // Extract file name from URL
    if (fileName) {
        const ext = fileName.split('.').pop()?.toLowerCase() // Get the file extension
        return ext || ''
    }
    return ''
}

function isPdf(url: string): boolean {
    return getFileExtension(url) === 'pdf'
}

function isWord(url: string): boolean {
    const ext = getFileExtension(url)
    return ext === 'docx' || ext === 'doc'
}

function isExcel(url: string): boolean {
    const ext = getFileExtension(url)
    return ext === 'xlsx' || ext === 'xls'
}

function isPpt(url: string): boolean {
    const ext = getFileExtension(url)
    return ext === 'pptx' || ext === 'ppt'
}

function isImage(url: string): boolean {
    const ext = getFileExtension(url)
    return ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
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