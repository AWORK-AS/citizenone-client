<template>
    <div>
        <NuxtLayout name="user">

            <Head>
                <Title>{{ $t('mail.mail') }} - {{ runtimeConfig?.public?.appName }}</Title>
            </Head>

            <template #header>{{ $t('mail.mail') }}</template>

            <div class="flex items-center justify-center mt-44">
                <div class="space-y-8">
                    <p>{{ $t('mail.connectYourMessage') }}.</p>
                    <div class="flex justify-center">
                        <FormButton buttonStyle="primary" @click="state.modal.isConnectYourMailOpen = true"
                            class="rounded-md">
                            {{ $t('mail.connectYourMail') }}
                        </FormButton>
                    </div>
                </div>
            </div>
            <ModulesUserMailModalConfigureEmail :isModalOpen="state.modal.isConnectYourMailOpen" formType="create"
                @close="state.modal.isConnectYourMailOpen = false" />
        </NuxtLayout>
    </div>
</template>

<script setup lang="ts">
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
    isPageLoading: false,
    modal: {
        isConnectYourMailOpen: false,
    },
})

watch(() => userStore.getUser, (user: any) => {
    if (user) {
        if (!user?.is_secure_mail_active) {
            navigateTo(`/daily-overview`)
            errorAlert(`${t('alert.somethingWentWrong')}!`, `${t('youDontHaveAccessToThisPage')}.`)
        }
    }
})
</script>