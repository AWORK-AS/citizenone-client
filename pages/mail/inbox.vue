<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mail.inbox') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('mail.inbox') }}</template>

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
                                    <FormButton buttonStyle="primary" @click="state.modal.isConnectYourMailOpen = true"
                                        class="rounded-md">
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
                                                email?.flags?.seen === 'Seen' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white hover:bg-gray-100',
                                                'px-4 py-3 cursor-pointer border-b-0.5 border-gray-100'

                                            ]" @click="setSelectedEmail(emailIndex, email)">
                                                <div>
                                                    <div class="flex justify-end" v-if="email?.flags?.seen !== 'Seen'">
                                                        <div class="w-2 h-2 rounded-full bg-[#D27B7B]"></div>
                                                    </div>
                                                    <div class="flex items-center gap-x-2">
                                                        <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${email?.from}`"
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
                                            <div class="text-center mt-3 text-gray-500 text-sm"
                                                v-if="state.loading.isEmailsLoadingMore">
                                                {{ $t('mail.loading.loadingYourEmails') }}
                                                <span class="dot1">.</span>
                                                <span class="dot2">.</span>
                                                <span class="dot3">.</span>
                                                <span class="dot4">.</span>
                                                <span class="dot5">.</span>
                                            </div>
                                            <div class="text-center mt-3" v-else
                                                v-if="parseInt(state.pagination?.current_page) < parseInt(state.pagination?.last_page)">
                                                <button class="text-sm"
                                                    @click="fetchEmails(parseInt(state.pagination?.current_page) + 1)">
                                                    {{ $t('mail.loadMore') }}
                                                </button>
                                            </div>
                                        </div>
                                        <div v-if="state.showOnFirstLoad" :class="[
                                            state.selectedEmail && 'slide-from-right',
                                            !state.selectedEmail && 'slide-to-right',
                                            'absolute top-0 left-0 h-full w-full bg-white px-6 py-4 rounded-md overflow-x-scroll'
                                        ]">
                                            <button class="flex items-center gap-x-2"
                                                @click="state.selectedEmail = null">
                                                <Icon name="ph:arrow-left" size="20" class="text-black" />
                                                <span>{{ $t('back') }}</span>
                                            </button>
                                            <div class="mt-3">
                                                <p class="text-lg font-semibold">
                                                    {{ state.selectedEmail?.header?.subject }}
                                                </p>
                                                <div class="flex-wrap md:flex gap-1 text-sm">
                                                    <p>
                                                        {{ t('mail.content.from') }}
                                                    </p>
                                                    <p>
                                                        {{ state.selectedEmail?.header?.from }}
                                                    </p>
                                                    <p class="lowercase">
                                                        {{ t('mail.content.on') }}
                                                    </p>
                                                    <p>
                                                        {{
                                                            formatDateTimeToReadable(state.selectedEmail?.header?.date)
                                                        }}
                                                    </p>
                                                </div>
                                                <div v-html="state.selectedEmail?.bodies?.html" class="py-6" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModulesUserMailModalConfigureEmail :isModalOpen="state.modal.isConnectYourMailOpen" formType="create"
                @close="state.modal.isConnectYourMailOpen = false" />
            <ModulesUserMailModalSendEmail :isModalOpen="state.modal.isSendEmailOpen"
                @close="state.modal.isSendEmailOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { mailService } from "@/components/api/user/MailService"
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
        isConnectYourMailOpen: false,
        isSendEmailOpen: false,
    },
    pagination: {} as any,
    selectedEmail: null as any,
    showOnFirstLoad: false,
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

watch(() => state.modal.isConnectYourMailOpen, (isConnectYourMailOpen: boolean) => {
    if (!isConnectYourMailOpen) {
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
        const response = await mailService.getMails(params)
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
        //     state.error = {}
        //     try {
        //         const emailUuid = email?.uuid
        //         const response = await mailService.readMail(emailUuid)
        //         if (response) {
        state.emails[emailIndex].flags.seen = 'Seen'
        if (state.unreadEmails > 0) {
            state.unreadEmails--
        }
        //         }
        //     } catch (error: any) {
        //         state.error = error
        //     }
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