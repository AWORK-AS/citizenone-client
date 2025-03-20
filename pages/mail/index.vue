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

const runtimeConfig = useRuntimeConfig()

const state = reactive({
    error: {} as Error,
    isPageLoading: false,
    modal: {
        isConnectYourMailOpen: false,
    },
})
</script>