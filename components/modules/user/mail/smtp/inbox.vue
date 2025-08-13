<template>
    <div class="relative">
        <div style="height: 80vh; overflow-y: auto;">
            <div v-for="(email, emailIndex) in state.emails" :key="emailIndex" :class="[
                email?.flags?.seen === 'Seen' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white hover:bg-gray-100',
                'px-4 py-3 cursor-pointer border-b-0.5 border-gray-300'

            ]" @click="setSelectedEmail(emailIndex, email)">
                <div>
                    <div class="flex justify-end" v-if="email?.flags?.seen !== 'Seen'">
                        <div class="w-2 h-2 rounded-full bg-[#D27B7B]"></div>
                    </div>
                    <div class="flex items-center gap-x-2">
                        <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${email?.header?.from}`"
                            class="rounded-full w-11 h-11 object-cover" />
                        <div class="grow">
                            <p class="text-sm line-clamp-1"
                                v-if="email?.header?.subject && email?.header?.subject?.length > 0">
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
                <button class="text-sm" @click="fetchEmails(parseInt(state.pagination?.current_page) + 1)">
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
                        {{ $t('mail.content.from') }}
                    </p>
                    <p>
                        {{ state.selectedEmail?.header?.from }}
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
            </div>
            <ModulesUserMailReplyRegularMailForm :selectedEmail="state.selectedEmail"
                @close="state.showReplyForm = false" v-if="state.showReplyForm" />
            <ModulesUserMailForwardRegularMailForm :selectedEmail="state.selectedEmail"
                @close="state.showForwardForm = false" v-if="state.showForwardForm" />
            <div class="mt-5 flex items-center gap-x-3" v-if="!state.showReplyForm && !state.showForwardForm">
                <FormButton buttonStyle="primary" class="w-fit rounded-md"
                    @click="state.showReplyForm = !state.showReplyForm">
                    <Icon name="ph:arrow-bend-up-left" size="w-10 h-10" />
                    {{ $t('mail.reply') }}
                </FormButton>
                <FormButton buttonStyle="primary" class="w-fit rounded-md"
                    @click="state.showForwardForm = !state.showForwardForm">
                    <Icon name="ph:arrow-bend-up-right" size="w-10 h-10" />
                    {{ $t('mail.forward') }}
                </FormButton>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { mailSMTPService } from "@/components/api/user/MailSMTPService"
import { useDatetimeFormatter } from '@/composables/datetimeFormatter'

const { formatDateTimeToReadable } = useDatetimeFormatter()

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
        isSendEmailOpen: false,
    },
    pagination: {} as any,
    selectedEmail: null as any,
    showForwardForm: false,
    showOnFirstLoad: false,
    showReplyForm: false,
    unreadEmails: 0,
    unreadSecuredMessage: 0,
})

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
        console.log('test', response)
        if (response?.data) {
            state.emails.push(...response?.data?.data?.sort((a: any, b: any) => new Date(b.header.date).getTime() - new Date(a.header.date).getTime()))
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
    state.selectedEmail = email
    state.showOnFirstLoad = true
    if (email?.flags?.seen !== 'Seen') {
        state.error = {}
        state.emails[emailIndex].flags.seen = 'Seen'
        try {
            const emailUid = email?.header?.uid
            const response = await mailSMTPService.readMail(emailUid)
            if (response) {
                if (state.unreadEmails > 0) {
                    state.unreadEmails--
                }
            }
        } catch (error: any) {
            state.error = error
        }
    }
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