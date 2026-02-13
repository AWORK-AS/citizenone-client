<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mail.inbox') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('mail.inbox') }}</template>
            <template #settings>
                <Menu as="div" class="relative inline-block text-left z-20">
                    <div>
                        <MenuButton>
                            <Tooltip :text="$t('mail.settings.settings')">
                                <FormButton buttonStyle="action" class="rounded-lg">
                                    <Icon name="ph:gear" class="h-3 w-3" aria-hidden="true" />
                                </FormButton>
                            </Tooltip>
                        </MenuButton>
                    </div>

                    <transition enter-active-class="transition duration-100 ease-out"
                        enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
                        leave-active-class="transition duration-75 ease-in"
                        leave-from-class="transform scale-100 opacity-100"
                        leave-to-class="transform scale-95 opacity-0">
                        <MenuItems
                            class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                            <div class="px-1 py-1">
                                <MenuItem v-slot="{ active }" @click="state.slideOver.isSignaturesOpen = true">
                                <button :class="[
                                    active && 'bg-gray-100',
                                    'group flex w-full items-center rounded-md px-2 py-2.5 text-sm',
                                ]">
                                    <Icon name="ph:signature" class="mr-2 h-5 w-5" aria-hidden="true" />
                                    {{ $t('mail.settings.signatures.signatures') }}
                                </button>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </template>

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
                                <ModulesUserMailSmtpInbox v-if="state.emailConfiguration?.data?.type === 'smtp'"
                                    @setUnreadEmailsCount="setUnreadEmailsCount" />
                                <ModulesUserMailEntraInbox v-if="state.emailConfiguration?.data?.type === 'entra'"
                                    @setUnreadEmailsCount="setUnreadEmailsCount" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ModulesUserMailModalChooseEmail :isModalOpen="state.modal.isChooseEmailConfiguration" formType="create"
                @close="state.modal.isChooseEmailConfiguration = false" @refreshEmailConfig="fetchEmailConfiguration" />
            <ModulesUserMailModalSendEmail :isModalOpen="state.modal.isSendEmailOpen"
                @close="state.modal.isSendEmailOpen = false" />
            <ModulesUserMailSignatureSignaturesSlideOver :isOpen="state.slideOver.isSignaturesOpen"
                @close="state.slideOver.isSignaturesOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { mailSettingService } from "@/components/api/user/MailSettingService"
import { useUserStore } from '@/store/user'
import { useAlert } from '@/composables/alert'
import { useI18n } from "vue-i18n"
import type { Error } from '@/types'

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
        isSendEmailOpen: false,
    },
    slideOver: {
        isSignaturesOpen: false,
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

function setUnreadEmailsCount(count: any) {
    state.unreadEmails = count.unreadEmails
    state.unreadSecuredMessage = count.unreadSecuredMessage
}
</script>