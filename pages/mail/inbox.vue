<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mail.mail') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('mail.mail') }}</template>
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
                            <div class="flex gap-x-6">
                                <ModulesUserMailSidebar />
                                <div class="grow mt-44 flex items-center justify-center"
                                    v-if="state.loading.isEmailsLoading">
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
                                    <div class="grid grid-cols-6 gap-x-4">
                                        <div class="col-span-2 rounded-md space-y-3">
                                            <div v-for="(email, index) in state.emails" :key="index"
                                                class="px-4 py-3 cursor-pointer rounded-md shadow-sm bg-gray-100 hover:bg-gray-200"
                                                @click="setSelectedEmail(email)">
                                                <div class="flex justify-between gap-2">
                                                    <div>
                                                        <div class="flex items-center gap-x-2">
                                                            <img :src="`https://ui-avatars.com/api/?background=42AED9&color=fff&name=${email?.from}`"
                                                                class="rounded-full w-11 h-11 object-cover" />
                                                            <div>
                                                                <p class="text-xs">{{ email?.from }}</p>
                                                                <p class="text-sm"
                                                                    v-if="email?.subject && email?.subject?.length > 0">
                                                                    {{ email?.subject }}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="flex flex-col items-end justify-end">
                                                        <Tooltip :text="`Secured`" v-if="email?.is_secure_mail">
                                                            <Icon name="ic:baseline-security"
                                                                class="h-4 w-4 text-primary" aria-hidden="true" />
                                                        </Tooltip>
                                                        <p class="text-xs">
                                                            {{ formatDateTimeToReadable(email?.date) }}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-span-4 bg-white px-6 py-8 rounded-md">
                                            <div v-if="state.selectedEmail">
                                                <div class="flex gap-1 text-sm">
                                                    <p>
                                                        {{ t('mail.content.from') }}
                                                    </p>
                                                    <p>
                                                        {{ state.selectedEmail?.from }}
                                                    </p>
                                                    <p class="lowercase">
                                                        {{ t('mail.content.on') }}
                                                    </p>
                                                    <p>
                                                        {{ formatDateTimeToReadable(state.selectedEmail?.date) }}
                                                    </p>
                                                </div>
                                                <div v-html="state.selectedEmail?.body" class="py-6" />
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
let currentPage = 1

const state = reactive({
    error: {} as Error,
    emails: [] as any,
    hasEmailConfiguration: false,
    loading: {
        isEmailConfigurationLoading: false,
        isEmailsLoading: false,
        isUserLoading: true,
    },
    modal: {
        isConnectYourMailOpen: false,
        isSendEmailOpen: false,
    },
    selectedEmail: null as any,
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
                fetchEMails()
            }
        }
    } catch (error: any) {
        state.error = error
    }
    finally {
        state.loading.isEmailConfigurationLoading = false
    }
}

async function fetchEMails() {
    state.error = {}
    state.loading.isEmailsLoading = true
    try {
        const params = {
            page: currentPage,
        }
        const response = await mailService.getMails(params)
        if (response?.data) {
            state.emails = response?.data
        }
    } catch (error: any) {
        state.error = error
    } finally {
        state.loading.isEmailsLoading = false
    }
}

function setSelectedEmail(email: any) {
    state.selectedEmail = email
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
</style>