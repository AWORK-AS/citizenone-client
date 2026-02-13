<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mail.sent') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('mail.sent') }}</template>

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
                        <div class="mt-44 flex items-center justify-center"
                            v-if="state.emailConfiguration?.data?.length === 0">
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
                                <ModulesUserMailSmtpSent v-if="state.emailConfiguration?.data?.type === 'smtp'" />
                                <ModulesUserMailEntraSent v-if="state.emailConfiguration?.data?.type === 'entra'" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModulesUserMailModalChooseEmail :isModalOpen="state.modal.isChooseEmailConfiguration" formType="create"
                @close="state.modal.isChooseEmailConfiguration = false" @refreshEmailConfig="fetchEmailConfiguration" />
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

const runtimeConfig = useRuntimeConfig()
const userStore = useUserStore() as any
const { errorAlert } = useAlert()
const { t } = useI18n()

const state = reactive({
    error: {} as Error,
    emailConfiguration: {} as any,
    loading: {
        isEmailConfigurationLoading: false,
        isUserLoading: true,
    },
    modal: {
        isChooseEmailConfiguration: false,
    },
    unreadEmails: 0,
    unreadSecuredMessage: 0,
})

watch(() => userStore.getUser, (user: any) => {
    if (user) {
        state.loading.isUserLoading = false
        if (!user?.has_mail_access) {
            navigateTo(`/overview`)
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
            state.emailConfiguration = response
        }
    } catch (error: any) {
        state.error = error
    }
    finally {
        state.loading.isEmailConfigurationLoading = false
    }
}
</script>