<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mail.mail') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('mail.mail') }}</template>
            <div class="flex items-center justify-center">
                <div v-if="state.loading.isUserLoading" class="mt-44">
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
                    <div v-if="state.loading.isEmailConfigurationLoading" class="mt-44">
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
                        <div class="space-y-8 mt-44" v-if="!state.hasEmailConfiguration">
                            <p>{{ $t('mail.connectYourMessage') }}.</p>
                            <div class="flex justify-center">
                                <FormButton buttonStyle="primary" @click="state.modal.isConnectYourMailOpen = true"
                                    class="rounded-md">
                                    {{ $t('mail.connectYourMail') }}
                                </FormButton>
                            </div>
                        </div>
                        <div v-else>
                            <div v-if="state.loading.isEmailsLoading" class="mt-44">
                                <span class="text-lg">
                                    {{ t('mail.loading.loadingYourEmails') }}
                                </span>
                                <span class="dot1">.</span>
                                <span class="dot2">.</span>
                                <span class="dot3">.</span>
                                <span class="dot4">.</span>
                                <span class="dot5">.</span>
                            </div>
                            <div v-else>
                                {{ state.emails }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModulesUserMailModalConfigureEmail :isModalOpen="state.modal.isConnectYourMailOpen" formType="create"
                @close="state.modal.isConnectYourMailOpen = false" />
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

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { errorAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    hasEmailConfiguration: false,
    loading: {
        isEmailConfigurationLoading: false,
        isEmailsLoading: false,
        isUserLoading: true,
    },
    emails: [],
    modal: {
        isConnectYourMailOpen: false,
    },
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
            console.log('test', response?.data?.id)
            if (response?.data?.id) {
                state.hasEmailConfiguration = true
                fetchMails()
            }
        }
    } catch (error: any) {
        state.error = error
    }
    finally {
        state.loading.isEmailConfigurationLoading = false
    }
}

async function fetchMails() {
    state.error = {}
    state.loading.isEmailsLoading = true
    try {
        const response = await mailService.getMails()
        if (response?.data) {
            state.emails = response?.data
        }
    } catch (error: any) {
        state.error = error
    }
    state.loading.isEmailsLoading = false
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